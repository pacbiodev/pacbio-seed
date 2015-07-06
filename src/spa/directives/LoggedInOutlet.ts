/// <reference path="../../../typings/tsd.d.ts" />

import {Directive, Attribute, ElementRef, Renderer, DynamicComponentLoader, Inject} from 'angular2/angular2';
import {Router, RouterOutlet} from 'angular2/router';
import {Injector} from 'angular2/di';
import {Login} from '../components/login';

@Directive({selector: 'authRouter-outlet'})
export class LoggedInOutlet extends RouterOutlet {
  private renderer: Renderer;
  private _unless: any;
  constructor(@Inject(ElementRef) elementRef: ElementRef,
              @Inject(DynamicComponentLoader) _loader: DynamicComponentLoader,
              @Inject(Router) _parentRouter: Router,
              @Attribute('name') nameAttr: string,
              @Inject(Renderer) renderer: Renderer) {
                this.renderer = renderer;
                this._unless = {
                                 '/login': true,
                                 '/signup': true,
                                 '/todo': true
                               };

                super(elementRef, _loader, _parentRouter, nameAttr);
              }

  activate(instruction) {
    var url = this._parentRouter
                  .lastNavigationAttempt;
    if ((!this._unless[url]) &&
        (!localStorage.getItem('token'))) {
      instruction.component = Login;
    }
    super.activate(instruction);
  }
}
