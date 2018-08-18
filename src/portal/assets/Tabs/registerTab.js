//RegisterTab.Js

var registeredTabs = [];
class RegisteredTab {
	/**
	 * @param {String} tabName The name of the tab in the url and the id of the tab div
	 * @param {function} firstCallback The function called back when the tab is first switched to on the instance
	 * @param {function} everyCallback The function called back everytime the tab it switched to
	 * @param {funciton} exitCallback The function called back everytime the tab is exited
	 * @param {boolean} usesLoader A boolean telling the tab switcher to (false) automaitcally turn off the loader or (true) wait until a callback does
	 * @param {String} customUrlHashKey A string telling the tab handler what varible to delete from the url on tab switch. An example of this is the profile variable in the url being deleted on tab switching
	 */
	constructor(tabName, firstCallback, everyCallback, exitCallback, usesLoader, customUrlHashKey) {
		this.tabName = (typeof tabName === 'undefined') ? null : tabName;
		this.firstCallback = (typeof firstCallback === 'undefined') ? null : firstCallback;
		this.everyCallback = (typeof everyCallback === 'undefined') ? null : everyCallback;
		this.exitCallback = (typeof exitCallback === 'undefined') ? null : exitCallback;
		this.first = true;
		this.usedLoader = !!usesLoader;

		if (customUrlHashKey) tabOnlyHashParams[tabName] = customUrlHashKey;
		registeredTabs.push(this);
	}

	/**
	 * Returns the name of the tab
	 */
	get tab() {
		return this.tabName;
	}

	/**
	 * Ignore this (called by tabs.js) on this tab opening
	 */
	sendOpenCallback() {
		if (this.first) {
			if (this.firstCallback) this.firstCallback();
			this.first = false;
		}
		if (this.everyCallback) { this.everyCallback(); }
		if (!this.usedLoader) {
			showMainLoader(false);
		}
	}

	/**
	 * Ignore this (called by tabs.js) on this tab closing
	 */
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