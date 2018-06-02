// FabHandler.js
/*
	FabHandler.js is a an way to use a single fab on a tab :)
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
}