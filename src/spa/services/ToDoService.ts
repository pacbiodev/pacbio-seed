/// <reference path="../../../typings/tsd.d.ts" />

import {bind, Inject} from 'angular2/angular2';
import {ListWrapper} from 'angular2/src/facade/collection';

// base model for RecordStore
export class KeyModel {
  constructor(public key: number) {
  }
}

export class ToDoItem extends KeyModel {
  constructor(key: number, public title: string, public completed: boolean, public created: Date) {
    super(key);
  }
}

export class ToDoFactory {
  private _uid: number = 0;
  private nextUid(): number { return ++this._uid; }

  create(title: string, isCompleted: boolean): ToDoItem {
    return new ToDoItem(this.nextUid(), title, isCompleted, new Date());
  }
}

export enum FilterByTypes {
  all,
  active,
  completed
}

// Store manages any generic item that inherits from KeyModel
export class ToDoService {
  private _lastFilterBy: FilterByTypes = FilterByTypes.all;
  private _list: List<KeyModel> = [];
  list: List<KeyModel> = <List<KeyModel>> [];

  filter(filterBy: FilterByTypes): void {
    this._lastFilterBy = filterBy;
    this.list = ListWrapper.filter(this._list,
                                   (item) => (filterBy == FilterByTypes.all) ||
                                             ((filterBy == FilterByTypes.active) && (!item.completed)) ||
                                             ((filterBy == FilterByTypes.completed) && (item.completed)));
  }

  add(record: KeyModel): void {
    this._list.push(record);
    this.filter(this._lastFilterBy);
  }

  remove(record: KeyModel): void {
    this._spliceOut(record);
    this.filter(this._lastFilterBy);
  }

  removeBy(callback: Function): void {
    var records = ListWrapper.filter(this._list, callback);
    ListWrapper.removeAll(this._list, records);
    this.filter(this._lastFilterBy);
  }

  private _spliceOut(record: KeyModel) {
    var i = this._indexFor(record);
    if (i > -1) {
      return ListWrapper.splice(this._list, i, 1)[0];
    }
    return null;
  }

  private _indexFor(record: KeyModel) {
    return this._list.indexOf(record);
  }
}

export var toDoInjectables = [
  bind(ToDoFactory).toClass(ToDoFactory),
  bind(ToDoService).toClass(ToDoService)
];
