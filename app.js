var express    = require('express');
var app        = express(); 				
var httpServer = require('http').Server(app);
var io         = require('socket.io')(httpServer);				
var port  	   = process.env.PORT ? parseInt(process.env.PORT) : 3000; 				

app.use(express.static(__dirname + '/client')); // static assets
require('./server/routes.js')(app, io);	// base routes

httpServer.listen(port);
console.log('Express + sockets.io server listening on port ' + port);
