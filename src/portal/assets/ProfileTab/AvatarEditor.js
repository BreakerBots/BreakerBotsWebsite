// AvatarEditor.js
class AvatarEditor {
	/**
	 * Just Give It A Div and It will do the Magic
	 * Then Call .get to the get the result at any time
	 * @param el The Div
	 */
	constructor(el, onimageselected) {
		var sel = this;
		el.innerHTML = `
						<div class="bs-file-upload mdc-ripple-surface noselect" data-mdc-auto-init="MDCRipple" style="width: 100%; height: 100%;">
							<i class="material-icons bs-file-upload-icon">cloud_upload</i>
							<h1 class="bs-file-upload-text">Click or Drop Your File</h1>
							<input type="file" style="display: none">
						</div>`;
		sel.wrapper = el;
		sel.el = el.querySelector('.bs-file-upload');
		sel.onimageselected = onimageselected;
		window.mdc.autoInit(sel.el.parentNode);

		sel.file = null;

		//Dropped
		var RippleActive = false;
		sel.el.ondrop = function () {
			event.preventDefault();
			if (event.dataTransfer.items) {
				if (event.dataTransfer.items[0].kind === 'file') {
					sel.file = event.dataTransfer.items[0].getAsFile();
				}
			} else {
				sel.file = event.dataTransfer.files[0];
			}
			if (RippleActive) { sel.el.MDCRipple.deactivate(); RippleActive = false; }
			if (event.dataTransfer.items) {
				event.dataTransfer.items.clear();
			} else {
				event.dataTransfer.clearData();
			}
			if (sel.file) StartEditing();
		};

		//Open File Chooser
		sel.el.onclick = function () {
			sel.el.querySelector('input').click();
		};

		//File Chosen
		sel.el.querySelector('input').onchange = function () {
			event.preventDefault();
			if (event.srcElement.files[0])
				sel.file = event.srcElement.files[0];
			if (sel.file) StartEditing();
		};

		//Hover
		sel.el.ondragover = function () {
			event.preventDefault();
			if (!RippleActive) { sel.el.MDCRipple.activate(); RippleActive = true; }
		};

		//Unhover
		sel.el.ondragleave = function () {
			event.preventDefault();
			if (RippleActive) { sel.el.MDCRipple.deactivate(); RippleActive = false; }
		};

		function StartEditing() {
			try {
				if (!sel.editing && sel.file) {
					sel.wrapper.innerHTML = `
									<div class="bs-file-upload noselect" style="width: 100%; height: 100%;">
										<img style="width: 90%;" src="` + URL.createObjectURL(sel.file) + `"/>
										<input type="file" style="display: none">
									</div>
								`;
					sel.el = sel.wrapper.querySelector('div');
					setTimeout(function () {
						sel.editor = new Breakercrop(sel.el.querySelector('img'), {
							viewport: {
								width: 300,
								height: 300
							},
							boundary: {
								width: sel.el.getBoundingClientRect().width.min(200),
								height: (sel.el.getBoundingClientRect().height - 50).min(250)
							}
						});
						if (sel.onimageselected) sel.onimageselected();
					}, 20);
				}
			} catch (err) { console.error('Caught', err); }
		}
	}

	/**
	 * Returns base64 of the Edited Avatar Throgh the promise
	 */
	get(callback) {
		if (this.editor) {
			return this.editor.result().then(callback);
		}
		return;
	}
}