/// <reference path="../../../typings/tsd.d.ts" />

import {debug, error, info, log, warn} from 'winston';
import {Request, Response, Router} from 'express';
import {status, auth, json} from '../../common/fetch';
import {Controller as UserController} from '../controllers/user';

var fetch = require('node-fetch');

export var authRouter = Router();
authRouter.get('/logout',
           (req: Request, res: Response, next: Function) => {
             req.user = null;
             res.status(200)
                .json({ token: null, user: null });
           });

authRouter.post('/login/with/:username/and/:password',
            (req: Request, res: Response, next: Function) => {
               req.checkParams('username', 'username is required').notEmpty();
               req.checkParams('password', 'password is required').notEmpty();

               var errors = <Array<string>> req.validationErrors(false);
               if ((errors!=null) &&
                   (errors.length>0)) {
                 res.status(400)
                    .json(errors);
               } else {
                 UserController.login(req.params.username,
                                      req.params.password,
                                      (result) => {
                                        res.status(result.status)
                                           .json(result.content);
                                      });
                 /*
                 // Make fetch call to Auth Service REST
                 fetch('http://localhost:3000/api/auth/login/with/labtech/and/labtech1',
                       {
                         method: 'POST',
                         headers: {
                         },
                         body: ''
                       }).then(status)
                         .then(auth)
                         .then(json)
                         .then((response) => {
                               res.status(200)
                                  .send(response);
                               })
                         .catch((e) => {
                                  console.log(e);
                                });
                 */
               }
             });

authRouter.get('/logout',
  (req: Request, res: Response, next: Function) => {
    req.user = null;
    res.status(200)
       .json({ token: null, user: null });
  });

