
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function()
  {
  	io.emit("list_update", "update");
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('list', function(msg)
  {
  	console.log('userlist: '+msg);
    io.emit("list_update", "update");
  });
});
