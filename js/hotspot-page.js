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


		drawHotspots(el, hotspots);

		/*if(data.data.split_image === '1') { // If split image
			drawHotspots(newDiv1, data.data.hotspots.split_one, 600);
			drawHotspots(newDiv2, data.data.hotspots.split_two, 600);
		}*/
	});
});

/**************** SPLIT IMAGE STUFFS *******************

newEl = document.createElement('div');
newImg = document.createElement('img');
newImg.className += 'scale-with-grid catalogue__main';

newImg.onload = function(){
	// Single Image
	newEl.className += 'catalogue-slide is-loaded ' + orientation;
	newEl.appendChild(newImg);
	nativeThis.appendChild(newEl);

	if(data.data.split_image === '1') { // If split image
		newDiv1 = document.createElement('div');
		newDiv2 = document.createElement('div');

		newDiv1.style.backgroundImage = "url("+data.data.image.url+")";
		newDiv2.style.backgroundImage = "url("+data.data.image.url+")";

		newDiv1.className += 'catalogue__split catalogue__split--1';
		newDiv2.className += 'catalogue__split catalogue__split--2';

		newEl.appendChild(newDiv1);
		newEl.appendChild(newDiv2);
		nativeThis.appendChild(newEl);
	}

	elementTimeOuts(old, newEl, orientation);

	var stateObj = { cataloguePage: page };
	!document.documentElement.className.match('lt-ie9') && history.pushState(stateObj, 'page'+page, '/catalogue/page/'+page);

	setTimeout(function(){
		drawHotspots(newEl, data.data.hotspots.all);

		if(data.data.split_image === '1') { // If split image
			drawHotspots(newDiv1, data.data.hotspots.split_one, 600);
			drawHotspots(newDiv2, data.data.hotspots.split_two, 600);
		}

		if(old.length){
			old.get(0).parentNode.removeChild(old.get(0));
		}
		$catalogElem.data('active', data.data.id);

		index < 10 ? document.getElementById('js-catalogue-current-page').innerHTML = '0'+index : document.getElementById('js-catalogue-current-page').innerHTML = +index;
	}, 382);
}

newImg.src = data.data.image.url;

*******************************************************/