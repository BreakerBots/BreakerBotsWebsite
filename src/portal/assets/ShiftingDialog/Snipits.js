/*Snipits.js
	This class is a group of MDC snipits meant for an easy use of inputing html into the Shifiting Dialog
*/

var mainSnips = new class materialSnip {
	/**
	 * A snippit for text a box
	 * @param {any} id The id of the input element
	 * @param {any} label The label above the input element
	 * @param {any} placeholder The placeholder inside the input element
	 * @param {any} type The type of input element (default is text)
	 * @param {any} style Added style for the container
	 */
	textField(id, label, placeholder, type, style, isRequired, value, tooltip) {
		return `
				<div class="form-group" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `" ` + MSN(tooltip, ' aria-label="', '" aria-label-z-index="1001" aria-label-delay="0.1"') + `>
					<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
					<input ` + MSN_ID(id) + MSNC(isRequired, "required ", "") + ` type="` + MSN(type, ``, ``, `text`) + `" ` + MSN(value, 'value="', '"', '') + ` class="form-control" placeholder="` + MSN(placeholder) + `" autocomplete="off">
				</div>
				`;
	}

	textArea(id, label, placeholder, style, value, isRequired) {
		return `
			<div class="form-group" style="width: 90%; min-height: 65px;` + MSN(style) + `">
				<img src="../assets/img/freeload.png" style="display: none;" onload="resizeTextarea(this.parentNode.querySelector('textarea'))"/>
				<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
				<textarea style="resize: none;" onkeydown="resizeTextarea()"` + MSN_ID(id) + MSNC(isRequired, "required ", "") + ` class="form-control" placeholder="` + MSN(placeholder) + `" autocomplete="off">` + MSN(value, "", "", "") + `</textarea>
			</div>
		`;
	}

	/**
	 * Make Sure To Init the Element with --> "new BreakerRichText(ELEMENT, VALUE, OPTIONS)"
	 */
	richText(id, label, style) {
		return `
			<div class="form-group" style="width: 90%; min-height: 65px;">
				<label>` + MSN(label) + `</label>
				<div style="` + MSN(style) + `" ` + MSN_ID(id) + `></div>
			</div>
		`;
	}

	/**
	 * @param {Array[String]} options An Array Of HTML Strings so [HTML, HTML, HTML, HTML]
	 * @param {any} showAll If It Should Show all Autocomplete Items When No Text is Typed
	 */
	textFieldAutoComplete(id, label, placeholder, options, style, showAll, value) {
		return `
			<div class="form-group autocomplete" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `" data-autocomplete-auto-init ` + MSNC(showAll, "data-autocomplete-showall", "") + ` >
				<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
				<input ` + MSN_ID(id) + ` type="text" class="form-control" value="` + MSN(value) + `" placeholder="` + MSN(placeholder) + `" autocomplete="off">
				<div class="autocomplete-items"></div>
				<div class="autocomplete-options">` +
					Autocomplete_ArrayToOptions(options)
				+ `</div>
			</div>
		`;
	}

	textFieldPassword(id, label, placeholder, style, value, tooltip) {
		return `
			<div class="form-group" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `" ` + MSN(tooltip, ' aria-label="', '" aria-label-z-index="1001" aria-label-delay="0.1"') + `>
				<label>` + MSN(label) + `</label>
				<div class="SHP">
					<input ` + MSN_ID(id) + ` value="` + MSN(value) + `" style="border: none; display: inline; width: 80%;" type="password" required placeholder="` + MSN(placeholder) + `" autocomplete="off" class="form-control">
					<div style="position: absolute; right: 0; float: right; top: 10px; transform: scale(1); transition: all 0.15s cubic-bezier(.2, 0, .2, 1);">
						<i style="display: inline; font-size: 27px;" class="material-icons mdc-icon-toggle" role="button" data-mdc-auto-init="MDCIconToggle" onclick="SHP(this.parentNode.parentNode.querySelector('input'));">visibility_off</i>
					</div>
				</div>
			</div>
		`;
	}

	textFieldUsersAutoComplete(id, label, placeholder, style, value) {
		return `
			<div class="form-group autocomplete" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `" data-autocomplete-users-auto-init data-autocomplete-users-char="">
				<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
				<input ` + MSN_ID(id) + ` type="text" class="form-control" ` + MSN(value, 'value="', '"', '') + ` placeholder="` + MSN(placeholder) + `" autocomplete="off">
				<div class="autocomplete-items"></div>
			</div>
		`;
	}

	textFieldDate(id, label, placeholder, style) {
		return `
				<div class="form-group" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `">
					<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
					<input type="text" ` + MSN_ID(id) + ` value="" placeholder="` + MSN(placeholder) + `" class="form-control datetimepicker">
					<div class="autocomplete-items"></div>
				</div>
				`;
	}

	/**
	 * A Snippit for radio buttons groups with mdc implementations. Get the value by calling => getRadioButtonValue(ELEMENT)
	 * @param {Array} buttons A String Of array of radio buttons contents => ["HTML", "HTML", "HTML", ...]
	 * @param {String} id The id of the radio button wrapper, individual radio buttons are this id followed with "-INDEX"
	 * @param {Function} onchange A callback when a new button is selected
	 */
	radioButtons(id, buttons, onchange) {
		var html = '<div class="radio-button-container" style="width: 90%; min-width: 250px;" ' + MSN_ID(id) + ' >';
		for (var i = 0; i < buttons.length; i++) {
			try {
				html += `
			<div class="mdc-form-field" style="margin: 0 0 0 3px;">
				<div class="mdc-radio" data-mdc-auto-init="MDCRadio" id="` + (id + '--rbv--' + i) + `">
					<input class="mdc-radio__native-control" type="radio" name="radios" checked onclick="` + MSN(onchange) + `">
					<div class="mdc-radio__background">
						<div class="mdc-radio__outer-circle"></div>
						<div class="mdc-radio__inner-circle"></div>
					</div>
				</div>
				<label onclick="this.parentNode.querySelector('div').querySelector('input').click()">` + buttons[i] + `</label>
			</div><br />
			`;
			} catch (err) { }
		}
		return html + '</div>';
	}

	/**
	 * A snippit for dropdowns
	 * @param {any} id The id of the dropdown
	 * @param {any} label The label above the dropdown
	 * @param {any} style Added style for the container
	 * Any extra arguments will be processed at options for the dropdown. These should be in the format: ARRAY [ VALUE, TEXT, SELECTED ];
	 * If no options have been gived selected then the first option will default to selected
	 */
	dropDown(id, label, style, onchange) {
		return `
				<div class="form-group" onchange="` + MSN(onchange) + `" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `">
					<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
					<select` + MSN_ID(id) + `class="form-control">` +
						MS_ProcessDropDown(arguments, 4)
					+ `</select>
				</div>
				`;
	}

	//button(id) {

	//}

	icon(id, name, style) {
		return `<i ` + MSN_ID(id) + `class="material-icons" style="` + style + `">` + name + `</i>`;
	}

	/**
	 * The MDC Checkbox, to get and the value call ELEMENT.checked for checked and ELEMENT.indeterminate for indeterminate
	 */
	checkbox(id, label) {
		return `
		<div class="mdc-form-field" style="width: 90%; margin-bottom: 10px;">
		  <div class="mdc-checkbox" data-mdc-auto-init="MDCCheckbox">
			<input type="checkbox"
				   class="mdc-checkbox__native-control"
				   ` + MSN_ID(id) + `/>
			<div class="mdc-checkbox__background">
			  <svg class="mdc-checkbox__checkmark"
				   viewBox="0 0 24 24">
				<path class="mdc-checkbox__checkmark-path"
					  fill="none"
					  stroke="white"
					  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
			  </svg>
			  <div class="mdc-checkbox__mixedmark"></div>
			</div>
		  </div>
		  <label>` + label + `</label>
		</div>
		`;
	}

	slider(id, min, max, val) {
		return `
		<div ` + MSN_ID(id) + ` class="mdc-slider mdc-slider--discrete mdc-slider--display-markers" tabindex="0" role="slider"
				aria-valuemin="` + (min || 0) + `" aria-valuemax="` + (max || 10) + `" aria-valuenow="` + (val || (min || 0)) + `"
				aria-label="Select Value" data-mdc-auto-init="MDCSlider">
			<div class="mdc-slider__track-container">
				<div class="mdc-slider__track"></div>
				<div class="mdc-slider__track-marker-container"></div>
			</div>
			<div class="mdc-slider__thumb-container">
				<div class="mdc-slider__pin">
					<span class="mdc-slider__pin-value-marker"></span>
				</div>
				<svg class="mdc-slider__thumb" width="21" height="21">
					<circle cx="10.5" cy="10.5" r="7.875"></circle>
				</svg>
				<div class="mdc-slider__focus-ring"></div>
			</div>
		</div>
		`;
	}
}

/**
 * Just an easy way of calling MSN for ids
 */
function MSN_ID(id) {
	return MSN(id, ` id="`, `" `, ``);
}

/**
 * Will process an input and return a fallback (if it doesn't exits) or return the input along with a fallforward attached the beginning and end of the input string
 * @param {String} inp The input
 * @param {String} ffs Fall Forward to be appended to start of input
 * @param {String} ffe Fall Forward to be appended to end of input
 * @param {String} fb Fallback incase the input doesn't exist
 */
function MSN(inp, ffs, ffe, fb) {
	return (inp ? ((ffs ? (ffs + inp + (ffe ? ffe : ``)) : (inp + (ffe ? ffe : ``)))) : (fb ? fb : ``));
}

/**
 * Similar to MSN but instead of returning the input, it will return fall forward or fallback depending if the input exits
 * @param {any} inp
 * @param {any} ff
 * @param {any} fb
 */
function MSNC(inp, ff, fb) {
	return (inp ? (ff ? ff : ``) : (fb ? fb : ``));
}

//Process the dropdown inputs in the format: ARRAY [ 0VALUE, 1TEXT, 2SELECTED ];
function MS_ProcessDropDown(arguments, startAt) {
	var str = ``;
	for (var i = startAt; i < arguments.length; i++) {
		str += `<option ` + MSN(arguments[i][0], ` value="`, `" `, ``) + MSNC(arguments[i][2], "selected", "") + `>` + MSN(arguments[i][1]) + `</option>`;
	}
	return str;
}

//Processes input for autocomplete snippit
function Autocomplete_ArrayToOptions(options) {
	return arrayToHTMLTags(options, "p");
}

function arrayToHTMLTags(arr, tag) {
	if (arr) {
		var str = '';
		for (var i = 0; i < arr.length; i++) {
			str += '<' + tag + '>' + arr[i] + '</' + tag + '>';
		}
		return str;
	}
	else
		return "";
}

//Get and Set value from radio buttons
getRadioButtonValue = function (el, useid) {
	var clid;
	[].forEach.call(el.querySelectorAll('.mdc-radio'), function (item) {
		if (item.MDCRadio.checked) clid = useid ? item.id : Number(item.id.split('--rbv--')[1]);
	});
	return clid;
}
setRadioButtonValue = function (el, i) {
	[].forEach.call(el.querySelectorAll('.mdc-radio'), function (item) {
		item.MDCRadio.checked = (item.id.split('--rbv--')[1] == i);
	});
	return;
}