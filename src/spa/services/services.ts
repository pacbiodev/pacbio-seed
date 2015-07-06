/// <reference path="../../../typings/tsd.d.ts" />

import {namesListInjectables} from './NameListService';
import {toDoInjectables} from './ToDoService';


export var appServicesInjectables: Array<any> =
[
  namesListInjectables,
  toDoInjectables
];
