// funkce pro  zmenu url
$(function () {
	if(changePar==='yes'){
		'use strict';

		queryString.parse = function (str) {
			if (typeof str !== 'string') {
				return {};
			}

			str = str.trim().replace(/^\?/, '');

			if (!str) {
				return {};
			}

			return str.trim().split('&').reduce(function (ret, param) {
				var parts = param.replace(/\+/g, ' ').split('=');
				var key = parts[0];
				var val = parts[1];

				key = decodeURIComponent(key);
				val = val === undefined ? null : decodeURIComponent(val);

				if (!ret.hasOwnProperty(key)) {
					ret[key] = val;
				} else if (Array.isArray(ret[key])) {
					ret[key].push(val);
				} else {
					ret[key] = [ret[key], val];
				}

				return ret;
			}, {});
		};

		queryString.stringify = function (obj) {
			return obj ? Object.keys(obj).map(function (key) {
				var val = obj[key];

				if (Array.isArray(val)) {
					return val.map(function (val2) {
						return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
					}).join('&');
				}

				return encodeURIComponent(key) + '=' + encodeURIComponent(val);
			}).join('&') : '';
		};

		queryString.push = function (key, new_value) {
			var params = queryString.parse(location.search);
			params[key] = new_value;
			var new_params_string = queryString.stringify(params);
			history.pushState({},'', window.location.pathname + '?' + new_params_string);
		};

		if (typeof module !== 'undefined' && module.exports) {
			module.exports = queryString;
		} else {
			window.queryString = queryString;
		}
	}

});

/*************************************************************************************/
/*                                                                                   */
/*                              GALLERY-WITH-VIDEO                                   */
/*                                                                                   */
/* plugin vychazi z owl.carouselu   (doporucena verze 2.2.1)                         */
/* umoznuje do galerie zaradit i videa prehravana flow.playerem                      */
/* videoprehravac se inicializuje az po inicializaci carouselu                       */
/* 2017                                                                              */
/*************************************************************************************/


(function( $ ){

    $.fn.supergallery = function( options ) {
        var settings = $.extend({}, $.fn.supergallery.default,  options);
        var self = this;
        var itemsContainer = $(self).find(settings.itemsContainer);
        var prev = $(self).find(settings.prev);
        var next = $(self).find(settings.next);
        var startPos = settings.pos;
        var desc;
        if (isDesc = 'yes') {
           desc  =   $(self).find(settings.description);
        }
        var down = false;

		// IO measuring
		var ioMeasuring = false;
		if (typeof (ioSettings) == "object") {
			ioMeasuring = true;
			var ioPosition = Number(startPos);

			/**
			 * @name sendIoGalleryEvent
			 * @description Send gallery_photo_viewed and pageviews events to IO tracking system.
			 *
			 * @param fotoNum {Number}
			 */
			var sendIoGalleryEvent = function (fotoNum) {
				var ioPageViewConfig = {
					event: 'pageviews',
					config_page_url: ioSettings.page_url
				};

				if (typeof(ioGallerySettings) == "object") {
					ioPageViewConfig.type_article = 'Gallery photo';
				}

				try {
					window.io(ioPageViewConfig);
				} catch (e) {
					console.error(e);
				}

				// For main galleries only.
				if (typeof(ioGallerySettings) == "object") {
					var ioPhotoViewConfig = {
						event:'gallery_photo_viewed',
						gallery_id: ioGallerySettings.gallery_id,
						img_src: ioGallerySettings.slides[fotoNum].img_src
					};

					try {
						window.io(ioPhotoViewConfig);
					} catch (e) {
						console.error(e);
					}
				}
			};

			// Page view for the first photo expanded.
			sendIoGalleryEvent(startPos);
		}

        //  zviditelneni carouselu po jeho inicalizaci, inicializace playeru, prechod na urcenou pozici

        $(itemsContainer).on('initialized.owl.carousel', function (){
            $(this).css({ 'height': '100%', 'opacity': 1});

            if (isDesc = 'yes') {
                getDescription($('.images-container .owl-item').eq(startPos));
                $(desc).css('display','block');
            }

            $(prev).css('display','block');
            $(next).css('display','block');
            var fancy = $(this).find('a img.popupTransitionCarousel').parent();
            fancy.transitionPopup();

            var jw_layer = false;
            var name, obj;
            $('.gallery-item .video-item').each(function ( item, value){
                name = 'player_' + $(value).data('video-id');
                obj = $(value).data('video-obj');
                if (typeof window[obj] === 'object') {
                    window[name] = new JwPlayer(window[obj]);
                    window[name].construct();
                    jw_layer = true;
                }
            });

            /**
             * fallback for gallery with flowplayer
             */
            if (jw_layer === false && typeof flowplayer === "function") {
                var v_item = $(this).find('.gallery-item .video-item');
                if (v_item.length > 0) {
                    api = flowplayer($(".myplayer"));
                }

                var  video_id, idpl;
                $(v_item).each(function () {
                    video_id = $(this).find('.cnc-video-container .cnc-video').attr('id');
                    idpl = video_id + 'playerobj';
                    if (video_id != undefined) {
                        $('#' + video_id).cnc_flowplayer(eval(idpl));
                    }
                });
            }

            $(this).trigger('to.owl.carousel', startPos, 500);
        });

        
        // iniciallizace carouselu
        var owlcar = $(itemsContainer).owlCarousel({                 
            items: 1,
            lazyLoad: true,
			loop: false,
			slideBy: 1,
            startPosition: startPos,
            videoWidth: settings.carVideoWidth,
            margin: settings.carMargin,  
            rewind: true,
            slideSpeed : settings.carSlideSpeed,
            paginationSpeed : settings.carPaginationSpeed
        });

        var total = Number($(itemsContainer).find('.active .item').data('count').substr(count.indexOf('/')+1));

        /**
         * @name handleNext
         * @description Handle listing next image by button or arrow key.
         */
        var handleNext = function () {
            var idx = $(itemsContainer).find('.active .item').data('position');

            if (idx === total) {
                owlcar.trigger('to.owl.carousel', 0, 100);
            } else {
                owlcar.trigger('next.owl.carousel', settings.carSpeed);
            }
        };

        /**
         * @name handlePrev
         * @description Handle listing previous image by button or arrow key.
         */
        var handlePrev = function () {
            var idx = $(itemsContainer).find('.active .item').data('position');

            if (idx === 1) {
                owlcar.trigger('to.owl.carousel', total-1, 100);
            } else {
                owlcar.trigger('prev.owl.carousel', settings.carSpeed);
            }
        };

        // navigace sipkami
        $(next).on("click", function(e){
            handleNext();
        });

        $(prev).on("click", function(e){
            handlePrev();
        });


        //obsluha klavesami
        $(document).on("keydown", function(e){
            
            if (e.keyCode == 37) {
                if(down) return;
                down = true;
                handlePrev();


            } else if (e.keyCode == 39) {
                if(down) return;
                down = true;
                handleNext();

            } else if (e.keyCode == 27) {
                e=(e||window.event);   
                try{e.preventDefault();}//Non-IE
                catch(x){e.returnValue=false;}//IE
                window.location.href =artURL;
            }

        });

        $(document).on("keyup", function(e){
            down = false;
        });

        
        // aktualizace popisu polozky po posunu v galerii, popripade odeslani udaju pro GA a zmena url
        $(itemsContainer).on('translated.owl.carousel', function(e) {
			var ti = $('.owl-item').eq(e.item.index);
			if (isDesc = 'yes') {
				getDescription(ti);
			}

			if (settings.ga == "yes" && typeof(dataLayer) != 'undefined') {
				sendGA();
			}
			// stop JW player
            window.jwPlayerUtils.allPlayerControl('pause', 'all');
            idx1 = $(itemsContainer).find('.active .item').data('position');
            if (settings.changePar == "yes") {
                changeParam('foto', idx1-1);
            }

			if (ioMeasuring) {
				sendIoGalleryEvent(idx1-1);
			}

			// obnovit reklamu
			adoR.reload();

        });


        // pomocne funkce - popis polozky, udaje pro ga, zmena url

        function getDescription(it){
            ap = $(it).find('.item');

            comment = $(ap).attr('alt');
            author= $(ap).data('author');
            count = $(ap).data('count');
            //comment= $(itemsContainer).find('.active .item').attr('alt'); 
            //author= $(itemsContainer).find('.active .item').data('author');
            //count = $(itemsContainer).find('.active .item').data('count');
            description =  $(desc).find('.description');
            //kk = $(it).find('.item');
            //cmm2 = $(kk).attr('alt');
            if (comment) {
            	$(description).html(comment);
            }

            var separator = '';
            if(comment.length > 65) { 
               $(desc).find('.author').css({'display':'block'});        
            } else  { 
                separator = '&#8226;&#160;';
                $(desc).find('.author').css({'display':'inline'});                
            }

            if (author) {
	            $(desc).find('.author').html('<em>' + separator + 'FOTO: ' + author + '</em>');
            }

            if (count) {
            	$(settings.count).text(count);
            }
        }

        function sendGA () {
            var pagePath = location.pathname + window.location.search;
            var pageTitle = document.title;
            dataLayer.push({'event':'ga.pageview','pagePath':pagePath,'pageTitle':pageTitle});
        }

        function changeParam (text, pos){
           queryString.push(text, pos);
        }

    };

    //defaultni nastaveni pluginu

    $.fn.supergallery.default = {
        itemsContainer: ".images-container",
        prev: ".prev",
        next: ".next",
        pos: 1,
        description:  ".image-description",
        count: ".image-count",
        author: ".author",
        ads: "no",
        ga: "yes",
        changePar: "yes",
        carItems: 1,
        carLazyLoad: true,
        carVideo: true,
        carVideoWidth: '91%',
        carMargin: 10,  
        carSlideSpeed : 2,
        carPaginationSpeed : 1,
        carNav: false,
        carSpeed: 500
    }

}( jQuery ));

