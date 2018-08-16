//ShiftingDialog.js

/**
 
	The Shifting Dialog is system meant for an easy dialog use across desktop
	and mobile. The System shifts between fullscreen for mobile and a floating
	card (Default) for desktop. The dialog can be opened, closed, listened to
	and have its data set.

 */

var ShiftingDialog = new class ShiftingDialog {
	open() {
		var sdc = document.querySelector('#SD-Container');
		document.querySelector("#SD-Form").removeAttribute('novalidate');
		if (sdc.dataset.sdContainerState != "opening" && sdc.dataset.sdContainerState != "open") {
			if (document.querySelector("#page-scroll")) {
				this.scrollWasHidden = document.querySelector("#page-scroll").style.overflowY == "hidden";
				document.querySelector("#page-scroll").style.overflowY = "hidden";
			}
			sdc.dataset.sdContainerState = "opening";
			setTimeout(function () {
				if (sdc.dataset.sdContainerState == "opening")
					sdc.dataset.sdContainerState = "open";
			}, 1000);
		}
		document.querySelector("#SD-FooterSubmit").disabled = false;
	}
	close() {
		var sdc = document.querySelector('#SD-Container');
		document.querySelector("#SD-Form").setAttribute('novalidate', '');
		if (sdc.dataset.sdContainerState != "closed" && sdc.dataset.sdContainerState != "closed") {
			if (!this.scrollWasHidden && document.querySelector("#page-scroll")) document.querySelector("#page-scroll").style.overflowY = "auto";
			sdc.dataset.sdContainerState = "closing";
			setTimeout(function () {
				if (sdc.dataset.sdContainerState == "closing")
					sdc.dataset.sdContainerState = "closed";
			}, 1000);
		}
	}
	isOpen() {
		var sdc = document.querySelector('#SD-Container');
		return sdc.dataset.sdContainerState == "opening" || sdc.dataset.sdContainerState == "open";
	}
	/**
	 * Sets the data inside the Shifiting Dialog
	 * Input a Object with any of the values:
		 * 0 {String}   "id" -  The Id to set the ShiftingDialog. To Later Reference in Listeners
		 * 1 {String}   "title" -  The Title of the dialog
		 * 2 {string}   "contents" -  A chunk of html representing the contents that should be inside the dialog. Ids on elements would be advised for grabbing submit data
		 * 3 {String}   "submitButton" -  The text inside the submit button, entering null or undefined with have no submit button (Default "Submit")
		 * 4 {String}   "cancelButton" -  The text inside the cancel button, entering null or undefined with have no cancel button (Default "Cancel")
		 * 5 {Boolean}  "centerButtons" -  If the Submit and Cancel button should be centered
		 * 6 {Boolean}  "dontCloseOnExternalClick" -  If the dialog should close on a click outside of the dialog
		 * 7 {Boolean}  "dontCloseOnEsc" -  If the Dialog Is Closeable by Esc
		 * 8 {Boolean}  "forceFullscreen" -  Force the Dialog To Be Fullscreen
		 * 9 {Boolean}  "hideFooter" -  If the footer should be hidden
		 * 10 {Boolean} "hideHeader" -  If the header should be hidden
	 */
	set(inp) {
		// 0: "id"
		this.currentId = inp.id;

		// 1: "title"
		document.querySelector('#SD-HeaderTitle').innerHTML = inp.title ? inp.title : "";

		// 2: "contents"
		document.querySelector("#SD-Wrapper").innerHTML = inp.contents ? inp.contents : "";

		// 3: "submitButton"
		document.querySelector('#SD-FooterSubmit').innerHTML = inp.submitButton ? inp.submitButton : "Submit";
		document.querySelector('#SD-FooterSubmit').style.display = inp.submitButton ? "block" : "none";
		document.querySelector("#SD-FooterSubmit").disabled = false;

		// 4: "cancelButton"
		document.querySelector('#SD-FooterCancel').innerHTML = inp.cancelButton ? inp.cancelButton : "Cancel";
		document.querySelector('#SD-FooterCancel').style.display = inp.cancelButton ? "block" : "none";

		// 5: "centerButtons"
		document.querySelector("#SD-Footer").style.justifyContent = inp.centerButtons ? "center" : "flex-end";

		// 6: "dontCloseOnExternalClick"
		this.closeOnExternalClick = inp.dontCloseOnExternalClick ? false : true;

		// 7: "dontCloseOnEsc"
		this.closeOnEsc = inp.dontCloseOnEsc ? false : true;

		// 8: "forceFullscreen"
		this.forceFullscreen = inp.forceFullscreen ? true : false;
		ShiftingDialogCheckShift();

		// 9: "hideFooter"
		document.querySelector('#SD-FooterWrapper').style.display = inp.hideFooter ? "none" : "block";

		// 10: "hideHeader"
		document.querySelector('#SD-Header').style.display = inp.hideHeader ? "none" : "block";

		// AutoInit on contents
		setTimeout(function () {
			window.mdc.autoInit(document.querySelector("#SD-Wrapper"));
			try {
				if (AutocompleteAutoInit) AutocompleteAutoInit();
				if (AutocompleteUsersAutoInit) AutocompleteUsersAutoInit();
			} catch (err) { }
		}, 1);
	}
	addSubmitListener(title, callback) {
		SD_Listeners.push({ title: title, callback: callback });
	}
	throwFormError(err, target) {
		if (this.isOpen()) {
			if (target) {
				target.setCustomValidity(err || "Error");
				target.reportValidity();
				if (target.tagName == "BUTTON") target.addEventListener('click', function () { this.setCustomValidity(""); });
				else target.addEventListener('input', function () { this.setCustomValidity(""); });
				return true;
			}
			else {
				document.querySelector("#SD-FooterSubmit").setCustomValidity(err || "Error");
				document.querySelector("#SD-FooterSubmit").reportValidity();
				return true;
			}
			return false;
		}
		return false;
	}
	enableSubmitButton(state) {
		document.querySelector("#SD-FooterSubmit").disabled = state == undefined ? false : !state;
	}
}

var SD_Listeners = [];

//Form Handling
function ShiftingDialogSubmit() {
	if (ShiftingDialog.isOpen()) {
		document.querySelector("#SD-FooterSubmit").disabled = true;
		var currentTitle = ShiftingDialog.currentId;
		var currentPacket = document.querySelector("#SD-Form");
		for (var i = 0; i < SD_Listeners.length; i++) {
			if (SD_Listeners[i].title == currentTitle)
				SD_Listeners[i].callback(currentPacket);
		}
	}
}

//Close the dialog on a press somewhere else
document.querySelector("#SD-Container").addEventListener('click', function () {
	//Making sure it's clicking it and not its child
	if (event.target != this) { return; }
	if (ShiftingDialog.closeOnExternalClick) ShiftingDialog.close();
});

//Close the dialog on [Escape] pressed.
window.onkeyup = function (e) {
	if (e.key == "Escape" && ShiftingDialog.isOpen()) {
		if (ShiftingDialog.closeOnEsc) ShiftingDialog.close();
	}
}

//Close Button
document.querySelector("#SD-HeaderClose").addEventListener('click', function () {
	ShiftingDialog.close();
});

//Shifting between fullscreen (Mobile) and default (Desktop)
window.addEventListener('resize', ShiftingDialogCheckShift);
ShiftingDialogCheckShift();
setInterval(ShiftingDialogCheckShift, 2000);
function ShiftingDialogCheckShift() {
	if (window.innerWidth <= 768) {
		//Fullscreen (Mobile)
		document.querySelector("#SD-Main").dataset.sdMainState = "fullscreen";
	}
	else {
		//Default (Desktop)
		document.querySelector("#SD-Main").dataset.sdMainState = ShiftingDialog.forceFullscreen ? "fullscreen" : "default";
	}

	//Some extra footer stuff
}

//SD-Header Shadow
document.querySelector("#SD-Wrapper").addEventListener('scroll', SD_HeaderShadow);
document.querySelector("#SD-Wrapper").addEventListener('resize', SD_HeaderShadow);
SD_HeaderShadow(); setInterval(SD_HeaderShadow, 2000);
function SD_HeaderShadow() {
	if (document.querySelector("#SD-Wrapper").scrollTop > 5) {
		document.querySelector("#SD-Header").classList.add("mdc-elevation--z10");
	}
	else {
		document.querySelector("#SD-Header").classList.remove("mdc-elevation--z10");
	}
}