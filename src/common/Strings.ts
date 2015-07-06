/// <reference path="../../typings/tsd.d.ts" />

import {readFileSync} from 'fs-extra';
import {join, resolve} from 'path';

// Include these files
require('../public/lib/object.js');
require('../public/lib/string.js');

export interface IStringMap {
  [key:string]:string;
}

export class Strings implements IStringMap {
  [key:string]:string;

  private __filename__:string;
  constructor(private __category__:string) {
    // Load list from strings file
    this.__filename__ = resolve(__dirname, '../strings/en-us/%s.strings'.sprintf(__category__));
    var strings = readFileSync(this.__filename__, "utf8");
    var list = JSON.parse(strings);

    for (var key in list) {
      this[key] = list[key];
    }
  }
}

export class ApplicationStrings extends Strings {
  constructor() {
    super('app');
  }
}

export class ErrorStrings extends Strings {
  constructor() {
    super('error');
  }
}

export var messages = new ApplicationStrings();
export var errors = new ErrorStrings();
