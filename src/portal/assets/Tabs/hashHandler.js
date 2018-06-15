/*hashHandler.js
	This class handles everything happening after the # in the url
*/

var hashData = { };
var _lasthashData = [ { } ];
function readHash() {
	try {
		//Push to history
		var convertedHash = HashSyntaxParseQuote(decodeURIComponent(window.location.hash.substring(1)), false);
		convertedHash = ('{' + convertedHash + '}').replace(/\//g, ',').replace(/=/g, ':');
		_lasthashData.push(JSON.parse(convertedHash));
		if (_lasthashData.length > 2) _lasthashData.shift();

		//Remove #, decode encoded characters from url, and parse to Object
		hashData = JSON.parse(convertedHash);
	}
	catch (error) {
		//Default to empty object and push to history
		hashData = {};
		_lasthashData.push({ });
		if (_lasthashData.length > 2) _lasthashData.shift();
	} 

	var hashChange = (findObjectDifferences(_lasthashData[1], _lasthashData[0]));
	for (var i = 0; i < hashChange.length; i++) {
		if (hashVariableListeners[hashChange[i]] != undefined) {
			var lis = hashVariableListeners[hashChange[i]];
			for (var i = 0; i < lis.length; i++) {
				lis[i]();
			}
		}
	}
}

function HashSyntaxParseQuote(str, forw) {
	if (forw) {
		return str.replace(/"/g, '').replace('tab=', '');
	}
	else {
		try {
			if (str[0] == "/") str = str.substring(1);
			if (str[str.length - 1] == "/") str = str.slice(0, -1);
			str = '"' + 'tab=' + str + '"';
			for (var i = 0; i < str.length; i++) {
				if (str[i] == "/" || str[i] == "=") {
					str = str.insert(i, '"');
					str = str.insert(i + 2, '"');
					i += 2;
				}
			}
			return str;
		} catch (err) { return; }
	}
}

function updateHash() {
	//Go to the new page
	window.location.hash = "#" + HashSyntaxParseQuote((JSON.stringify(hashData).replace(/{|}/g, '').replace(/,/g, '/')).replace(/:/g, '='), true);
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
	if (hashData[param] != undefined) {
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

var hashVariableListeners = {};
function addHashVariableListener(vari, callback) {
	if (typeof vari == "string" && typeof callback == "function") {
		if (!hashVariableListeners[vari]) hashVariableListeners[vari] = [];
		hashVariableListeners[vari].push(callback);
		return true;
	}
	return false;
}

//Read the hash on 
window.addEventListener('hashchange', readHash);
window.addEventListener('DOMContentLoaded', readHash);