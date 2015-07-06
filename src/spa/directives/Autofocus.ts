/// <reference path="../../../typings/tsd.d.ts" />

import {Directive, ElementRef, Inject, Renderer} from 'angular2/angular2';

// Simple example directive that fixes autofocus problem with multiple views
@Directive({
  selector: '[autofocus]' // using [ ] means selecting attributes
})
export class Autofocus {
  private el: ElementRef;
  private renderer: Renderer;

  constructor(@Inject(ElementRef) el: ElementRef,
              @Inject(Renderer)renderer: Renderer) {
    this.el = el;
    this.renderer = renderer;

    // autofocus fix for multiple views
    this.el.nativeElement.focus();
  }
}
