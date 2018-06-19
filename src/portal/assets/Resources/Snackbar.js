// Snackbar.js


var snackbar = new class Snackbar {
	/**
	 * @param {String} message The text message to display. (default "")
	 * @param {Integer} timeout The amount of time in milliseconds to show the snackbar. (default 2750)
	 * @param {Function} buttonCallback The function to execute when the action is clicked. (default null)
	 * @param {String} buttonText The text to display for the action button. (default "")
	 * @param {Boolean} multiline Whether to show the snackbar with space for multiple lines of text. (default false)
	 * @param {Boolean} actionOnBottom Whether to show the action below the multiple lines of text. (default false)
	 */
	set(message, buttonText, buttonCallback, timeout, multiline, actionOnBottom) {
		document.querySelector('#MainSnackbar').MDCSnackbar.show({
			message: message || "",
			actionText: buttonText || "",
			actionHandler: buttonCallback || null,
			actionOnBottom: actionOnBottom || false,
			multiline: multiline || false,
			timeout: timeout || 2750
		});
	}

	get open() {
		return document.querySelector('#MainSnackbar').classList.contains('mdc-snackbar--active');
	}
}