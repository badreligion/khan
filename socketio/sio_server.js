require.paths.unshift('/usr/local/lib/node')

var sio = require('socket.io'),
		//http = require('http'),
		util = require('util'),
		//serve_static = require('./serve_static'),
		redis = require("redis");

var SERVER_PORT = 8001,
		CHANNEL_COMMAND = 'COMMAND',
		CHANNEL_CHAT = 'CHAT',
		REDIS_HOST = 'localhost',
		REDIS_PORT = 6379;
		//PIPE_LIMIT = 4;
		
var COMMAND_ADD_PIPE = 'add pipe';

/**
	pipes structure
		'socket session': django session key
*/

var redis_client = redis.createClient(REDIS_PORT,REDIS_HOST);

// var server = http.createServer(function(req,res){
// 	serve_static.serve_static(req,res);
// });

// server.listen(SERVER_PORT, function(){
// 	util.log('server listening on port '+SERVER_PORT.toString());
// });

//var io = sio.listen(server);
var io = sio.listen(SERVER_PORT);

/* disable io from serving static content */
io.disable('browser client');
io.set('log level', 0);
io.set('transports', ['xhr-polling','jsonp-polling']);


io.sockets.on('connection',function(socket){
	
	var sid = socket.id;
	
	util.log('SOCKET ID: '+sid);
	
	socket.json.on(CHANNEL_COMMAND, function(json,fn){
		util.log('processing command '+json.command);
		var result = {};
		switch(json.command){
			case COMMAND_ADD_PIPE:
				util.log('django key: '+json.session_key);
				
				redis_client.hgetall(json.session_key,function(err,o){
					if (err){
						util.log(err);
						fn(set_result(false,'fail',COMMAND_ADD_PIPE));
						return;
					}
					util.log('get key '+json.session_key+' from redis');
					util.log(o);
					
					socket.session_key = json.session_key;
					util.log('socket.session_key: '+socket.session_key);
					if(fn){
						fn(set_result(true,'success',COMMAND_ADD_PIPE));
					}
				});
				
			break;
			default:
				util.log('no command match');
				result = set_result(false,'no_command_match',null);
				if(fn){
					fn(result);
				}
		}
	});
	
	/**
		message structure
			'message': message from client,
			'channel': {
				id: channel id
			},
			'sender': django session from message sender
	*/
	socket.json.on(CHANNEL_CHAT, function(json,fn){
		util.log('got message: '+json.message);
		util.log('to channel: '+json.channel.id);
		util.log('sender: '+json.sender);
		socket.broadcast.emit(json.channel.id,json);
		//TODO: run fn
	});
	
	socket.on('disconnect',function(){
		util.log('disconnecting '+sid+' and '+socket.session_key);
		redis_client.del(socket.session_key,function(err,o){
			if (err){
				util.log('error deleting key from redis');
				util.log(err);
			}else{
				util.log('success deleting key from redis');
				util.log(o);
			}
		});
		//todo: delete key from redis
	});
	
});


var set_result = function(status, message, command){
	return {
		status: status,
		message: message,
		command: command
	}
}

