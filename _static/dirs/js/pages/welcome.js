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
				}
	});

	$( "#tabs span.ui-icon-close" ).live( "click", function() {
		var index = $( "li", $tabs ).index( $( this ).parent() );
		$tabs.tabs( "remove", index );
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
			
			$.getJSON('online_users/json/',function(data){
				if (data){
					$.each(data,function(i,user){
						var to_append = '<div><a href="'+user.username+'">'+user.username+'</a></div>';
						$('#id_users_list').append(to_append);
					});
				}
			});

			$('#id_channels_list a').live('click',function(){
				var id = $(this).attr('href');
				var name = $(this).text();
				var tab_id = "#tabs-" + id;
				var exists = $tabs.find(tab_id);
				
				if (exists.length < 1){
					/* if tab not exists then select channel */
					var new_tab = $tabs.tabs( "add", tab_id, name );
					chas.select_channel(id,name,on_message_received);
				}
				/* select tab */
				$tabs.tabs('select',tab_id);
				
				/* give initial div height */
				$(tab_id+' .message_container').attr('init-scroll-height',function(){
					return this.scrollHeight;
				});
				
				return false;
			});
			
			$('#id_users_list a').live('click',function(){
				alert('yet implemented');
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
	draw_message(data.channel.id, data.sender, data.message);
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
