console.log("\033[1;32m")
console.log("+------------------------------------+")
console.log("| > Node + socket.io      > RUNNING  |")
console.log("+------------------------------------+")


var http = require('http').createServer(handler); //require http server, and create server with function handler()
console.log("  > http library loaded");

var request = require('request'); // require the request library

var fs = require('fs'); //require filesystem module
console.log("  > fs library loaded");

var io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }

}) //require socket.io module and pass the http object (server)
console.log("  > socket.io library loaded");
console.log("  > socket.io cors allowed");

http.listen(8080); //listen to port 8080
console.log("    > server listening in 8080 port");

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
console.log("  > onoff library loaded");


var pushButton1 = new Gpio(27, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
console.log("    > GPIO 27 correctly declared");
var pushButton2 = new Gpio(26, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
console.log("    > GPIO 26 correctly declared");

var lastPostTime = 0;
let lastLogTimes = {};


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


function handler(req, res) { //create server

    fs.readFile(__dirname + '/index.html', function(err, data) { //read file index.html in public folder

        if (err) {

            res.writeHead(404, {
                'Content-Type': 'text/html'
            }); //display 404 on error

            return res.end("404 Not Found");

        }

        res.writeHead(200, {
            'Content-Type': 'text/html'
        }); //write HTML

        res.write(data); //write data from index.html

        return res.end();

    });

}

console.log("  > server successfully created");

io.sockets.on('connection', function(socket) { // WebSocket Connection

    var button1 = 0; //static variable for current status

    var button2 = 0; //static variable for current status

    pushButton1.watch(function(err, value) { //Watch for hardware interrupts on pushButton

        if (err) {
            console.error('  >  button1 ERROR'); //output error message to console
            return;
        }

        button1 = value;
        socket.emit('button1', button1); //send button status to client

        if (button1 == 0) { //si el botón 1 está presionado
            var currentTime = Date.now(); //obtener el tiempo actual en milisegundos

            // verificar si ha pasado al menos un segundo desde la última solicitud
            if (currentTime - lastPostTime >= 1000) {
                lastPostTime = currentTime; // actualizar el tiempo de la última solicitud

                var alarm = {
                    id_tipo_alarma: 10,
                    id_terminal: 2
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


            } else {
                console.log(" ")
                logWithLimit("\033[1;32m    > Wait ")
            }
        }

    });

    pushButton2.watch(function(err, value) { //Watch for hardware interrupts on pushButton

        if (err) {
            console.error('There was an error', err); //output error message to console
            return;
        }

        button2 = value;
        socket.emit('button2', button2); //send button status to client

    });
    
    
});

process.on('SIGINT', function() { //on ctrl+c

    pushButton1.unexport(); // Unexport Button GPIO to free resources
    pushButton2.unexport(); // Unexport Button GPIO to free resources

    process.exit(); //exit completely

});


function logWithLimit(message, timeLimit = 1000) {
    const date = Date.now();
    // Verificar si se imprimió el mensaje recientemente
    if (lastLogTimes[message] && date - lastLogTimes[message] < timeLimit) {
        return;
    }

    // Imprimir el mensaje y registrar la hora actual
    console.log(message + date % 1000 + "ms\x1b[0m");
    lastLogTimes[message] = date;
}
