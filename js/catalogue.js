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

					$('body').trigger('catalogue-page-loaded', [newEl]);

					index < 10 ? document.getElementById('js-catalogue-current-page').innerHTML = '0'+index : document.getElementById('js-catalogue-current-page').innerHTML = +index;
				}, 382);

				!document.documentElement.className.match('lt-ie9') && history.pushState(stateObj, 'page'+page, '/catalogue/page/'+page);

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