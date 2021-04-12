function goToUri(href) {
	if (typeof(href) != 'undefined') {
		if (href.indexOf('dialog/send') != -1) {
			// FB messenger need parameter link and redirect_uri
			window.open(href + '&redirect_uri=' + $shareStripUrl + '&display=popup', '_blank', 'toolbar=no,scrollbars=yes,resizable=no,fullscreen=no,top=50,left=50,width=645,height=580');
		}
		else {
			window.open(href, '_blank', 'toolbar=no,scrollbars=yes,resizable=no,fullscreen=no,top=50,left=50,width=645,height=580');
		}
	}
}

$(document).ready(function() {

	$('a.intent').on('click', function (event) {
		event.preventDefault();

		var typeOfService = undefined;
		if ($(this).parent().hasClass('facebook')) {
			typeOfService = 'facebook';
		} else if ($(this).parent().hasClass('twitter')) {
			typeOfService = 'twitter';
		} else if ($(this).parent().hasClass('messenger')) {
			typeOfService = 'messenger';
		} else if ($(this).parent().hasClass('whatsapp')) {
			typeOfService = 'whatsapp';
		}

		dataLayer.push({
			'event': 'ga.event',
			'eCategory': 'Social_button',
			'eAction': 'click',
			'eLabel': typeOfService
		});

		goToUri($(this).data('fallback-uri'));
		return false;
	});

	$('.share.e-mail').click(function (e) {
		dataLayer.push({
			'event': 'ga.event',
			'eCategory': 'Social_button',
			'eAction': 'click',
			'eLabel': 'mail'
		});
	});
});

