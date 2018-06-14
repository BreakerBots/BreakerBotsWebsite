// FabHandler.js

/**
 * FabHandler.js is a an way to use a single fab on a tab :)
 * Just Init With the Element and Call "tabSwitch()" and "tabExit()"
 * Also to listen for a click just call "addListener()"
 */
class FabHandler {
	constructor(element) {
		this.element = element;
		this.wait = null;
		this.element.classList.add("mdc-fab--exited");
	}
	tabSwitch() {
		var self = this;
		self.wait = setTimeout(function () {
			self.element.classList.remove("mdc-fab--exited");
			mdc.ripple.MDCRipple.attachTo(self.element);
		}, 1300);
	}
	tabExit() {
		if (this.wait) {
			clearTimeout(this.wait);
			this.wait = null;
		}
		this.element.classList.add("mdc-fab--exited");
	}
	addListener(callback) {
		this.element.addEventListener('click', callback);
	}
}