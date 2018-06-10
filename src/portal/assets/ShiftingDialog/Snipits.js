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
	textField(id, label, placeholder, type, style, isRequired, value) {
		return `
				<div class="form-group" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `">
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

	textFieldAutoComplete(id, label, placeholder, options, style) {
		return `
				<div class="form-group autocomplete" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `" data-autocomplete-auto-init>
					<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
					<input ` + MSN_ID(id) + ` type="text" class="form-control" placeholder="` + MSN(placeholder) + `" autocomplete="off">
					<div class="autocomplete-items"></div>
					<div class="autocomplete-options">` +
						Autocomplete_ArrayToOptions(options)
					+ `</div>
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
				<div class="mdc-radio" data-mdc-auto-init="MDCRadio" id="` + (id + '-' + i) + `">
					<input class="mdc-radio__native-control" type="radio" checked onclick="` + onchange + `">
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
	dropDown(id, label, style) {
		return `
				<div class="form-group" style="width: 90%; min-height: 65px; max-height: ` + MSNC(stringEV(label), "73", "65") + `px;` + MSN(style) + `">
					<label ` + MSN(id, ` for="`, `" `, ``) + `>` + MSN(label) + `</label>
					<select` + MSN_ID(id) + `class="form-control">` +
						MS_ProcessDropDown(arguments, 3)
					+ `</select>
				</div>
				`;
	}

	button(id) {

	}

	icon(id, name, style) {
		return `<i ` + MSN_ID(id) + `class="material-icons" style="` + style + `">` + name + `</i>`;
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
	return arrayToHTMLTags(options, tag);
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
getRadioButtonValue = function (el) {
	var clid;
	[].forEach.call(el.querySelectorAll('.mdc-radio'), function (item) {
		if (item.MDCRadio.checked) clid = item.id;
	});
	return clid;
}
setRadioButtonValue = function (el, i) {
	[].forEach.call(el.querySelectorAll('.mdc-radio'), function (item) {
		item.MDCRadio.checked = (item.id.split('-')[1] == i);
	});
	return;
}