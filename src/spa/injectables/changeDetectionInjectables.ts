/// <reference path="../../../typings/tsd.d.ts" />
import {ChangeDetection, JitChangeDetection} from 'angular2/change_detection';
import {bind} from 'angular2/di';

export var changeDetectionInjectables = [
  bind(ChangeDetection).toClass(JitChangeDetection)
];
