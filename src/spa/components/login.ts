/// <reference path="../../../typings/tsd.d.ts" />

import {Component, View, EventEmitter, Inject} from 'angular2/angular2';
import {status, json} from '../../common/fetch'
import {Router, RouterLink} from 'angular2/router';

@Component({
  selector: 'login',
})
@View({
  templateUrl: '../templates/html/login.html',
  directives: [RouterLink]
})
export class Login {
  public router: Router;
  constructor(@Inject(Router) router: Router) {
    this.router = router;
  }

  login(event, username, password) {
    event.preventDefault();
    window.fetch('http://localhost:8080/api/auth/login/with/%s/and/%s'.sprintf(username.trim(), password.trim()), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: ''
    })
    .then(status)
    .then(json)
    .then((response) => {
            localStorage.setItem('token', response.token.token);
            localStorage.setItem('tokenExpires', response.token.expires);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.router.parent.navigate('/home');
          })
    .catch((error) => {
             alert(error.message);
             console.log(error.message);
           });
  }

  signup(event) {
    event.preventDefault();
    this.router.parent.navigate('/signup');
  }
}
