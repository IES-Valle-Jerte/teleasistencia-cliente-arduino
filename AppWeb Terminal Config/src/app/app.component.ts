import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private router: Router, private route: ActivatedRoute) { }

  disableNav : any = false; //Evita mostrarnos el LOGOUT si ni siquiera estamos logeados

  ngOnInit()
  {
    if(localStorage.getItem('usernameLS') === null)
    {
      this.disableNav = true; //No estoy logeado, no muestro el LOGOUT
    }
    else
    {
      this.router.navigate(['/estado']) //Estoy logeado, me voy a estado
    }

  }

  logout() //Si pulso LOGOUT, elimino las variables en localstorage
  {
    localStorage.removeItem("usernameLS");
    localStorage.removeItem("passwordLS");
    this.disableNav = true; //No estoy logeado, no muestro el LOGOUT
    //La redirección de nuevo al LOGIN se produce en el HTML
  }

}
