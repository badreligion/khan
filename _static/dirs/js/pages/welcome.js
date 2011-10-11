$(document).ready(function(){
	var $tabs = $( "#tabs").tabs({
		tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
			add: function( event, ui ) {
					if (ui.tab.text == 'Welcome'){
						var tab_content = '<h3>Django + NodeJs Realtime Chat!</h3>'+
						'<p>This application is intended for learning purpose, usage is at your own risk.</p>';
						$( ui.panel ).append(tab_content);
					}else{
						var channel_id = ui.panel.id.replace(/tabs-/g,'');
						var tab_content = '<div class="message_container"></div>'+
						'<input type="text" name="channel_text_'+ui.panel.id+'" id="channel_text_'+ui.panel.id+'" class="message_text" />'+
						'<input type="hidden" name="channel_id_'+ui.panel.id+'" value="'+channel_id+'" class="channel_hidden" />';
						$( ui.panel ).append(tab_content);
					}
			},
			select: function(event, ui){
				var id = ui.panel.id.replace(/tabs-/g,'');
				var id_channel_users_key = 'id_channel_users_'+id;
				$('#id_channel_users_list .channels').hide();
				$('#'+id_channel_users_key).show();
			}
	});

	$( "#tabs span.ui-icon-close" ).live( "click", function() {
		var index = $( "li", $tabs ).index( $( this ).parent() );
		var id = $( "li a:eq("+index+") ", $tabs ).attr('href').replace(/#tabs-/,'');
		var id_channel_users_key = 'id_channel_users_'+id;
		$('#'+id_channel_users_key).remove();
		$.post('channels/'+id+'/leave/',function(res){
			$tabs.tabs( "remove", index );
		}).error(function(xhr,status,err){
				console.log('error channel leave');
				console.log(xhr);
			});
	});

	$tabs.tabs( "add", '#tabs-0', 'Welcome');
	
	var chas_config = {
		io_url: 'http://localhost:8001'
	};
	
	$.post('init_pipe/',function(res){
		if (res == 'ok'){
			var chas = Chas(chas_config);

			chas.on_piped(function(){
				
				/* on piped */

			});
			
			/* socket registered */

			$.getJSON('channels/json/',function(data){
				if (data){
					$.each(data,function(i,item){
						var to_append = '<div><a href="'+item.id+'">'+item.name+'</a></div>';
						$('#id_channels_list').append(to_append);
					});
				}
			});
						
			/* select channel */
			$('#id_channels_list a').live('click',function(){
				var id = $(this).attr('href');
				var name = $(this).text();
				var tab_id = "#tabs-" + id;
				var exists = $tabs.find(tab_id);
				
				if (exists.length < 1){
					/* if tab not exists then select channel */
					var new_tab = $tabs.tabs( "add", tab_id, name );
					chas.select_channel(id,on_message_received);
					
					/* register channel to redis */
					$.post('channels/'+id+'/join/',function(res){
						//TODO: ????
					}).error(function(xhr,status,err){
						console.log('error join channel');
						console.log(xhr);
					});
					
					/* give initial div height */
					$(tab_id+' .message_container').attr('init-scroll-height',function(){
						return this.scrollHeight;
					});
					
					/* get users on this channel */
					$.getJSON('channels/'+id+'/users/json/',function(data){
						var id_channel_users_key = 'id_channel_users_'+id;
						$('#id_channel_users_list .channels').hide();
						if (data){
							$('#id_channel_users_list').append('<div id="'+id_channel_users_key+'" class="channels"></div>');
							$.each(data,function(i,user){
								draw_users_channel(id,user.username);
							});
						}
					});
				}				
				$tabs.tabs('select',tab_id);
				return false;
			});
						
			$('.message_text').live('keypress',function(e){
				if(e.which != '13') return;
				var channel_id = $(this).next('.channel_hidden').val();
				var message = $(this).val();
				chas.send_message(channel_id,message);
				$(this).val('');
				draw_message(channel_id,Chas.get_user_properties().username,message);
			});
		
		}// end if res == ok
	});// end init_pipe
	
});

var on_message_received = function(data){
	console.log('got data');
	console.log(data);
	if(data.meta.type == KMessage.TYPE.MESSAGE){
		draw_message(data.channel.id, data.sender, data.text);
	}else if(data.meta.type == KMessage.TYPE.JOIN){
		draw_users_channel(data.channel.id, data.sender);
	}
	
}

var draw_message = function(channel_id,sender,message){
	var new_message = '<div>'+
		'<span class="message_sender">'+sender+'</span>: '+
		'<span class="message_content">'+message+'</span>'+
	'</div>';
	var message_container = $('#tabs-'+channel_id+' .message_container');
	message_container.append(new_message);
	
	var tlr = message_container.attr('init-scroll-height');
	tlr = parseInt(tlr);
	var scrollHeight = message_container[0].scrollHeight
	
	/* keep pushing down before scroll show up */
	if (message_container.scrollTop() < 1){
		console.log('trigger scroll');
		message_container.scrollTop(scrollHeight);
	}
	
	/* only follow down when scrollTop near bottom element */
	if(message_container.scrollTop() < (scrollHeight - tlr - 20)){
		console.log('deactive');
	}else{
		console.log('active');
		message_container.scrollTop(scrollHeight);
	}	
}

var draw_users_channel = function(channel_id, username){
	if (username == Chas.get_user_properties().username){
		return false;
	}
	var to_append = '<div class="users"><a href="'+username+'">'+username+'</a></div>';
	$('#id_channel_users_'+channel_id).append(to_append);
}
