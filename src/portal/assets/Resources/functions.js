//Remove item from array
Array.prototype.remove = function (item) {
	if (this.includes(item)) {
		var index = this.indexOf(item);
		if (index !== -1) this.splice(index, 1);
	}
}

//Expanding textarea
function initAutoResizeTextArea(textarea) {
	textarea.addEventListener('input', autosize);
	setInterval(autosize, 1000);
	autosize();
	function autosize() {
		var el = textarea;
		setTimeout(function () {
			if (el.style != undefined) {
				el.style.overflow = "hidden";
				el.style.height = "auto";
				el.style.height = el.scrollHeight + 'px';
			}
		}, 0);
	}
} initAutoResizeTextArea(document.querySelector('textarea'));