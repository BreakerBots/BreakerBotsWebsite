//RegisterTab.Js

var registeredTabs = [];
class RegisteredTab {
	constructor(tabName, firstCallback, everyCallback, exitCallback) {
		this.tabName = (typeof tabName === 'undefined') ? null : tabName;
		this.firstCallback = (typeof firstCallback === 'undefined') ? null : firstCallback;
		this.everyCallback = (typeof everyCallback === 'undefined') ? null : everyCallback;
		this.exitCallback = (typeof exitCallback === 'undefined') ? null : exitCallback;
		this.first = true;

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

	sendExitCallback() {
		if (this.exitCallback) this.exitCallback();
	}
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