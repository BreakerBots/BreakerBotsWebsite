//Text Area For Profile Desc
function initAutoResizeTextArea(textarea) {
	textarea.addEventListener('keydown', autosize);
	function autosize() {
		var el = this;
		setTimeout(function () {
			el.style.padding = 0; el.style.height = "auto";
			el.style.height = el.scrollHeight + 'px';
		}, 0);
	}
} initAutoResizeTextArea(document.querySelector('textarea'));
