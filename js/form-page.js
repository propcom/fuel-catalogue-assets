$(function(){
	$(document).on('submit', '.js-form-page', function(event){
		event.preventDefault();
		var form = $(this);
		var data = form.serialize();
		var url = form.data('url');

		$.ajax({
			url: url+'.json',
			data: data,
			dataType: 'JSON',
			type: 'POST',
			success: function(data){
				form.replaceWith($('<span class="success">'+ data.message +'</span>'));
			},
			error: function(data){
				$(".js-form-page-error").text(data.responseText);
			}
		});
	});
});