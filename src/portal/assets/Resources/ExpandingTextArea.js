// ExpandingTextArea.js

function resizeTextarea(element) {
	element = element || event.srcElement;
	if (element) {
		element.style.height = "auto";
		element.style.height = element.scrollHeight + "px";
		element.style.overflow = "hidden";
	}
}