/**
 * @author  Fréderic Sánchez García
 */

// Permite escribir en un fichero
var fs = require("fs");
var request = require('request'); // require the request library

var token = {
    username: "admin",
    password: "admin"
};

var tokenOptions = {
    url: 'http://api-rest-teleasistencia-p1.iesvjp.es/api/token/',
    method: 'POST',
    json: true,
    body: token
};

var tokenData;

function getToken() {
    request(tokenOptions, function(error, response, body) {
        if (error) {
            console.log('  > token ERROR');
            console.log(error)
            getTokenWithDelay();
        } else {
            tokenData = response.body.access;
            console.log("  > token OK");
            console.log(tokenData);
        }
    });
}

function getTokenWithDelay() {
    if (tokenData == null)
    {
        setTimeout(function() {
            getToken();
        }, 1000);
        
    }
    
}

getTokenWithDelay();
 


// Soluciona error CORS
const cors = require('cors');
// Creamos una instancia de express y le decimos que va a usar JSON
var express = require("express");
var app = express();
app.use(express.json());
// Evitar CORS
app.use(cors({
    origin: '*'
}));

// Definimos la url sobre la cual va a responder
var url = "/terminal";
var urlUCR = "/terminalUCR";

// Abrimos el puerto de escucha al 3000 y una vez abierto mostramos un mensaje.
app.listen(3000, () => console.log("  > server running on 3000 port"));

// Creamos una variable JSON
var destinosFichero = "db/terminal.json";
var destinosFicheroUCR = "db/terminalUCR.json";
// Leemos el listado de destinos almacenados en JSON
var misDestinos = JSON.parse(fs.readFileSync(destinosFichero));
var misDestinosUCR = JSON.parse(fs.readFileSync(destinosFicheroUCR));
// Devolvemos una respuesta sobre una petición GET dinámica
// Parámetros req = request, res = response, next
app.get(url, (req,res,next) => {
    res.json(misDestinos);
});
app.get(url +"/:id", (req,res,next) => {
    res.json(misDestinos.find((x) => req.params.id == x.id));
});

app.get(urlUCR, (req,res,next) => {
    res.json(misDestinosUCR);
});
app.get(urlUCR +"/:id", (req,res,next) => {
    res.json(misDestinosUCR.find((x) => req.params.id == x.id));
});


// Almacenamos un valor de una petición POST
app.post(url, (req,res,next) => {
    // El destino nuevo se introduce en el cuerpo de la petición
    reqElement =  req.body;
    // Ordenamos el array, obtenemos el último ID y le incrementamos 1
    misDestinos.sort((x,y) =>{return x.id - y.id});
    let id = misDestinos[misDestinos.length-1].id+1;
    // Asignamos el id
    reqElement.id = id;
    // Ordenamos por id por si estuviesen desordenados
    misDestinos.sort((x,y) =>{return x.id - y.id});
    // Lo aladimos al final.
    misDestinos.push(reqElement);
    fs.writeFileSync(destinosFichero, JSON.stringify(misDestinos,null,2));
    res.json(misDestinos);
    console.log ("     >  TERMINAL ALARM");
});
// Almacenamos un valor de una petición POST UCR
app.post(urlUCR, (req,res,next) => {
    // El destino nuevo se introduce en el cuerpo de la petición
    reqElement =  req.body;
    // Ordenamos el array, obtenemos el último ID y le incrementamos 1
    misDestinosUCR.sort((x,y) =>{return x.id - y.id});
    let id = misDestinosUCR[misDestinosUCR.length-1].id+1;
    // Asignamos el id
    reqElement.id = id;
    // Ordenamos por id por si estuviesen desordenados
    misDestinosUCR.sort((x,y) =>{return x.id - y.id});
    var ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split("."); 

    if ( req.body.funcionando && req.body.complemento){
        // Realizamos los calculos necesarios para verificar la petición
        var operacion = req.body.funcionando*1024%222*356*ip[ip.length-1];
        // Comprobamos si en la petición vienen los dos valores que se comprueban
        if (operacion == req.body.complemento){
            // TODO -> aquí haremos la funcionalidad, enviar por WS la pulsación del botón
            //         y el envio de una solicitud post a la API-REST
            console.log ("     >  UCR ALARM");
    
                var alarm = {
                    id_tipo_alarma: 1,
                    id_paciente_ucr: 8

                };

                var alarmOptions = {
                    url: 'http://api-rest-teleasistencia-p1.iesvjp.es/api-rest/alarma',
                    method: 'POST',
                    json: true,
                    body: alarm,
                    headers: {
                        'Authorization': 'Bearer ' + tokenData
                    }
                };

            
                request(alarmOptions, function(error, response, body) {
                    if (error) {
                        console.log('    > Alarm ERROR:', error);
                    } else {
                        console.log("    > Alarm Ok");
                    }
                });
            
            // Lo aladimos al final.
            misDestinosUCR.push(reqElement);
            //fs.writeFileSync(destinosFicheroUCR, JSON.stringify(misDestinosUCR,null,2));
            res.json(misDestinosUCR);
        }
    }

});

// Actualizamos un valor introduciendo su nombre por parámetros
app.put(url + "/:id", (req,res,next) => {
    // :id corresponde con req.params.id
    let toUpdate = misDestinos.find((x) => req.params.id == x.id);
    let indexToUpdate = misDestinos.indexOf(toUpdate);

    if(indexToUpdate>= 0) {
        // Recorremos cada uno de los campos y los actualizamos con los que nos vienen en el body
        // Esto nos permite actualizar sólo los datos que nos vengan, si se omite alguno mantiene el que ya estaba.
        for (const x in toUpdate) {
            if (req.body[x]) {
                toUpdate[x] = req.body[x];
            }
        }
        // Actualizamos el elemento
        misDestinos[indexToUpdate]=toUpdate;
        fs.writeFileSync(destinosFichero, JSON.stringify(misDestinos, null, 2));
        res.json(misDestinos);
    }
    else {
        res.status(404).send('Error');
    }
});

// Borramos un valor introduciendo su nombre por parámetros
app.delete(url +"/:id", (req,res,next) => {
    // :id corresponde con req.params.id
    let toDelete = misDestinos.find((x) => req.params.id == x.id);
    let indexToDelete = misDestinos.indexOf(toDelete);
    if(indexToDelete>= 0){
        misDestinos.splice(indexToDelete,1);
        fs.writeFileSync(destinosFichero,  JSON.stringify(misDestinos,null,2));
        res.json(misDestinos);
    }
    else {
        res.status(404).send('Error');
    }
});

function emitIt()
{

    console.log("EMITIENDO");
    console.log(socket.connected)
    socket.emit('button3', 0, (response) => {
  console.log(response.status); // ok
});
      
}

