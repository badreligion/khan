
Chas = window.Chas || {};
KMessage = window.KMessage || {};

(function(){
		
	/** 
		user properties
			{
				session_key:sessionkey,
				username:username,
				email:email,
				pk:primarykey
			}
	*/
	var user_properties = {};
	
	/* Chas class */
	Chas = function(config){
		if (!(this instanceof Chas)){
      		return new Chas(config);
    	}
		this.init(config);
	}
	
	Chas.set_user_properties = function(props){
		user_properties = props;
	};
	
	Chas.get_user_properties = function(){
		return user_properties;
	};
		
	/* override prototype */
	Chas.prototype = function(){
		
		/* Chas private properties */
		
			/** 
				configuration 
				{
					io_url:'io_url'
				}
			*/
		var config = null;
		
			/* constant */
		var COMMAND_ADD_PIPE = 'add pipe';
		var CHANNEL_COMMAND = 'COMMAND';
		var CHANNEL_CHAT = 'CHAT';
		var PREFIX_CHANNEL = 'Channel.';
		
		var states = {
			pipe_registered:false
		}
		var socket = null;
		
		/* return object */
		return {
			
			/* initialize object */
			init: function(conf){
				config = conf;
				/* TODO: should inspect conf parameter content */
				return this;
			}, /* end init */
			
			/* on_piped function */
			on_piped: function(fn){
				var instance = this;

				if(socket == null){
					socket = io.connect(config.io_url);
					var json = {
						command:COMMAND_ADD_PIPE,
						'session_key':user_properties.session_key,
						'username':user_properties.username,
						'email':user_properties.email
					}
					console.log(json);
					socket.emit(CHANNEL_COMMAND,json,function(response){
						console.log(COMMAND_ADD_PIPE+' response:');
						console.log(response);
						states.pipe_registered = response.status;
						if (instance.is_piped()){
							fn();
						}
					});	
				}
				
			},/* end on_piped */
			
			/* is piped? */
			is_piped: function(){
				console.log('piped? '+states.pipe_registered);
				return states.pipe_registered?true:false;
			},/* end is_piped*/
			
			/* select_channel , create new channel listener */
			select_channel: function(id,fn_receiver){
				var instance = this;
				var channel_key = PREFIX_CHANNEL+id;
			
				if (!instance.is_piped()){
					return false;
				}
			
				if(socket.listeners(channel_key).length < 1){
					/* create channel listener */
					socket.on(channel_key,fn_receiver);
					
					/* tell mates that this user is joining */
					var message = KMessage();
					message.set_type(KMessage.TYPE.JOIN);
					message.set_channel_id(id);
					socket.emit(CHANNEL_CHAT, message.get());
					
					return true;
				}
				return false;
						
			},/* end select_channel */
			
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
			
			/* send_message */
			send_message: function(channel_id,text){
				if (!this.is_piped()){
					return false;
				}
				
				var message = KMessage();
				message.set_type(KMessage.TYPE.MESSAGE);
				message.set_channel_id(channel_id);
				message.set_text(text);
				
				socket.emit(CHANNEL_CHAT, message.get());
			},/* end send_message */
			
			
		} /* end prototype */
		
	}(); /* end Chas*/

	
	KMessage = function(){
		if (!(this instanceof KMessage)){
		 	return new KMessage();
		}
		this.init();
	}
	
	KMessage.TYPE = {
		MESSAGE: 'MESSAGE',
		JOIN: 'JOIN',
		TYPING: 'TYPING',
		LEAVE: 'LEAVE'
	}
	
	KMessage.prototype = function(){
		var message = {};
		
		return {
			
			init: function(){
				message = {
					meta: {
						type: null
					},
					channel:{
						id: null
					},
					text: null,
					sender: Chas.get_user_properties().username
				}
			},
			
			set_type: function(type){
				message.meta.type = type;
			},
			
			set_channel_id: function(id){
				message.channel.id = id;
			},
			
			set_text: function(text){
				message.text = text;
			},
			
			get: function(){
				return message;
			}
			
		}; /* end prototype */
	}(); /* end Message */


})(); /* end function */

/* django utilities to pass csrf */
$('html').ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
        // Only send the token to relative URLs i.e. locally.
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});







