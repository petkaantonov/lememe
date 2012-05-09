/* Vars */

var meme_image_list = $('#meme-images > li'),
	font_list = $('#meme-fonts > li'),
	active_meme = meme_image_list.filter('.active')[0].children[0].getAttribute('data-img'),
	color1 = $('#color1'),
	color2 = $('#color2'),
	meme_label = $('#label-active-meme'),
	font_label = $('#label-active-font'),
	canvas = $('#cvs')[0],
	top_input = $('#text-top'),
	bottom_input = $('#text-bottom'),
	generate = $('#generate'),
	userlink = $('#img-link'),
	spinner = $('#spinner'),
	font_slider = $("#slider-font-size"),
	font_size = $("#font-size"),
	api_key_btn = $('#api-key'),
	api_key_input = $('#api-key-input'),
	ctx = canvas.getContext('2d'),
	PATH = 'images/';

/* Draw function
 * I render the image on the page
 * */
function draw() {
	var img = $("<img />")[0];
	img.src = PATH + active_meme;
	img.onload = function(e) {
		var font_offset = font_size.val()*.95;
		canvas.height = img.height;
		canvas.width = img.width;
		ctx.save();
		ctx.font = "bold " + font_size.val() + "px Arial";
		ctx.textAlign = "center";
		ctx.fillStyle = color1.val();
		ctx.strokeStyle = color2.val();
		ctx.lineWidth = Math.floor(font_size.val()/20);
		ctx.clearRect(0, 0, img.height, img.width);
		ctx.drawImage(img, 0, 0, img.width, img.height);
		ctx.fillText(top_input.val(), img.width / 2, font_offset, img.width);
		ctx.strokeText(top_input.val(), img.width / 2, font_offset, img.width);
		ctx.fillText(bottom_input.val(), img.width / 2, img.height - font_offset/3, img.width);
		ctx.strokeText(bottom_input.val(), img.width / 2, img.height - font_offset/3, img.width);

		ctx.restore();
	};
}

function swap_active_meme(e) {
	meme_image_list.each(function(i, el) {
		if (e.target.parentNode != el) {
			el.className = '';
		} else {
			el.className = 'active';
			active_meme = el.children[0].getAttribute('data-img');
		}
	});
	draw();
	e.preventDefault();
}

function image_uploaded(data) {
	top_input.val('');
	bottom_input.val('');
	Notifier.success('Your image has been uploaded successfully.', 'Complete!');
	spinner.hide();
	userlink.val(data['upload']['links']['original']);
	userlink[0].select();
	userlink[0].focus();
}
function image_upload_failed() {
	Notifier.error('Could not reach imgur service. Enter a new API Key or wait a few minutes and try again.', 'Error!');
	spinner.hide();
}

function generate_meme(e) {
	spinner.show();
	var dataURL = canvas.toDataURL("image/png").split(',')[1];
	$.ajax({
		url: 'http://api.imgur.com/2/upload.json',
		type: 'POST',
		data: {
			type: 'base64',
			key: api_key_input.val(),
			image: dataURL
		},
		dataType: 'json'
	}).success(image_uploaded).error(image_upload_failed);
	e.preventDefault();
	return false;
}

function update_api_key(e) {
	if( $.cookie('lememe-api-key') != $(this).val() ) {
		$.cookie('lememe-api-key', $(this).val(), { expires: 7 });
		Notifier.info('Your API KEY will be rememberd in your browsers cookies for 7 days. If you would like to revert to the old key please clear your browsers cookies and refresh the page.', 'API KEY Saved!');
	}
	$(this).unbind('blur', update_api_key);
	api_key_btn.show();
	api_key_input.hide();
	e.preventDefault();
	return false;
}

function show_api_key_input(e) {
	api_key_btn.hide();
	api_key_input.show();
	api_key_input.bind('blur', update_api_key);
	api_key_input[0].select();
	api_key_input[0].focus();
	e.preventDefault();
	return false;
}

function register_events() {
	$([top_input[0], bottom_input[0]]).on('keyup', draw);
	meme_image_list.on('click', swap_active_meme);
	generate.on('click', generate_meme);
	api_key_btn.on('click', show_api_key_input);
	
	/* quick and dirty disable form submission */
	$('.nosubmit-form').submit(function(e) {
		e.preventDefault();
		return false;
	});
}

function init() {
	
	register_events();
	
	/* color picker init */
	$('input.color-picker').miniColors({
		change: function(hex, rgb) {
			draw();
		}
	});

	/* font slider init and control */
	font_slider.slider({
		range: "max",
		min: 16,
		max: 60,
		value: 20,
		slide: function(event, ui) {
			font_size.val(ui.value);
		},
		change: function(event, ui) {
			draw();
		}
	});
	font_size.val(font_slider.slider("value"));

	/* preview font faces */
	font_list.each(function(li) {
		var link = li.children('a');
		link.css('font-family', link[0].getAttribute('data-font'));
	});

	/* check for stored api key */
	if( $.cookie('lememe-api-key') ) {
		api_key_input.val($.cookie('lememe-api-key'));
	}
	/* draw the default image */
	draw();
}

init();
