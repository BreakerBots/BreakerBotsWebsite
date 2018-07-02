// RichTextEditor.js

class BreakerRichText {
	/**
	 * BreakerRichText is a handler for a simple rich text editor
	 * The Editor has the functions: Bold, Italic, Underline, Strikethrough, Undo, Redo, Change Text Color, Change Fill Color, Change Text Size, Insert Link, Insert Image, Align Left, Center, Right, Fill, Create Bulleted List and Create Numbered List
	 * @param {any} el El is any div you want to attach this editor to, no classes or anything are necessary though having a set width and height is recomended
	 * @param {String} content Content is a preset text to have in the editor, you can also get .content to set or get
	 * @param {object} options (Optional) Options are options for the editor is the form an object, with any of optional the parameters:
	 *		textColor: BOOLEAN
	 *		fillColor: BOOLEAN
	 *		textSize: BOOLEAN
	 *		link: BOOLEAN
	 *		image: BOOLEAN
	 *		align: BOOLEAN
	 *		lists: BOOLEAN
	 *	** All Paramters default to true is not specifified otherwise
	 */
	constructor(el, content, options) {
		this.el = el;
		this.el.classList.add('BreakerRichText-Main');

		options = formatOptions(options);
		function formatOptions(options) {
			var defOptions = {
				textColor: true,
				fillColor: true,
				textSize: true,
				link: true,
				image: true,
				align: true,
				lists: true
			};
			try {
				if (options) {
					if ((typeof options) == "object") {
						a('textColor');
						a('fillColor');
						a('textSize');
						a('link');
						a('image');
						a('align');
						a('lists');
					}
					function a(b) {
						try {
							if (typeof options[b] == "boolean")
								defOptions[b] = options[b];
						} catch (err) { }
					}
				}
			} catch (err) { console.log(err); }
			return defOptions;
		}

		this.el.innerHTML = `
						<div class="BreakerRichText-Toolbar">
							<div class="BreakerRichText-ToolbarSection">
								<div data-BRTC="undo" aria-label="Undo (Ctrl+Z)" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									undo
								</i></div>
								<div data-BRTC="redo" aria-label="Redo (Ctrl+Y)" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									redo
								</i></div>
							</div>
							<div class="BreakerRichText-ToolbarSection">
								<div data-BRTC="bold" aria-label="Bold (Ctrl+B)" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_bold
								</i></div>
								<div data-BRTC="italic" aria-label="Italic (Ctrl+I)" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_italic
								</i></div>
								<div data-BRTC="underline" aria-label="Underline (Ctrl+U)" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_underline
								</i></div>
								<div data-BRTC="strikethrough" aria-label="Strikethrough" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									strikethrough_s
								</i></div>
							</div>`
							+ (options.textColor || options.fillColor ? (`
							<div class="BreakerRichText-ToolbarSection">` + 
								( options.textColor ?
								`<div onclick="menu.toggle(this.parentNode.querySelector('.BreakerRichText-TextColorMenu').innerHTML, this)" aria-label="Text Color" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
										format_color_text
									</i>
									<div class="BreakerRichText-TextColor" style="width: 25px; height: 4px; position: absolute; left: 9px; top: 29px;"></div>
								</div>
								<div class="BreakerRichText-TextColorMenu dropdown-menu-c dropdown-menu" data-menu-offset="-9 7">
									<div onmousedown="event.preventDefault(); if (event.srcElement.classList.contains('BreakerRichText-TextColorMenu-Color')) { document.execCommand('styleWithCSS', false, true);
										document.execCommand('foreColor', false, event.srcElement.style.backgroundColor); menu.close(); }	" class="BreakerRichText--ColorAutofill"></div>
								</div>` : ``) + 
								(options.fillColor ?
								`<div onclick="menu.toggle(this.parentNode.querySelector('.BreakerRichText-TextFillMenu').innerHTML, this)" aria-label="Fill Color" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
										format_color_fill
									</i>
									<div class="BreakerRichText-FillColor" style="width: 25px; height: 4px; position: absolute; left: 9px; top: 29px;"></div>
								</div>
								<div class="BreakerRichText-TextFillMenu dropdown-menu-c dropdown-menu" data-menu-offset="-9 7">
									<div onmousedown="event.preventDefault(); if (event.srcElement.classList.contains('BreakerRichText-TextColorMenu-Color')) { document.execCommand('styleWithCSS', false, true);
										document.execCommand('backColor', false, event.srcElement.style.backgroundColor); menu.close(); }	" class="BreakerRichText--ColorAutofill"></div>
								</div>` : ``) + `
							</div>`) : ``) +
							(options.textSize ? 
							`<div class="BreakerRichText-ToolbarSection">
								<div onclick="menu.toggle(this.parentNode.querySelector('.BreakerRichText-FontSizeMenu').innerHTML, this.parentNode)" aria-label="Text Size" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><span class="BreakerRichText-FontSizeDisplay">
									11px
								</span></div>
								<div class="BreakerRichText-FontSizeMenu dropdown-menu-c dropdown-menu" style="width: 80px; min-width: 80px;" data-menu-offset="-9 7">
									<div onmousedown="
										event.preventDefault(); 
										if (event.srcElement.dataset.fontSizeVal) { 
											document.execCommand('fontSize', false, event.srcElement.dataset.fontSizeVal || 3); 
											setTimeout(function () { menu.close(); }, 150);
										}	">
										<ul class="mdc-list BreakerRichText-FontSizeMenu-List">
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="1">8px</li>
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="2">10px</li>
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="3">12px</li>
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="4">14px</li>
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="5">18px</li>
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="6">24px</li>
										  <li data-mdc-auto-init="MDCRipple" class="mdc-list-item" data-font-size-val="7">30px</li>
										</ul>
									</div>
								</div>
							</div>` : ``) +
							(options.image || options.link ? (`
							<div class="BreakerRichText-ToolbarSection">` + 
								( options.link ?
								`<div onclick="menu.toggle(this.parentNode.querySelector('.BreakerRichText-InsertLinkMenu').innerHTML, this.parentNode, 'width: 300px')" aria-label="Insert Link" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									insert_link
								</i></div>
								<div class="BreakerRichText-InsertLinkMenu" style="display: none">
									<div class="form-group" style="width: 90%; min-height: 50px; max-height: 50px; margin: 10px 0 10px 15px;">
										<input onmousedown="linkSel = saveSelection();" type="url" value="" class="form-control" placeholder="https://www.example.com" autocomplete="off">
									</div>
									<button onmousedown="restoreSelection(linkSel); var sel = this; if (sel.parentNode.querySelector('input').validity.valid) setTimeout(function () { document.execCommand('createLink', false, sel.parentNode.querySelector('input').value || ''); menu.close(); }, 10);" style="float: right; margin-right: 15px;" class="mdc-button mdc-button--raised" data-mdc-auto-init="MDCRipple">Add</button>
									<button onclick="menu.close()" style="float: right; margin-right: 5px; margin-bottom: 10px;" class="mdc-button" data-mdc-auto-init="MDCRipple">Cancel</button>
								</div>` : ``) +
								( options.image ? 
								`<div onclick="this.querySelector('input').click();" aria-label="Insert Media" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									insert_photo
								</i>
								<input onchange="
									if (this.parentNode.parentNode.parentNode.parentNode.querySelector('.BreakerRichText-Editor').innerHTML.length < 10000000) {
										resizeImage({
											file: this.files[0],
											maxSize: 800
										}).then(function (resizedImage) {
											var reader = new FileReader();
											reader.readAsDataURL(resizedImage);
											reader.onload = function () {
												document.execCommand('insertHTML', false, \`<img src='\` + reader.result + \`' class='BreakerRichText-Image' style='width: 100%; max-width: 300px; border-radius: 3px; margin: 2px;' > \`);
											};
										}).catch(function (err) {
											console.error(err);
										});
									}
								" type="file" style="display: none" accept="image/*">
								</div>` : ``) + `
							</div>`) : ``) +
							 ( options.align ? 
							`<div class="BreakerRichText-ToolbarSection">
								<div data-BRTC="justifyLeft" aria-label="Align Left" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_align_left
								</i></div>
								<div data-BRTC="justifyCenter" aria-label="Align Center" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_align_center
								</i></div>
								<div data-BRTC="justifyRight" aria-label="Align Right" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_align_right
								</i></div>
								<div data-BRTC="justifyFull" aria-label="Align Full" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_align_justify
								</i></div>
							</div>` : ``) +
							( options.lists ?
							`<div class="BreakerRichText-ToolbarSection">
								<div data-BRTC="insertUnorderedList" aria-label="Insert Bulleted List" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_list_bulleted
								</i></div>
								<div data-BRTC="insertOrderedList" aria-label="Insert Numbered List" aria-label-z-index="1000" aria-label-delay="0.2s" class="BreakerRichText-Tool mdc-ripple-surface" data-mdc-auto-init="MDCRipple"><i class="material-icons">
									format_list_numbered
								</i></div>
							</div>` : ``) + `
						</div>
						<div class="BreakerRichText-Editor" contenteditable>
							` + (content || "") + `
						</div>
					`;
		this.toolbar = this.el.querySelector('.BreakerRichText-Toolbar');
		this.editor = this.el.querySelector('.BreakerRichText-Editor');
		var sel = this;

		setTimeout(function () {
			[].forEach.call(sel.toolbar.querySelectorAll('.BreakerRichText--ColorAutofill'), function (item) {
				item.innerHTML = `
				<div style="display: flex; flex-wrap: wrap; flex-direction: row; width: 307px; height: 400px; padding: 10px 12px 10px 12px;">
					<div style="background-color: #FFEBEE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFCDD2" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EF9A9A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E57373" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EF5350" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F44336" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E53935" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D32F2F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C62828" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B71C1C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF8A80" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF5252" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF1744" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D50000" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FCE4EC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F8BBD0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F48FB1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F06292" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EC407A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E91E63" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D81B60" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C2185B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #AD1457" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #880E4F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF80AB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF4081" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F50057" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C51162" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F3E5F5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E1BEE7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #CE93D8" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #BA68C8" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #AB47BC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #9C27B0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #8E24AA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #7B1FA2" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #6A1B9A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4A148C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EA80FC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E040FB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D500F9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #AA00FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EDE7F6" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D1C4E9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B39DDB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #9575CD" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #7E57C2" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #673AB7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #5E35B1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #512DA8" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4527A0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #311B92" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B388FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #7C4DFF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #651FFF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #6200EA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E8EAF6" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C5CAE9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #9FA8DA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #7986CB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #5C6BC0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #3F51B5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #3949AB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #303F9F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #283593" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #1A237E" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #8C9EFF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #536DFE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #3D5AFE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #304FFE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E3F2FD" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #BBDEFB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #90CAF9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #64B5F6" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #42A5F5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #2196F3" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #1E88E5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #1976D2" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #1565C0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #0D47A1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #82B1FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #448AFF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #2979FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #2962FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E1F5FE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B3E5FC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #81D4FA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4FC3F7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #29B6F6" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #03A9F4" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #039BE5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #0288D1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #0277BD" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #01579B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #80D8FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #40C4FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00B0FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #0091EA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E0F7FA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B2EBF2" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #80DEEA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4DD0E1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #26C6DA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00BCD4" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00ACC1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #0097A7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00838F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #006064" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #84FFFF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #18FFFF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00E5FF" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00B8D4" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E0F2F1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B2DFDB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #80CBC4" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4DB6AC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #26A69A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #009688" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00897B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00796B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00695C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #004D40" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #A7FFEB" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #64FFDA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #1DE9B6" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00BFA5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E8F5E9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C8E6C9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #A5D6A7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #81C784" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #66BB6A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4CAF50" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #43A047" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #388E3C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #2E7D32" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #1B5E20" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B9F6CA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #69F0AE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00E676" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #00C853" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F1F8E9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #DCEDC8" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C5E1A5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #AED581" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #9CCC65" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #8BC34A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #7CB342" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #689F38" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #558B2F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #33691E" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #CCFF90" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B2FF59" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #76FF03" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #64DD17" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F9FBE7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F0F4C3" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E6EE9C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #DCE775" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D4E157" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #CDDC39" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C0CA33" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #AFB42B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #9E9D24" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #827717" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F4FF81" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EEFF41" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #C6FF00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #AEEA00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFFDE7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFF9C4" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFF59D" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFF176" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFEE58" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFEB3B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FDD835" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FBC02D" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F9A825" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F57F17" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFFF8D" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFFF00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFEA00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFD600" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFF8E1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFECB3" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFE082" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFD54F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFCA28" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFC107" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFB300" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFA000" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF8F00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF6F00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFE57F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFD740" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFC400" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFAB00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFF3E0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFE0B2" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFCC80" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFB74D" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFA726" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF9800" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FB8C00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F57C00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EF6C00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E65100" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFD180" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFAB40" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF9100" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF6D00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FBE9E7" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFCCBC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FFAB91" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF8A65" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF7043" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF5722" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F4511E" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E64A19" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D84315" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #BF360C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF9E80" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF6E40" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FF3D00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #DD2C00" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EFEBE9" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #D7CCC8" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #BCAAA4" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #A1887F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #8D6E63" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #795548" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #6D4C41" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #5D4037" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #4E342E" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #3E2723" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff; border: 1px solid black;" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #FAFAFA" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #F5F5F5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #EEEEEE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #E0E0E0" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #BDBDBD" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #9E9E9E" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #757575" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #616161" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #424242" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #212121" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ffffff" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #ECEFF1" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #CFD8DC" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #B0BEC5" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #90A4AE" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #78909C" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #607D8B" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #546E7A" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #455A64" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #37474F" class="BreakerRichText-TextColorMenu-Color"></div>
					<div style="background-color: #263238" class="BreakerRichText-TextColorMenu-Color"></div>
				</div>
				`;
			});
		}, 10);

		this.toolbar.onclick = function () {
			var el = event.srcElement;
			if (!el.dataset.brtc) el = el.parentNode;
			if (el.dataset.brtc) sel.parseCommand(el.dataset.brtc);
			sel.checkSelection();
		}

		this.editor.onkeydown = function () {
			sel.checkSelection();
			//Tabbing
			if (event.keyCode == 9) {
				document.execCommand('insertHTML', false, '&emsp;');
				event.preventDefault();
			}
			else if (sel.editor.innerHTML.length > 10000000 && isCharacterKeyPress(event)) {
				event.preventDefault();
			}
		}

		this.el.onmousemove = function () { sel.checkSelection(); };
		this.el.onmousedown = function () { sel.checkSelection(); };
	}

	set content(value) {
		this.editor.innerHTML = value;
	}

	get content() {
		return this.editor.innerHTML;
	}

	parseCommand(command) {
		document.execCommand(command, false, null);
	}

	checkSelection() {
		try {
			var toolbar = this.toolbar;
			var a = [
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'justifyLeft',
				'justifyCenter',
				'justifyRight',
				'justifyFull'
			];
			a.forEach(function (item) {
				if (toolbar) {
					if (document.queryCommandState) {
						toolbar.querySelector('[data-brtc="' + item + '"]').style.backgroundColor = document.queryCommandState(item) ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0)";
					}
					else {
						toolbar.querySelector('[data-brtc="' + item + '"]').style.backgroundColor = "rgba(0, 0, 0, 0)";
					}
				}
			});
			try {
				var fontSizes = [0, 8, 10, 12, 14, 18, 24, 30];
				document.querySelector('[aria-label="Text Size"]').childNodes[0].innerText = fontSizes[document.queryCommandValue('fontSize') || 3] + 'px';
			} catch (err) { }
			try {
				document.querySelector('.BreakerRichText-TextColor').style.backgroundColor = document.queryCommandValue('foreColor') || "#ffffff";
				document.querySelector('.BreakerRichText-FillColor').style.backgroundColor = document.queryCommandValue('backColor') || "#ffffff";
			} catch (err) { }
		} catch (err) {  }
	}
}

//Resources
function saveSelection() {
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			return sel.getRangeAt(0);
		}
	} else if (document.selection && document.selection.createRange) {
		return document.selection.createRange();
	}
	return null;
}
var linkSel;
function restoreSelection(range) {
	if (range) {
		if (window.getSelection) {
			sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (document.selection && range.select) {
			range.select();
		}
	}
}
function pasteHtmlAtCaret(html, selectPastedContent) {
	var sel, range;
	if (window.getSelection) {
		// IE9 and non-IE
		sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
			range.deleteContents();

			// Range.createContextualFragment() would be useful here but is
			// only relatively recently standardized and is not supported in
			// some browsers (IE9, for one)
			var el = document.createElement("div");
			el.innerHTML = html;
			var frag = document.createDocumentFragment(), node, lastNode;
			while ((node = el.firstChild)) {
				lastNode = frag.appendChild(node);
			}
			var firstNode = frag.firstChild;
			range.insertNode(frag);

			// Preserve the selection
			if (lastNode) {
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				if (selectPastedContent) {
					range.setStartBefore(firstNode);
				} else {
					range.collapse(true);
				}
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	} else if ((sel = document.selection) && sel.type != "Control") {
		// IE < 9
		var originalRange = sel.createRange();
		originalRange.collapse(true);
		sel.createRange().pasteHTML(html);
		if (selectPastedContent) {
			range = sel.createRange();
			range.setEndPoint("StartToStart", originalRange);
			range.select();
		}
	}
}
var resizeImage = function (settings) {
	var file = settings.file;
	var maxSize = settings.maxSize;
	var reader = new FileReader();
	var image = new Image();
	var canvas = document.createElement('canvas');
	var dataURItoBlob = function (dataURI) {
		var bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
			atob(dataURI.split(',')[1]) :
			unescape(dataURI.split(',')[1]);
		var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
		var max = bytes.length;
		var ia = new Uint8Array(max);
		for (var i = 0; i < max; i++)
			ia[i] = bytes.charCodeAt(i);
		return new Blob([ia], { type: mime });
	};
	var resize = function () {
		var width = image.width;
		var height = image.height;
		if (width > height) {
			if (width > maxSize) {
				height *= maxSize / width;
				width = maxSize;
			}
		} else {
			if (height > maxSize) {
				width *= maxSize / height;
				height = maxSize;
			}
		}
		canvas.width = width;
		canvas.height = height;
		canvas.getContext('2d').drawImage(image, 0, 0, width, height);
		var dataUrl = canvas.toDataURL('image/jpeg');
		return dataURItoBlob(dataUrl);
	};
	return new Promise(function (ok, no) {
		if (!file.type.match(/image.*/)) {
			no(new Error("Not an image"));
			return;
		}
		reader.onload = function (readerEvent) {
			image.onload = function () { return ok(resize()); };
			image.src = readerEvent.target.result;
		};
		reader.readAsDataURL(file);
	});
};
function isCharacterKeyPress(evt) {
	if (typeof evt.which == "undefined") {
		// This is IE, which only fires keypress events for printable keys
		return true;
	}
	else if (evt.keyCode == 86) {
		return true;
	}
	else if (typeof evt.which == "number" && evt.which > 0) {
		// In other browsers except old versions of WebKit, evt.which is
		// only greater than zero if the keypress is a printable key.
		// We need to filter out backspace and ctrl/alt/meta key combinations
		return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8;
	}
	return false;
}

/* Tester
ShiftingDialog.set({
	id: "TAG",
	title: "Add Task",
	contents: '<div id="TAGS78" style="width: calc(100% - 50px); min-height: 31%;"></div>',
	dontCloseOnExternalClick: true,
	forceFullscreen: true
}); ShiftingDialog.open();
var uyt = new BreakerRichText(document.querySelector('#TAGS78'), 'hi i dunno');
*/