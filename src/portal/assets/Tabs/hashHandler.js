/*hashHandler.js
	This class handles everything happening after the # in the url
*/

window.addEventListener('hashchange', readHash);
readHash();

var hashData;
function readHash() {
	//Dont decode if not valid
	if (window.location.hash != "#jsi") {
		//Remove #, then decode wierd url encoded chars, and bring to proper format (tab: 1 => "tab": 1)
		hashData = JSON.parse((decodeURIComponent(window.location.hash.substring(1))).replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": '));
	}
	//Fallback
	else hashData = {};
}
function updateHash() {
	//Go to the new page
	window.location.hash = "#" + JSON.stringify(hashData);
}

//Functions for external use

/**
 * Sets a variable param to the url hash (the json after '#')
 * @param {String} param
 * @param {any} value
 */
function setHashParam(param, value) {
	hashData[param] = value;
	updateHash();
}

/**
 * Returns a varible from the url hash (the json after '#')
 * @param {String} param
 */
function getHashParam(param) {
	return hashData[param];
}

/**
 * Deletes a varible from the url hash (the json after '#')
 * @param {String} param
 */
function deleteHashParam(param) {
	if (hashData[param]) {
		delete hashData[param];
		updateHash();
	}
}

//Deleting Per Tab Hash Parameters
var tabOnlyHashParams = {};

/**
 * Ignore This. Called on tab switch by tabs.js
 */
function deletePerTabHashJunk(ctab) {
	for (var i = 0; i < Object.keys(tabOnlyHashParams).length; i++) {
		if (Object.keys(tabOnlyHashParams)[i] != ctab) {
			deleteHashParam(tabOnlyHashParams[Object.keys(tabOnlyHashParams)[i]]);
		}
	}
}