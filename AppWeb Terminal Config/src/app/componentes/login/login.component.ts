import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TerminalRestService} from "../../servicios/terminal-rest.service";
import {environment} from "../../../environments/environments";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  //--Formulario Reactivo--//
  public formulario: FormGroup;

  //--Login BOOLEAN VARIABLES--//
  checkingSpinner: any = false;
  connection: boolean = true;

  //--Login HEADER Status Text--//
  loginStatusText: any = environment.terminalTittle;

  //--BBDD VARIABLES FOR LOGIN--//
  bbddCredentials: any = "";
  bbddStatus: boolean = false;

  //--BOOLEANS PARA COMPROBAR CREDENCIALES--//
  isUsernameValid: any = true;
  isPasswordValid: any = true;

  constructor(private router: Router, private route: ActivatedRoute, private terminalrest: TerminalRestService, private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.passwordVisibilityFunction();
    this.getBBDDcredentials();
    this.checkCredentials()
    this.buildForm();  //Formularios reactivos
  }

  async getBBDDcredentials() {
    while (this.connection) {
      //Bucle infinito
      try {
        this.loginStatusText = environment.terminalTittle
        this.bbddStatus = false;
        this.checkingSpinner = false;
        this.bbddCredentials = await this.terminalrest.getTerminal().toPromise();
        this.connection = false //Si se ejecuta sin errores, salimos del bucle
      } catch (error) {
        this.loginStatusText = environment.errorTerminalApiRest
        this.bbddStatus = true;
        this.checkingSpinner = true;
        console.error(environment.errorTerminalApiRestConsole, error);

        // esperamos 5 segundos antes de volver a intentarlo
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  /* formulario reactivo */
  private buildForm() {
    this.formulario = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  validations() {
    let inputUsername = (<HTMLInputElement>document.getElementById("username")) as HTMLElement | any;
    let inputPassword = (<HTMLInputElement>document.getElementById("password")) as HTMLElement | any;

    if (this.formulario.value.username != this.bbddCredentials[0].username && this.formulario.value.username != "") {
      this.formulario.get('username').setValue('');
      this.isUsernameValid = true;
      inputUsername.classList.add('is-valid');

      console.log(this.isUsernameValid)
    } else {
      console.log(this.isUsernameValid)
      inputUsername.classList.add('is-invalid');
      this.isUsernameValid = false;
    }

    if (this.formulario.value.password != this.bbddCredentials[0].password && this.formulario.value.password != "") {
      this.formulario.get('password').setValue('');
      this.isPasswordValid = true;
      inputPassword.classList.add('is-valid');
    } else {
      inputPassword.classList.add('is-invalid');
      this.isPasswordValid = false;
    }

    //--REDIRIGIMOS A LA ZONA DE CONFIGURACIÓN Y ESTADO EN CASO DE SER CORRECTAS LAS CREDENCIALES--//
    if (this.formulario.value.password == this.bbddCredentials[0].password && this.formulario.value.username == this.bbddCredentials[0].username) {
      localStorage.setItem('usernameLS', this.formulario.value.username)
      localStorage.setItem('passwordLS', this.formulario.value.password)
      console.log(this.formulario.value.password)
      this.checkingSpinner = false;
      window.location.reload();
    } else {
      this.checkingSpinner = false;
    }
  }

  checkCredentials() {
    let login = document.querySelector("#login") as HTMLElement | any;
    login.addEventListener('submit', (event: any) => {
      //--SPINNER COMIENZA EN PETICION A BBDD LOCAL--//
      this.checkingSpinner = true;
      event.preventDefault()

      if (login.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      this.validations()

    }, false)
  }


  passwordVisibilityFunction() {
    let textType = document.getElementById("password") as HTMLElement | any;
    let show_eye = document.getElementById("show_eye") as HTMLElement | any;
    let hide_eye = document.getElementById("hide_eye") as HTMLElement | any;
    hide_eye.classList.remove("d-none");
    if (textType.type === "password") {
      textType.type = "text";
      show_eye.style.display = "none";
      hide_eye.style.display = "block";
    } else {
      textType.type = "password";
      show_eye.style.display = "block";
      hide_eye.style.display = "none";
    }
  }
}
