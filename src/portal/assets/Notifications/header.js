//Toggle the "Show All Notifications" in the dashboard header.

function notanimToggle() {
	document.querySelector('#notanimWidthTarget').classList.toggle('notanimWidth');
	document.querySelector('#notanimHeightTarget').classList.toggle('notanimHeight');
}

function toggleNotificationMenu() {
	document.querySelector('#notanimWidthTarget').classList.toggle('showMenu');
	if (document.querySelector('#notanimWidthTarget').classList.contains('showMenu')) {
		event.srcElement.style.color = "red";
	}
	else {
		event.srcElement.style.color = "";
		if (document.querySelector('#notanimWidthTarget').classList.contains('notanimWidth')) {
			document.querySelector('#notanimWidthTarget').classList.remove('notanimWidth');
			document.querySelector('#notanimHeightTarget').classList.remove('notanimHeight');
		}
	}
}

function toggleMenu(menu) {
	document.querySelector(menu).classList.toggle('showMenu');
	if (document.querySelector(menu).classList.contains('showMenu')) {
		event.srcElement.style.color = "red";
	}
	else {
		event.srcElement.style.color = "";
	}
}