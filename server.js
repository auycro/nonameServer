var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

var clients = [];

var chatlog = [];

var chat = {
	run: function(){	
		wss.on("connection", function(ws) {
		  clients = ++clients;
		  console.log((new Date())+' Connection establish. current Clients = %s', clients);

		  var id = setInterval(function() {
		    ws.send(JSON.stringify(new Date()), function() {  })
		  }, 1000)

		  ws.on('message', function(message) {
			console.log('received: %s', message);
			chat.dispatch(ws, message);
		  });

		  ws.on("close", function() {
		  	clients = --clients;
		    console.log("websocket connection close")
		    clearInterval(id)
		  })
		})
	},

	dispatch: function(ws,message){
		var cmd = '';
		var param = '';

		if(message.indexOf('/') === 0){
			cmd = message.split(' ')[0];
			param = message.replace(cmd, '');

		}

		switch(cmd){
			case '/broadcast': 
				console.log('broadcast('+(new Date())+'): '+ws.name+'::'+param);
				//chat.broadcast(param, ws);
				break;
			case '/connect':
				var msg = param.replace(' ','').replace(/(<([^>]+)>)/ig,"");
				if(msg != ''){
					console.log('register('+(new Date())+'): '+ws.name+'::'+msg);
					//chat.registerClient(ws, msg);
				}
				break;
			default:
				console.log();
		}
	},
}
chat.run();