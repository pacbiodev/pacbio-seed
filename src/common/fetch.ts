/// <reference path="../../typings/tsd.d.ts" />

import {HttpHeaders} from './extensions/extensions';

export function status(response) {
  if ((response.status >= 200) &&
      (response.status < 300)) {
    return Promise.resolve(response);
  }
  return response.text()
                 .then((text) => {
                          throw new Error(text);
                        });
}

export function auth(response, callback) {
  var headers: HttpHeaders = response.headers;
  var auth = headers.authorization;
  if (!Object.isNullOrUndefined(auth)) {
    callback(JSON.parse(auth));
  }

  return response;
}

export function text(response) {
  return response.text();
}

export function json(response) {
  return response.json();
}
