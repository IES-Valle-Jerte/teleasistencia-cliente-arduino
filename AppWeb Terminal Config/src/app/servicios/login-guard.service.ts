import {Injectable} from '@angular/core';
import {Router, UrlTree} from "@angular/router";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService {

  constructor(private router: Router) {
  }

  canActivate(): | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (localStorage.getItem("usernameLS") == null) {
      this.router.navigate(['/login']);// Si no esta logueado redirecciona al login.
      return false
    }
    return true;  //Si esta logueado admite el paso.
  }
}
