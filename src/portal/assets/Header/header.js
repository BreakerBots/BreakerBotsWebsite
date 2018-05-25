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

function findNearestMenu(target) {
	if (target.querySelector('.dropdown-menu-c') == null)
		return findNearestMenu(target.parentNode);
	else
		return target.querySelector('.dropdown-menu-c');
}

function generateNewMenuId() {
	var text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	for (var i = 0; i < 40; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

function toggleMenu(menu, anchorToMe) {
	//Get the menu element
	if (menu == null || menu == undefined) {
		var menuEl = findNearestMenu(event.srcElement);
		if (menuEl.id == "" || menuEl.id == null || menuEl.id == undefined) {
			menuEl.id = generateNewMenuId();
		}
		menu = "#" + menuEl.id;
	}
	else
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
	[].forEach.call(document.querySelectorAll('[data-delete-overflow-min]'), function (m) {
		var w = m.dataset.deleteOverflowMin ? m.dataset.deleteOverflowMin : 660;
		m.style.display = (window.innerWidth < w) ? "none" : "block";
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

//Header Backarrow
var headerUsingBackArrow = false;
function headerUseBackArrow(state) {
	var arrowB = document.querySelector("#HeaderBackArrow");
	var drawerB = document.querySelector("#OpenDrawer");
	if (state && !headerUsingBackArrow) {
		console.log("HUBA is opening true");
		headerUsingBackArrow = true;
		PeteSwitcher.closeTempDrawer();
		arrowB.style.opacity = 0;
		arrowB.style.transform = "scale(0)";
		drawerB.style.opacity = 0;
		drawerB.style.transform = "scale(0)";
		setTimeout(function () {
			drawerB.style.display = "none";
			arrowB.style.display = "block";
			setTimeout(function () {
				arrowB.style.opacity = 1;
				arrowB.style.transform = "scale(1)";
			}, 10);
		}, 200);
	}
	else if (!state && headerUsingBackArrow) {
		headerUsingBackArrow = false;
		arrowB.style.opacity = 0;
		arrowB.style.transform = "scale(0)";
		drawerB.style.opacity = 0;
		drawerB.style.transform = "scale(0)";
		setTimeout(function () {
			arrowB.style.display = "none";
			drawerB.style.display = "block";
			setTimeout(function () {
				drawerB.style.opacity = 1;
				drawerB.style.transform = "scale(1)";
			}, 10);
		}, 200);
	}
}

//The Header Search Box
var searchBoxButton = document.querySelector('#headerSearchBoxOpen');
var headerUsingSearch = false;
function headerUseSearch(state) {
	if (state && !headerUsingSearch) {
		headerUsingSearch = true;
		//Show the button
		searchBoxButton.style.display = "block";
		setTimeout(function () {
			searchBoxButton.style.opacity = 1;
			searchBoxButton.style.transform = "scale(1)";
		}, 10);
	}
	else if (!state && headerUsingSearch) {
		headerUsingSearch = false;
		//Hide the button and close the search box if open

		searchBoxButton.style.opacity = 0;
		searchBoxButton.style.transform = "scale(0)";
		setTimeout(function () {
			searchBoxButton.style.display = "none";
		}, 200);
		document.querySelector("#headerAppsOpen").style.display = "block";
		document.querySelector("#headerNotificationsOpen").style.display = "block";
		document.querySelector('.headerSearchBox').classList.remove('headerSearchBox--open');
	}
}
//Open and close the search box
searchBoxButton.addEventListener('click', function() {
	document.querySelector('.headerSearchBox').classList.add('headerSearchBox--open');
});
document.querySelector('#headerSearchBoxClose').addEventListener('click', function () {
	setTimeout(function () { document.querySelector('.headerSearchBox').classList.remove('headerSearchBox--open'); }, 200);
});
window.addEventListener('resize', function () {
	if (headerUsingSearch) {
		document.querySelector("#headerAppsOpen").style.display = (window.innerWidth < 800) ? "none" : "block";
	}
});