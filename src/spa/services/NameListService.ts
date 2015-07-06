/// <reference path="../../../typings/tsd.d.ts" />

import {bind} from "angular2/angular2";

export class NamesListService {
  names = ['Dijkstra', 'Knuth', 'Turing', 'Hopper'];

  get() {
    return this.names;
  }
  add(value: string) {
    this.names.push(value);
  }
}

export var namesListInjectables = [
  bind(NamesListService).toClass(NamesListService)
];