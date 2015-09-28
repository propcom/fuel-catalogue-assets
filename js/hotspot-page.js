var Hotspot = function(){
	this.id;
	this.x;
	this.y;
	this.x2;
	this.y2;
	this.title;
	this.url;
	this.text;

	this.init = function(el){
		this.id = el.data('id');
		this.x = el.data('x');
		this.y = el.data('y');
		this.x2 = el.data('x-two');
		this.y2 = el.data('y-two');
		this.title = el.data('title');
		this.url = el.data('url');
		this.text = el.data('text');
	};
};

$(function(){
	var intoPercentsX = function(number, width){
		width = width || 1200;

		return (number * 100)/width + '%';
	},
	intoPercentsY = function(number, height){
		height = height || 851;

		return (number * 100)/height + '%';
	},
	drawHotspots = function(elem, hotspots, width, height){

		var fragment = document.createDocumentFragment(), touchHotspots = {};

		function something(hotspots, spot){

					var figure = document.createElement('figure')
			,ring = document.createElement('span')
			,circle = document.createElement('span')
			,link = document.createElement('a')
			,div = document.createElement('div')
			,title = document.createElement('h3')
			,copy = document.createElement('p');

			figure.className += 'catalogue-slide__hotspot btn-pulse';
			figure.id = 'hotspot--' + hotspots[spot].id;
			figure.style.width = intoPercentsX(hotspots[spot].x2 - hotspots[spot].x, width);
			figure.style.paddingBottom = intoPercentsX(hotspots[spot].y2 - hotspots[spot].y, width); // TODO, double check this logic, why's it using width in a height related thing?
			figure.style.left = intoPercentsX(hotspots[spot].x, width);
			figure.style.top = intoPercentsY(hotspots[spot].y, height);

			ring.className += 'ring';
			circle.className += 'circle';
			circle.innerHTML = '+';


			link.className += 'catalogue-slide__hotspot__anchor';
			link.href = hotspots[spot].url;

			div.className += 'catalogue-slide__hotspot__div';
			title.className += 'catalogue-slide__hotspot__title';
			title.innerHTML = hotspots[spot].title;
			copy.className += 'catalogue-slide__hotspot__copy';
			copy.innerHTML = hotspots[spot].text;

			window.Hammer && (function(){

				touchHotspots.id = new Hammer(link);

				link.addEventListener('click', function(e){
					e.preventDefault();
					e.stopPropagation();
				});

				touchHotspots.id.on('tap', function(e){
					e.preventDefault();

					!$(link).hasClass('is-hovered') ?  $(link).addClass('is-hovered') : (function(){

						window.location = hotspots[spot].url;

					}());

				});

			}());

			div.appendChild(title);
			div.appendChild(copy);
			figure.appendChild(ring);
			figure.appendChild(circle);
			figure.appendChild(link);
			figure.appendChild(div);
			fragment.appendChild(figure);



		}

		for(var spot in hotspots){

	 		something(hotspots, spot)

		}

		elem.appendChild(fragment);

	};

	$('body').on('catalogue-page-loaded', function(event, el){
		var hotspots = [];
		$('.js-hotspot').each(function(){
			var hotspot = new Hotspot();
			hotspot.init($(this));

			hotspots.push(hotspot);
		});

		if($('.js-hotspot-container').data('split')) { // If split image
			var split_one = [];
			$('.js-split-one').find('.js-hotspot').each(function(){
				var hotspot = new Hotspot();
				hotspot.init($(this));

				split_one.push(hotspot);
			});
			var split_two = [];
			$('.js-split-two').find('.js-hotspot').each(function(){
				var hotspot = new Hotspot();
				hotspot.init($(this));

				split_two.push(hotspot);
			});
			drawHotspots(document.getElementById('catalogue-split-one'), split_one, 600);
			drawHotspots(document.getElementById('catalogue-split-two'), split_two, 600);
		}

		drawHotspots(el, hotspots);
	});
});