document.getElementById('daisy-catalogue') && (function($){

	document.querySelector('.touch') && (function(){

		$(window).width() < 480 && (function(){

			window.location = '/category/view/39';

		}());

		var hammerScript = document.createElement("script"),
			catalogueEl =  document.getElementById('daisy-catalogue'),
			defer = function(callback){
				window.Hammer ? callback() : setTimeout(function(){
					defer(callback);
				}, 50);
			},
			addTouch = function(){
				var hammerTouch = new Hammer(catalogueEl);

				hammerTouch.on('swipeleft', function(){
					$('#js-catalogue-next').trigger('click');
				});

				hammerTouch.on('swiperight', function(){
					$('#js-catalogue-prev').trigger('click');
				});
			};

		hammerScript.type = "text/javascript";
		hammerScript.src = "/assets/js/hammer.min.js";
		document.body.appendChild(hammerScript);

		defer(addTouch);

	}());

	var $catalogElem = $('#daisy-catalogue'),
		intoPercentsX = function(number, width){
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

		},
		elementTimeOuts = function(old, newEl, orientation){
			if(old.length){
				nativeOld = old.get(0);
				setTimeout(function(){
					nativeOld.className += ' ' + oppositeOrientation;
					newEl.className = newEl.className.replace(new RegExp('(^|\\b)' + orientation.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
				}, 0);
			} else{
				setTimeout(function(){
					newEl.className = newEl.className.replace(new RegExp('(^|\\b)' + orientation.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
				}, 0);
			}
		},
		getPage = function(page, index, orientation){

			orientation = orientation || 'is-right';
			oppositeOrientation = 'is-left';

			orientation === 'is-left' && (function(){

				oppositeOrientation = 'is-right';

			}());

			$.ajax({
				type: 'GET',
				url: '/catalogue/manage/api/pages/'+page,
				context: $catalogElem
			}).done(function(data) {
				var $this = $(this),
					nativeThis = $this.get(0),
					old = $this.find('.catalogue-slide'),
					newEl,
					nativeOld;

				!$this.addClass('is-expanded') && $this.addClass('is-expanded');

				newEl = document.createElement('div');
				newEl.className += 'catalogue-slide is-loaded ' + orientation;
				$(newEl).append(data);
				$(nativeThis).append(newEl);
				elementTimeOuts(old, newEl, orientation);
				var stateObj = { cataloguePage: page };

				setTimeout(function(){
					if(old.length){
						old.get(0).parentNode.removeChild(old.get(0));
					}
					$catalogElem.data('active', page);

					index < 10 ? document.getElementById('js-catalogue-current-page').innerHTML = '0'+index : document.getElementById('js-catalogue-current-page').innerHTML = +index;
				}, 382);

				!document.documentElement.className.match('lt-ie9') && history.pushState(stateObj, 'page'+page, '/catalogue/page/'+page);

				/*newEl = document.createElement('div');
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

				newImg.src = data.data.image.url;*/
			});
		};

	!!(typeof $catalogElem.data('go') === 'number') && (function(){

		var activeId = $catalogElem.data('go'), index = $catalogElem.find('#thumb--'+activeId).find('a').data('index');

		getPage(activeId, index);
	}());



	$(document).on('click', '.js-catalogue-page-trigger', function(e){
		e.preventDefault();

		var $this = $(this), pageId = $this.data('page'), pageIndex = $this.data('index');

		getPage(pageId, pageIndex);

		$('.catalogue-pagination').slideDown();

	});

	$(document).on('mouseenter', '.catalogue-slide__hotspot__anchor', function(e){

		e.preventDefault();

		 $(this).addClass('is-hovered');

	});
    
    $(document).on('mouseenter', '.lt-ie9 .catalogue-slide__hotspot', function(e){

		e.preventDefault();

		 $(this).find('.catalogue-slide__hotspot__anchor').css('display', 'block');
         $(this).find('.catalogue-slide__hotspot__div').css('display', 'block');


	});
    

	$(document).on('mouseleave', '.catalogue-slide__hotspot__anchor', function(e){
		e.preventDefault();
		 $(this).removeClass('is-hovered');

	});
    
    $(document).on('mouseleave', '.lt-ie9 .catalogue-slide__hotspot', function(e){

		e.preventDefault();

        $(this).find('.catalogue-slide__hotspot__anchor').css('display', 'none');
        $(this).find('.catalogue-slide__hotspot__div').css('display', 'none');

	});

	$(document).on('click', '#js-catalogue-prev, #js-catalogue-pagination-prev', function(e){
		e.preventDefault();

		var $container = $catalogElem,
			activeId = $container.data('active'),
			$activeThumb = $container.find('#thumb--'+activeId);


		$activeThumb.prev('figure').length ? (function(){

			$prev = $activeThumb.prev('figure').find('a');

			getPage($prev.data('page'), $prev.data('index'), 'is-left');

		}()) : (function(){

			$last = $container.find('.js-catalogue-thumb').last().find('a');

			getPage($last.data('page'), $last.data('index'), 'is-left');

		}());



	});

	$(document).on('click', '#js-catalogue-next, #js-catalogue-pagination-next', function(e){
		e.preventDefault();
		var $container = $catalogElem,
			activeId = $container.data('active'),
			$activeThumb = $container.find('#thumb--'+activeId);

		$activeThumb.next('figure').length ? (function(){

			$next = $activeThumb.next('figure').find('a');

			getPage($next.data('page'), $next.data('index'));

		}()) : (function(){

			$first = $container.find('.js-catalogue-thumb').first().find('a');

			getPage($first.data('page'), $first.data('index'));

		}());

	});

	$(document).on('click', '#js-catalogue-close', function(e){

		e.preventDefault();

		$('.catalogue-slide').length && (function(){

			$('.catalogue-slide').remove();
			document.getElementById('js-catalogue-current-page').innerHTML = '00';
			$catalogElem.removeClass('is-expanded');
			var stateObj = { cataloguePage: null };
			history.pushState(stateObj, 'no page', '/catalogue');

		}());

		$('.catalogue-pagination').slideUp();


	});
}(jQuery));