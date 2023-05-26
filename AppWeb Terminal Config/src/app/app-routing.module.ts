import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./componentes/login/login.component";
import {EstadoComponent} from "./componentes/estado/estado.component";
import {ConfigComponent} from "./componentes/config/config.component";
import {LoginGuardService} from "./servicios/login-guard.service";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'estado',
    component: EstadoComponent,
    canActivate: [LoginGuardService],
  },
  {
    path: 'config',
    component: ConfigComponent,
    canActivate: [LoginGuardService],

  },
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: '**', redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
