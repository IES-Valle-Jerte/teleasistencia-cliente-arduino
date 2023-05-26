import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {io} from 'socket.io-client';
import {TerminalRestService} from "../../servicios/terminal-rest.service";
import {environment} from "../../../environments/environments";


@Component({
  selector: 'app-estado',
  templateUrl: './estado.component.html',
  styleUrls: ['./estado.component.scss'],
})
export class EstadoComponent {

  socket: any;                                      //Variable de inicialización del socket
  websocketStatusText = environment.conectando;     //Variable de texto del estado de conexión al socket
  webSocketStatusBool: boolean = false;             //Contemplaremos mediante un booleano el estado de la conexión del websocket
  button1Status: boolean = false;
  button2Status: boolean = false;
  connection: boolean = true;


  //--BBDD CREDENTIALS IMPORTANT!--//

  bbddCredentials: any = undefined; //Evito el error CTX estableciendo el valor a undefined y preguntando por él en el HTML con un condicional
                                    //Si sigue undefined, simplemente muestro un spinnee
  //Este caso en concreto se daría cuando, una vez logueado, el usuario accediese a la app de configuración del dispositivo, sea redirigido
  //a la página de inicio por defecto una vez logueado, osea, estado, y la API-REST interna no esté funcionando correctamente, o aún no se hayan
  // recibido los datos.

  //Mientras esto pase, se mostrará un in-line dot spinner que a nivel visual indicará que se está tratando de obtener o se está en proceso
  //de obtener los datos a mostrar por pantalla.

  //-------------------------------//

  constructor(private router: Router, private route: ActivatedRoute, private terminalrest: TerminalRestService) {
    this.socket = io(environment.socketIoServer);    //Inicialización de la conexión del socket mediante URL

    this.socket.on('connect', () => {                           //--CONNECTION IS OK
      this.websocketStatusText = environment.establecida;       //Se indica la situación de la conexión
      this.webSocketStatusBool = true;                          //Las clases varían en función al booleano
    });                                                         //[ de la misma manera que los inline dots de antes, pero, eb vez de con la
                                                                // API-REST, con el socket ]

    this.socket.on("disconnect", () => {                        //--CONNECTION IS NOT OK
      this.websocketStatusText = environment.conectando;        //Se indica la situación de la conexión
      this.webSocketStatusBool = false;                         //Las clases . . .
    });
  }

  ngOnInit() {
      this.checkButtons();          //, se incia el checkeo de botones recibidos por socket
      this.getBBDDcredentials();
  }

  checkButtons() //Los query selectors pueden y deben ser cambiados en un futuro por booleanos y checkear con ngClass
  {
    this.socket.on('button1', (data: any) => { //BOTÓN DE EMERGENCIA
      if (data == 0) {
        this.button1Status = true;
        console.log("🔴 EMERGENCY")
      } else {
        this.button1Status = false;
      }
    });

    this.socket.on('button2', (data: any) => { //BOTÓN DE CANCEL
      if (data == 0) {
        this.button2Status = true;
        console.log("🟢 CANCEL")
      } else {
        this.button2Status = false;
        document.querySelector("#cancel")?.classList.remove("cancelActive");
      }
    });
  }

  async getBBDDcredentials() {
    while (this.connection) {
      //Bucle infinito
      try {
        this.bbddCredentials = await this.terminalrest.getTerminal().toPromise();
        this.connection = false   //Si se ejecuta sin errores, salimos del bucle
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 5000)); //Esperamos 5 segundos antes de volver a intentarlo
      }
    }
  }
}
