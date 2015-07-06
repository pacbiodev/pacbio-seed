/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, bootstrap, NgFor} from 'angular2/angular2';
import {RouteConfig, RouterOutlet, RouterLink, routerInjectables} from 'angular2/router';

// Our custom injectable that uses Just-In-Time change detection
import {jitInjectables} from '../common/jitInjectables';

// Angular's form injectables services/bindings
import {formInjectables} from '../common/formInjectables';


import {Home} from 'components/home';
import {About} from 'components/about';
import {ToDo} from 'components/todo';

import {appDirectives} from 'directives/directives';
import {appServicesInjectables} from 'services/services';

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
}

bootstrap(App,
          [
            routerInjectables,
            jitInjectables,
            formInjectables,
            appDirectives,
            appServicesInjectables
          ]);