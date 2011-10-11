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

var PREFIX_SESSION = 'Session.',
		PREFIX_CHANNEL_JOIN = 'User.Join.',
		PREFIX_CHANNEL_USERS = 'Channel.Users.'
		PREFIX_CHANNEL = 'Channel.';

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
		switch(json.command){
			case COMMAND_ADD_PIPE:
				util.log('django key: '+json.session_key);
				
				var redis_session_key = get_session_key(json.session_key),
				session_key = json.session_key;
				
				redis_client.hgetall(redis_session_key,function(err,o){
					if (err){
						util.log(util.inspect(err));
						fn(set_result(false,'fail',COMMAND_ADD_PIPE));
						return;
					}
					util.log('get key '+redis_session_key+' from redis');
					util.log(util.inspect(o));
					
					socket.session_key = session_key;
					util.log('socket.session_key: '+socket.session_key);
					if(fn){
						fn(set_result(true,'success',COMMAND_ADD_PIPE));
					}
				});
			break;
			
			default:
				util.log('no command match');
				if(fn){
					fn(set_result(false,'no_command_match',null));
				}
		}
	});
	
	/**
		message structure
		{
			meta: {
				type: $message_type [message,join,typing,leave]
			},
			channel:{
				id: $channel_id
			},
			text: $string_text,
			sender: $username,
		}
	*/
	socket.json.on(CHANNEL_CHAT, function(json,fn){
		util.log('got message: '+json.text);
		util.log('to channel: '+json.channel.id);
		util.log('sender: '+json.sender);
		util.log('type: '+json.meta.type);
		socket.broadcast.emit(get_channel_key(json.channel.id),json);
		//TODO: run fn
	});
	
	socket.on('disconnect',function(){
		var session_key = get_session_key(socket.session_key),
				channel_join_key = get_channel_join_key(socket.session_key);
		
		util.log('disconnecting socket id: '+socket.session_key);
		util.log('deleting: '+session_key+', '+channel_join_key);
		
		/* get user id from redis, id = pk, use this to delete channel users*/
		redis_client.hgetall(session_key,function(err,user){
			if(err){
				util.log('error on redis_client.hgetall');
				util.log(util.inspect(err));
				return false;
			}
			
			/* inspects all channel the user's participated */
			redis_client.smembers(channel_join_key, function(err,channels){
				if(err){
					util.log('error on redis_client.smembers');
					util.log(util.inspect(err));
					return false;
				}

				util.log('channels within '+PREFIX_CHANNEL_JOIN);
				util.log(util.inspect(channels));

				for(var index in channels){
					util.log('iterate channel: '+channels[index]);
					var channel_users_key = get_channel_users_key(channels[index]);
					redis_client.srem(channel_users_key, user.pk, function(err, users){
						util.log('remove user from channel');
						if(err){
							util.log('error redis_client.srem');
						}
						util.log(util.inspect(users));
					});
				}

				/* delete user channels */
				redis_client.del(channel_join_key,on_redis_delete);
				delete channels;

			});
			
			/* delete user session */
			redis_client.del(session_key,on_redis_delete);
			delete user;
		});
		
	});
	
});


var set_result = function(status, message, command){
	return {
		status: status,
		message: message,
		command: command
	}
}

var get_session_key = function(session_key){
	return PREFIX_SESSION+session_key;
}

var get_channel_join_key = function(session_key){
	return PREFIX_CHANNEL_JOIN+session_key;
}

var get_channel_key = function(anything){
	return PREFIX_CHANNEL+anything;
}

var get_channel_users_key = function(channel_id){
	return PREFIX_CHANNEL_USERS+channel_id;
}


var on_redis_delete = function(err,o){
	if (err){
		util.log('error deleting key from redis');
		util.log(util.inspect(err));
	}else{
		util.log('success deleting key from redis');
		util.log(util.inspect(o));
	}	
}
