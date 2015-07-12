/// <reference path="../../../typings/tsd.d.ts" />

var document: any = window.document;

import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/angular2';
import {bind} from 'angular2/di';

export var hasShadowDom = Boolean(document && document.body && document.body.createShadowRoot);

export var shadowDomInjectables = (!hasShadowDom) ? [] : [
  bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy)
]