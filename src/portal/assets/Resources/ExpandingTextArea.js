// ExpandingTextArea.js

function resizeTextarea() {
	event.srcElement.style.height = "auto";
	event.srcElement.style.height = event.srcElement.scrollHeight + "px";
	event.srcElement.style.overflow = "hidden";
}