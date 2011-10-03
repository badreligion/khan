
Chas = window.Chas || {};

(function(){
		
	/** 
		user properties
			{
				session_key:sessionkey,
				username:username,
				email:email
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
	
	Chas.get_user_properties = function(props){
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
			
			/* select_channel */
			select_channel: function(id,name,fn_receiver){
				var instance = this;
			
				if (!instance.is_piped()){
					return false;
				}
			
				if(socket.listeners(id).length < 1){
					socket.on(id, fn_receiver);
					return true;
				}
				return false;
						
			},/* end select_channel */
			
			/* send_message */
			send_message: function(channel_id,message){
				if (!this.is_piped()){
					return false;
				}
				socket.emit(CHANNEL_CHAT,
				{
					channel:{
						id:channel_id
					},
					message:message,
					//sender:user_properties.session_key
					sender:user_properties.username
				});
			},/* end send_message */
			
		} /* end prototype */
		
	}() /* end Chas*/


})();

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







