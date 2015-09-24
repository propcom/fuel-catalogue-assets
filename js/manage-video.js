$(function(){
	$(document).bind('use_video.mediamanager', function(event, data) {
		if(data.video){
			var update_this = '#' + $(data.element).data('mm-field-name');
			$(update_this).val(data.video[0].id);
			var preview = "<img src='" + data.video[0].image_url + "'/><h4>" + data.video[0].name + "</h4>";
			$('.js-update-video').html(preview);
		}
	});
});