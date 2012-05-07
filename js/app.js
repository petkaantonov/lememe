var meme_image_list = $('#meme-images > li'),
	active_meme = meme_image_list.filter('.active')[0].children[0].getAttribute('data-img'),
	color_list = $('#meme-color > li'),
	active_color = color_list.filter('.active')[0].children[0].getAttribute('data-color'),
	canvas = $('#cvs')[0],
	top_input = $('#text-top'),
	bottom_input = $('#text-bottom'),
	generate = $('#generate'),
	userlink = $('#img-link'),
	spinner = $('#spinner'),
	api_key_btn = $('#api-key'),
	api_key_input = $('#api-key-input'),
	api_key_form = $('#api-key-form'),
	ctx = canvas.getContext('2d'),
	hold_top = '',
	hold_bottom = '',
	PATH = 'images/';
function draw() {
	var img = $("<img />")[0];
	img.src = PATH + active_meme;
	img.onload = function(e) {
		canvas.height = img.height;
		canvas.width = img.width;
		ctx.save();
		ctx.font = "20pt Arial";
		ctx.textAlign = "center";
		ctx.fillStyle = active_color;
		ctx.clearRect(0, 0, img.height, img.width);
		ctx.drawImage(img, 0, 0, img.width, img.height);
		ctx.fillText(hold_top, img.width / 2, 30, img.width);
		ctx.fillText(hold_bottom, img.width / 2, img.height - 20, img.width);
		ctx.restore();
	};
}
// top line input
top_input.keyup(function(e) {
   hold_top = this.value;
	draw();
});
// bottom line input
bottom_input.keyup(function(e) {
   hold_bottom = this.value;
	draw();
});
// meme image dropdown
meme_image_list.click(function(e) {
	meme_image_list.each(function(i, el) {
		if (e.target.parentNode != el) {
			el.className = '';
		} else {
			el.className = 'active';
			active_meme = el.children[0].getAttribute('data-img');
		}
	});
	draw();
});
// meme color dropdown
color_list.click(function(e) {
	color_list.each(function(i, el) {
		if (e.target.parentNode != el) {
			el.className = '';
		} else {
			el.className = 'active';
			active_color = el.children[0].getAttribute('data-color');
		}
	});
	draw();
});
generate.click(function(e) {
	e.preventDefault();
	spinner.show();
	var dataURL = canvas.toDataURL("image/png").split(',')[1];
	$.ajax({
		url: 'http://api.imgur.com/2/upload.json',
		type: 'POST',
		data: {
			type: 'base64',
			key: $('#api-key-input').val(),
			image: dataURL
		},
		dataType: 'json'
	}).success(function(data) {
		top_input.val('');
		bottom_input.val('');
		spinner.hide();
		userlink.val(data['upload']['links']['original']);
		userlink[0].select();
		userlink[0].focus();
	}).error(function() {
		alert('Could not reach api.imgur.com. Sorry :(');
		spinner.hide();
	});
});
api_key_form.submit(function(e) {
	e.preventDefault();
});
function update_key(e) {
	$(this).unbind('blur', update_key);
	api_key_btn.show();
	api_key_input.hide();
}
api_key_btn.click(function(e) {
	api_key_btn.hide();
	api_key_input.show();
	api_key_input.bind('blur', update_key);
	api_key_input[0].select();
	api_key_input[0].focus();
});
draw();
