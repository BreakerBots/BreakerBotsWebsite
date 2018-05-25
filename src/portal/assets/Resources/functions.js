/*  
		Functions.js
			functions.js is place a place for commonly used and flexible functions.
			These functions should be able to be used for multiple cases and be able
			to be very flexible.
*/


/**
 * Remove item from array
 */
Array.prototype.remove = function (item) {
	if (this.includes(item)) {
		var index = this.indexOf(item);
		if (index !== -1) this.splice(index, 1);
	}
}

/**
 * Expanding textarea
 */
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
}

/**
 * JSON Contains
 */
function jsoncontains (json, value) {
	for (key in json) {
		if (typeof (json[key]) === "object") {}
		else if (json[key] === value) {
			return true;
		}
	}
	return false;
}

/**
 * 2d Collision
 */
function pointInBox(px, py, bx, by, bw, bh) {
	if ((px >= bx && px <= bx + bw) && (py >= by && py <= by + bh))
		return true;
	else
		return false;
}

/**
 * Real Position of element on screen
 */
function realPosition(element) {
	var bodyRect = document.body.getBoundingClientRect(),
		elemRect = element.getBoundingClientRect();
	return { left: elemRect.left - bodyRect.left, top: elemRect.top - bodyRect.top, bottom: elemRect.bottom - bodyRect.bottom, right: elemRect.right - bodyRect.right };
}

/**
 * Find Object In Array By Value of Certain Key
 */
function findObjectByKey(array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] === value) {
			return array[i];
		}
	}
	return null;
}

/**
 * Find if valid/exists
 */
function stringEV(str) {
	if (str == undefined || str == null || str == "")
		return false;
	else
		return true;
}
function stringUnNull(str) {
	if (str == undefined || str == null)
		return "";
	else
		return str;
}

/**
 * String JSON Reference
 */
function refByString(theObject, path, separator) {
	try {
		separator = separator || '/';

		return path.
			replace('[', separator).replace(']', '').
			split(separator).
			reduce(
			function (obj, property) {
				return obj[property];
			}, theObject
			);

	} catch (err) {
		return undefined;
	}
}

/**
 * Find the index of first difference in two strings
 */
function findFirstDiffPos(a, b) {
	if (a.length < b.length)[a, b] = [b, a];
	return [...a].findIndex((chr, i) => chr !== b[i]);
}