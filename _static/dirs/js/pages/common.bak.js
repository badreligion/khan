
/* configuration */
var config = {};
config.IO_URL = 'http://localhost:8001';
config.IO_ROOT = 'channel';
config.IO_COMM = 'comm';


/* global namespace */
var global = {};
global.registered_channel = [];
global.socket = null;
global.key = null; // django session_key
global.current_channel = null;
global.functions = {
	onMessageReceive: function(data){ console.log('nothing to do')}
};

/* global ajax error message */
var error_ajax = function(){
	alert('Error on ajax request.');
}

/* initialize channel */
var init_channel = function(channel_id, channel_name){
	
	/* create socket connection */
	if(global.socket == null){
		global.socket = io.connect(config.IO_URL);
	}
	
	/* register data to server */
	var json_init = {
		'key':global.key,
		'channel': {
			'id':channel_id,
			'name':channel_name
		}
	};
	global.socket.emit(config.IO_COMM,json_init);
	
	/** 
		remove previous listener 
		remove this if multiple channel applied
	*/
	if(global.current_channel != null){
		global.socket.removeListener(global.current_channel,global.functions.onMessageReceive);
		for (var i in global.registered_channel){
			if(global.registered_channel[i] == global.current_channel){
				delete global.registered_channel[i];
			}
		}
	}
	global.current_channel = channel_name;
	
	/* if the channel already registered */
	for(var i in global.registered_channel){
		console.log(i +':'+ global.registered_channel[i]);
		if( global.registered_channel[i] == channel_name){
			console.log(channel_name + ' channel already registered.');
			return;
		}
	}
	
	/* send greeting to channel */
	send_message('greetings from '+global.key);
	
	/* register the channel */
	global.registered_channel.push(channel_name);
	
	/* create channel listener*/
	global.socket.on(channel_name,global.functions.onMessageReceive);
}

/* set django session key */
var set_key = function(key){
	global.key = key;
}

/* send message */
var send_message = function(message){
	var json = {'message':message};
	global.socket.emit(config.IO_ROOT,json);
}
