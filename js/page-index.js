$(document).ready(function() {
	$("ul.sortable").sortable({
		stop: function(event, ui) {
			ajaxSorting.run();
		}
	});

	$('.js-create-page').on('click', function(event){
		event.preventDefault();
		var page_type = $('#page_type').val();

		if(!page_type){
			$('#page_type').css('border', '1px solid red');
		}
		else{
			var url = $(this).attr('href');
			url += page_type;

			window.location.href = url;
		}
	});
});

var ajaxSorting = {
	url: '/admin/catalogue/manage/api/pages/order.json',
	run: function() {
		this.sendAjaxRequest(this.url, this.getPageIds());
	},
	getPageIds: function() {
		var itemIds = [];

		$('.page-list-item').each(function(index, item) {
			itemIds.push($(item).data('page-id'));
		});

		return itemIds;
	},
	sendAjaxRequest: function(url, pageIds) {
		$.ajax({
			url: url,
			type: "POST",
			data: {
				pages: pageIds
			}
		}).success(function(data) {
			if(data.success != true) {
				alert("Something went wrong whilst saving the order. Please reload the page and try again.");
			}
		});
	},
};