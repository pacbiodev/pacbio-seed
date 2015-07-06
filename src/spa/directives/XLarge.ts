/// <reference path="../../../typings/tsd.d.ts" />

import {Directive, ElementRef, Renderer, Inject} from 'angular2/angular2';

@Directive({
  selector: '[x-large]' // using [ ] means selecting attributes
})
export class XLarge {
  private _renderer: Renderer;
  private _el: ElementRef;

  constructor(@Inject(ElementRef) el: ElementRef,
              @Inject(Renderer) renderer: Renderer) {
    this._renderer = renderer;
    this._el = el;
    // simple dom manipulation to set font size to x-large
    this._el.nativeElement.style.fontSize = 'x-large';
  }
}
