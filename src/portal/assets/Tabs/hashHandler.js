//hashHandler.js

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
	console.log(hashData);
}
function updateHash() {
	//Remove the junk from the url
	if (hashData['tab'] != "Profile" && getHashParam("profile") != undefined) delete hashData["profile"];

	//Go to the new page
	window.location.hash = "#" + JSON.stringify(hashData);
}


//Functions for external use
function setHashParam(param, value) {
	hashData[param] = value;
	updateHash();
}

function getHashParam(param) {
	return hashData[param];
}

function deleteHashParam(param) {
	delete hashData[param];
	updateHash();
}
