var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var send_dummy = function(socket, counter){
  if(socket.disconnected){
    return;
  }
  console.log(counter);

  var t = counter;

  var module = {
    datetime: (new Date()).toISOString(),
    module: 1,
    latitude: 32.4240+0.0060*Math.cos(t/100.0),
    longitude: 130.3305+0.0080*Math.sin(t/100.0),
    advanced: 682+221*Math.cos(t/100.0)
  }
  console.log(module);
  socket.emit("position", module);


  var module = {
    datetime: (new Date()).toISOString(),
    module: 2,
    latitude: 32.4115+0.0170*Math.cos(t/161.0),
    longitude: 130.3441+0.0210*Math.sin(t/150.0),
    advanced: 1677+650*Math.cos(t/150.0)
  }
  console.log(module);
  socket.emit("position", module);

  setTimeout(send_dummy,1000,socket,counter+1);
}


app.get('/', function (req, res) {
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  setTimeout(send_dummy,1000,socket,0);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
