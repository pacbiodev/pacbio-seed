/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {RouteConfig, RouterOutlet, RouterLink, routerInjectables} from 'angular2/router';

// Our custom injectable that uses Just-In-Time change detection
import {changeDetectionInjectables} from './injectables/changeDetectionInjectables';

// Angular's form injectables services/bindings
import {formInjectables} from './injectables/formInjectables';

// Our custom injectable that checks if ShadowDom is available to inject
//import {shadowDomInjectables} from './injectables/shadowDomInjectables';

// Our collection of injectables services
import {appServicesInjectables} from 'services/services';

import {Home} from 'components/home';
import {About} from 'components/about';
import {ToDo} from 'components/todo';

import {appDirectives} from 'directives/directives';

@Component({
  selector: 'app'
})
@RouteConfig([
  { path: '/', component: Home, as: 'root' },
  { path: '/home', component: Home, as: 'home' },
  { path: '/todo', component: ToDo, as: 'todo' },
  { path: '/about', component: About, as: 'about' }
])
@View({
  templateUrl: '/templates/html/app.html',
  directives: [appDirectives, RouterLink]
})
class App {
  constructor() {
  }
}

bootstrap(App,
          [
            routerInjectables,
            changeDetectionInjectables,
            // shadowDomInjectables,
            formInjectables,
            appDirectives,
            appServicesInjectables
          ]);