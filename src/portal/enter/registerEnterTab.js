//RegisterTab.Js

var registeredTabs = [];
class RegisteredTab {
	constructor(tabName, tabHeight, firstCallback, everyCallback, exitCallback) {
		this.tabName = (typeof tabName === 'undefined') ? null : tabName;
		this.firstCallback = (typeof firstCallback === 'undefined') ? null : firstCallback;
		this.everyCallback = (typeof everyCallback === 'undefined') ? null : everyCallback;
		this.exitCallback = (typeof exitCallback === 'undefined') ? null : exitCallback;
		this.first = true;
		this.tabHeight = (typeof tabHeight === 'undefined') ? 50 : tabHeight;

		registeredTabs.push(this);
	}

	get tab() {
		return this.tabName;
	}

	sendOpenCallback() {
		if (this.first) {
			if (this.firstCallback) this.firstCallback();
			this.first = false;
		}
		if (this.everyCallback) this.everyCallback();
	}

	adjustToHeight() {
		document.querySelector("#mainCard").style.height = this.tabHeight + "px";
	}

	sendExitCallback() {
		if (this.exitCallback) this.exitCallback();
	}
}

//Card Ripple Transition Handler
var crtTimeouts = [];
function cardRippleTransition(callback1, callback2, callback3) {
	var rippleWrap = document.querySelector("#CardCloseRippleWrap"),
		ripple = document.querySelector("#CardCloseRipple");

	//Clear timeouts (if still running)
	for (var i = 0; i < crtTimeouts.length; i++) clearTimeout(crtTimeouts[i]);

	//Start Animation
	rippleWrap.classList.add("goripple-small");

	//Start Reverse Animation Later
	crtTimeouts[0] = setTimeout(function () {
		rippleWrap.classList.remove("goripple-small");
		rippleWrap.classList.add("goripple-small-reverse");

		if (callback3) callback3();
	}, 400);

	//Finsish later
	crtTimeouts[1] = setTimeout(function () {
		rippleWrap.classList.remove("goripple-small");
		rippleWrap.classList.remove("goripple-small-reverse");
	}, 1000);

	//Other callbacks
	crtTimeouts[2] = setTimeout(function () {
		if (callback1) callback1();
	}, 100);

	crtTimeouts[3] = setTimeout(function () {
		if (callback2) callback2();
	}, 100);
}

//Take data from tabs.js and send it out to other js
function sendTabOpenCallback(tab) {
	for (var tg = 0; tg < registeredTabs.length; tg++) {
		if (registeredTabs[tg].tab == tab) { registeredTabs[tg].sendOpenCallback(); }
	}
}
function sendTabExitCallback(tab) {
	for (var tg = 0; tg < registeredTabs.length; tg++) {
		if (registeredTabs[tg].tab == tab) { registeredTabs[tg].sendExitCallback(); }
	}
}
function sendTabAdjustHeight(tab) {
	for (var tg = 0; tg < registeredTabs.length; tg++) {
		if (registeredTabs[tg].tab == tab) { registeredTabs[tg].adjustToHeight(); }
	}
}