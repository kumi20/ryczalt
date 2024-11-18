import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { JwtHelperService } from '@auth0/angular-jwt';
const helper = new JwtHelperService();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _router: Router) {}

  canActivate() {
    if (window.localStorage.getItem('app-ryczalt-token')) {
      return true;
    }

    this._router.navigate(['']);
    return false;
  }
}

@Injectable()
export class IsActiveToken implements CanActivate {
  constructor(private _router: Router) {}

  canActivate() {
    if (window.localStorage.getItem('app-ryczalt-token')) {
      this._router.navigate(['content']);

      return false;
    }

    return true;
  }
}
