var http = require('http').createServer(handler); //require http server, and create server with function handler()
console.log("  > http library loaded");

var fs = require('fs'); //require filesystem module
console.log("  > fs library loaded");

var io = require('socket.io')(http, {
  cors: {
    origin:"*"
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


console.log(" ")
function handler (req, res) { //create server

  fs.readFile(__dirname + '/index.html', function(err, data) { //read file index.html in public folder

    if (err) {

      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error

      return res.end("404 Not Found");

    }

    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML

    res.write(data); //write data from index.html

    return res.end();

  });

}

console.log("  > server successfully created");

io.sockets.on('connection', function (socket) {// WebSocket Connection

  var button1 = 0; //static variable for current status

  var button2 = 0; //static variable for current status

  pushButton1.watch(function (err, value) { //Watch for hardware interrupts on pushButton

    if (err) {console.error('There was an error', err); //output error message to console
      return;
    }

    button1 = value;
    socket.emit('button1', button1); //send button status to client

  });

  pushButton2.watch(function (err, value) { //Watch for hardware interrupts on pushButton

    if (err) {console.error('There was an error', err); //output error message to console
      return;
    }

    button2 = value;
    socket.emit('button2', button2); //send button status to client

  });

});

process.on('SIGINT', function () { //on ctrl+c

  pushButton1.unexport(); // Unexport Button GPIO to free resources
  pushButton2.unexport(); // Unexport Button GPIO to free resources

  process.exit(); //exit completely

});
