$(document).ready(function(){	
	$.getJSON('channels/json/',function(data){
		if (data){
			$.each(data,function(i,item){
				var to_append = '<div><a href="'+item.id+'">'+item.name+'</a></div>';
				$('#id_channels_block').append(to_append);
			});
		}
	});
	
	$('#id_channels_block a').live('click',function(){
		// $.getJSON($(this).attr('href'),function(data){
		// 			if(data.length){
		// 				var item = data[0];
		// 				$('#id_channel_label').html(item.name);
		// 				init_channel(item.id, item.name);
		// 			}
		// 		}).error(function(){
		// 			error_ajax();
		// 		});
		
		alert($(this).text()+':'+$(this).attr('href'));
		
		
		return false;
	});
	
	$('#id_message_button').click(function(){
		send_message($('#id_message_text').val());
	});
		
});

global.functions.onMessageReceive = function(data){
	
	$('#id_message_container').prepend('<div>'+data.message+'</div>');
}