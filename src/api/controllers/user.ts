/// <reference path="../../../typings/tsd.d.ts" />import {debug, error, info, log, warn} from 'winston';import {Request, Response} from 'express';import {InvalidCredentialsError} from '../../common/error';import ExpressValidator = require('express-validator');import {Context, Token, create as createJwt} from '../../common/jwt';import {User, IUser} from '../models/user';var Async = require('async');var BCrypt = require('bcryptjs');var Fs = require('fs-extra');var Ldap = require('ldapjs');var Moment = require('moment');Ldap.Attribute.settings.guid_format = Ldap.GUID_FORMAT_B;declare var config;export module Controller {  export function login(userName:string,                        password:string,                        callback:Function) {    var isAuthenticated = false;    var user = null;    Async.series([(done: Function) => {                  ldapLogin(userName,                            password,                            (err:Error, ldapUser: Object) => {                              user = ldapUser;                              isAuthenticated = (user!=null);                              done();                            });                  },                  (done:Function) => {                    if (!isAuthenticated) {                      cachedLogin(userName,                                  password,                                  (err: Error, token: Token, cachedUser: Context) => {                                    if (token && cachedUser) {                                      var token = createJwt(cachedUser);                                      callback({ status: 200, content: { token: token, user: cachedUser } });                                    } else {                                      callback({ status: 400, content: err });                                    }                                    done();                                  })                    } else {                      updateCachedLogin(user,                                        password,                                        (err: Error, token: Token, cachedUser: Context) => {                                          if (token && cachedUser) {                                            // var token = createJwt(cachedUser);                                            callback({ status: 200, content: { token: token, user: cachedUser } });                                          } else {                                            callback({ status: 400, content: err });                                          }                                          done();                                        });                    }                  }]);  }  export function ldapLogin(userName: string,                            password: string,                            callback: Function): void {    info('Logging in using LDAP.');    var client = Ldap.createClient({ url: 'ldap://%s:%d'.sprintf(config.app.ldap_hostname,                                                                 config.app.ldap_port) });    var options = {      filter: '(sAMAccountName=' + userName + ')',      scope: 'sub',      attributes: [ 'cn',                    'displayName',                    'givenName',                    'mail',                    'sAMAccountName',                    'sn' ]    };    var user;    // Lookup user by Sam Account    client.search('CN=Users,DC=nanofluidics,DC=com',                  options,                  (err, search) => {                    if (err) {                      error(err.stack);                      return callback(err, null);                    } else {                      search.on('searchEntry',                                (entry) => {                                  user = entry.object;                                  user.userName = user.sAMAccountName;                                  info('%s\n%s', user.sAMAccountName, user.objectGUID);                                });                      search.on('error',                        (err) => {                          error(err.stack);                          return callback(err, null);                        });                      search.on('end',                                (result) => {                                  info('Result: %s', result.status);                                  if (user != null)                                    client.bind(user.cn,                                                password,                                                (err) => {                                                  client.unbind((unbindErr) => {                                                                  if (unbindErr) {                                                                    error('Non fatal error while unbinding LDAP.');                                                                  }                                                                });                                                  if (err) {                                                    user = null;                                                    if (err.name === 'InvalidCredentialsError') {                                                      err = new InvalidCredentialsError();                                                    }                                                  }                                                  callback(err, user);                                                });                                });                    }      });  }  export function cachedLogin(userName:string,                              password:string,                              callback:Function) {    info('Falling back to loging in using cached users.');    User.findOne({ userName: userName },                  (err: Error, user: IUser) => {                   var token:Token = null,                       context = null;                   if (!user) {                     err = new InvalidCredentialsError();                   } else {                     if (!BCrypt.compareSync(password,                                             user.password)) {                       err = new InvalidCredentialsError();                     } else {                       context = new Context(user._id.toString(),                                             user.userName,                                             user.email,                                             user.firstName,                                             user.lastName,                                             user.modified);                       token = createJwt(context);                      }                    }                    callback(err, token, context);                 });  }  export function updateCachedLogin(ldapUser:any,                                    password:string,                                    callback:Function):void {    info('Updating cached login.');    // Authenticated with LDAP, update local user store    User.findOneAndUpdate({                            userName: ldapUser.sAMAccountName                          }, {                            userName: ldapUser.sAMAccountName,                            email: ldapUser.mail || String.EMPTY,                            password: BCrypt.hashSync(password, 10),                            firstName: ldapUser.givenName,                            lastName: ldapUser.sn,                            modified: new Date()                           }, {                             upsert: true                           },                           (err: any, user: IUser) => {                             if (err) {                               error(err.stack);                             }                             var token:Token = null,                                 context = null;                             if (user) {                               context = new Context(user._id.toString(),                                                     user.userName,                                                     user.email,                                                     user.firstName,                                                     user.lastName,                                                     user.modified);                               token = createJwt(context);                             }                             callback(err, token, context);                           });  }  export function getUsers(req: Request, res: Response) {    User.find({},              (err: any, users: Array<IUser>) => {                if (err) {                 error(err.stack);                 res.status(400)                    .json(err.stack);                } else {                 res.status(200)                    .json(users || [ ]);                }              });  }  export function getUser(req, res) {    User.findById(req.params.id,                  'userName email firstName lastName modified',                  (err:any, user: IUser) => {                    if (err) {                      error(err.stack);                      res.status(400)                         .json(err.stack);                    } else {                      // TODO: Hack, need to get mongoose instance methods working                      user['_doc'].id = user._id;                      delete user['_doc']._id;                      res.status(200)                         .json(user);                    }                  });  }  export function userExists(user: IUser,                             data: Object,                             callback: Function): void {  }}