/// <reference path="../../../typings/tsd.d.ts" />

import {Inject, Component, View, NgFor} from 'angular2/angular2';

import {NamesListService} from '../services/NameListService';

@Component({
  selector: 'about',
})
@View({
  templateUrl: '../templates/html/about.html',
  directives: [NgFor]
})
export class About {
  public list: NamesListService;
  constructor(@Inject(NamesListService) list: NamesListService) {
    this.list = list;
  }
  addName(newname) {
    this.list.add(newname.value);
    newname.value = '';
  }
}