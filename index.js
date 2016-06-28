var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var WebSocketServer = require('websocket').server;


wsServer = new WebSocketServer({
    httpServer: http,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
  console.log(request.resource);

  var format = "json";
  var path = request.resource.split("?")[0];

  switch(path){
    case "/position.json":
      format = "json";
      break;
    case "/position.csv":
      format = "csv";
      break;
    default:
      return;
      break;
  }

  var connection = request.accept('', request.origin);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
  setTimeout(send_dummy_ws,1000,connection,format,0);
});


var get_dummy = function(counter){
    var t = counter;
    var modules = [];

    modules.push({
      datetime: (new Date()).toISOString(),
      module: 1,
      latitude: 32.4240+0.0060*Math.cos(t/100.0),
      longitude: 130.3305+0.0080*Math.sin(t/100.0),
      altitude: 682+221*Math.cos(t/100.0)
    })

    modules.push({
      datetime: (new Date()).toISOString(),
      module: 2,
      latitude: 32.4115+0.0170*Math.cos(t/161.0),
      longitude: 130.3441+0.0210*Math.sin(t/150.0),
      altitude: 1677+650*Math.cos(t/150.0)
    });

    return modules;
}

var send_dummy_ws = function(connection, format, counter){
  if(connection.connected == false){
    return
  }
  console.log("WebSocket", counter);

  var t = counter;

  var modules = get_dummy(counter);

  modules.forEach(function(value, index){
    if(format=="csv"){
      //「ID番号」「タイムスタンプ」「緯度」「経度」「高度」
      value = "" + value["module"] + "," + value["datetime"] + "," + value["latitude"] + "," + value["longitude"] + "," + value["advanced"];
    }else{
      value = JSON.stringify(value);
    }
    connection.sendUTF(value.replace("\n",""));
  });

  setTimeout(send_dummy_ws,1000,connection,format,counter+1);
}

var send_dummy_socketio = function(socket, counter){
  if(socket.disconnected){
    return;
  }
  console.log("Socket.io", counter);

  var t = counter;

  var modules = get_dummy(counter);

  modules.forEach(function(value, index){
    console.log(value);
    socket.emit("position", value);
  });

  setTimeout(send_dummy_socketio,1000,socket,counter+1);
}


app.get('/', function (req, res) {
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  setTimeout(send_dummy_socketio,1000,socket,0);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
