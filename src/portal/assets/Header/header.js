//Header.js


//Toggle the "Show All Notifications" in the dashboard header.
function notanimToggle() {
	document.querySelector('#notanimWidthTarget').classList.toggle('notanimWidth');
	document.querySelector('#notanimHeightTarget').classList.toggle('notanimHeight');
}

function toggleNotificationMenu() {
	if (!document.querySelector('#notanimWidthTarget').classList.contains('showMenu')) {
		if (document.querySelector('#notanimWidthTarget').classList.contains('notanimWidth')) {
			document.querySelector('#notanimWidthTarget').classList.remove('notanimWidth');
			document.querySelector('#notanimHeightTarget').classList.remove('notanimHeight');
		}
	}
}

function toggleMenu(menu, anchorToMe) {
	//Get the menu element
	var menuEl = document.querySelector(menu);

	//Show/Hide the menu
	menuEl.classList.toggle('showMenu');
	menuEl.classList.add('rejectMenuClickEvent');

	//If element wants menu anchored to it
	if (anchorToMe) {
		//Make sure the element is on the anchor list
		currentMenuAnchors[menu] = event.srcElement;
		//Update the anchors for the first time or just in case
		updateMenuAnchors();
	}
}

//Handle Anchors For Menu
var currentMenuAnchors = {};
window.addEventListener('resize', updateMenuAnchors);
window.addEventListener('click', closeMenus);
function updateMenuAnchors() {
	for (var obj in currentMenuAnchors) {
		var menuEl = document.querySelector(obj);
		var menuButton = currentMenuAnchors[obj];

		//Hide or Show the tooltip
		menuButton.setAttribute('data-aria-label', !menuEl.classList.contains('showMenu'));

		//The estimaed position to for the anchor
		var pos = [menuButton.offsetLeft, menuButton.offsetTop + menuButton.offsetHeight];

		//Flip the menu if over the edge of window
		if ((pos[0] + menuEl.clientWidth) > window.innerWidth) {
			pos[0] = (pos[0] - menuEl.clientWidth) + menuButton.offsetWidth;
		}

		//Transform the open animation position
		var topLeftOfMenu = pos[0] + menuEl.clientWidth, bottomRightOfButton = menuButton.offsetLeft + menuButton.offsetWidth;
		var transfOrX = ((bottomRightOfButton - pos[0]) / (topLeftOfMenu - pos[0])) * 100;

		//Update all the newly generated css
		menuEl.style.left = pos[0] + "px";
		menuEl.style.top = pos[1] + "px";
		menuEl.style.transformOrigin = transfOrX + "% 0%";
	}
}
function closeMenus() {
	for (var obj in currentMenuAnchors) {
		var menuEl = document.querySelector(obj); 
		if (menuEl.classList.contains('showMenu') && !menuEl.classList.contains('rejectMenuClickEvent')) {
			if (!pointInBox(event.pageX, event.pageY, menuEl.offsetLeft, menuEl.offsetTop, menuEl.offsetWidth, menuEl.offsetHeight))
				menuEl.classList.remove('showMenu');
		}
		else if (menuEl.classList.contains('rejectMenuClickEvent')) {
			menuEl.classList.remove('rejectMenuClickEvent');
		}
	}
}

function toggleNavSubMenu(menu) {
	[].forEach.call(document.querySelectorAll(menu), function (m) {
		m.classList.toggle('side-nav__submenu-open');
	});
}

//Title overflow
deleteOverflow(); window.addEventListener('resize', deleteOverflow);
function deleteOverflow() {
	[].forEach.call(document.querySelectorAll('.deleteOverflow'), function (m) {
		m.style.display = (document.querySelector("header").clientWidth < 660) ? "none" : "block";
	});
}

//Tooltips
setInterval(updateTooltips, 500);
window.addEventListener('resize', updateTooltips);
function updateTooltips() {
	[].forEach.call(document.querySelectorAll('[aria-label]'), function (tp) {
		var tptc = tp.querySelector('.bstooltip-container');
		if (!tptc) {
			tp.innerHTML += `<div class="bstooltip-container"> <span class="bstooltip">` + tp.getAttribute('aria-label') + `</span> </div>`;
			tptc = tp.querySelector('.bstooltip-container');
		} 
	});
}