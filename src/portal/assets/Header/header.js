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

	//If element wants menu anchored to it
	if (anchorToMe) {
		//Make sure the element is on the anchor list
		currentMenuAnchors[menu] = event.srcElement;
		//Update the anchors for the first time or just in case
		updateMenuAnchors();
	}

	//Show/Hide the menu
	menuEl.classList.toggle('showMenu');
	menuEl.classList.add('rejectMenuClickEvent');
}

//Handle Anchors For Menu
var currentMenuAnchors = {};
window.addEventListener('resize', updateMenuAnchors);
window.addEventListener('click', closeMenus);
function updateMenuAnchors() {
	for (var obj in currentMenuAnchors) {
		var menuEl = document.querySelector(obj);
		var menuButton = currentMenuAnchors[obj];

		if (menuEl && menuButton) {
			//Hide or Show the tooltip
			menuButton.setAttribute('data-aria-label', !menuEl.classList.contains('showMenu'));

			//The estimaed position to for the anchor
			var pos = [menuButton.getBoundingClientRect().left, menuButton.getBoundingClientRect().top + menuButton.getBoundingClientRect().height];

			//Flip the menu if over the edge of window
			if ((menuButton.getBoundingClientRect().left + menuEl.offsetWidth) > window.innerWidth) {
				pos[0] = (pos[0] - menuEl.clientWidth) + menuButton.offsetWidth;
			}

			//Transform the open animation position
			var topLeftOfMenu = pos[0] + menuEl.getBoundingClientRect().width, bottomRightOfButton = menuButton.getBoundingClientRect().left + menuButton.getBoundingClientRect().width;
			var transfOrX = ((bottomRightOfButton - pos[0]) / (topLeftOfMenu - pos[0])) * 100;

			//Offset Fix
			pos[0] -= getRelativeParentOffset(menuEl).left;
			pos[1] -= getRelativeParentOffset(menuEl).top;
			try { if (menuEl.dataset.menuOffset) {
				pos[0] += Number(menuEl.dataset.menuOffset.split(" ")[0]);
				pos[1] += Number(menuEl.dataset.menuOffset.split(" ")[1]);
			} } catch (err) { }

			//Add scrolling
			var menuELP = menuEl, menuELP_HPS = 0;
			while (menuELP) {
				if (menuELP == document.querySelector("#page-scroll"))
					menuELP_HPS = document.querySelector("#page-scroll").scrollTop;
				menuELP = menuELP.parentNode;
			}
			pos[1] += menuELP_HPS;

			//Update all the newly generated css
			menuEl.style.left = pos[0] + "px";
			menuEl.style.top = pos[1] + "px";
			menuEl.style.transformOrigin = transfOrX + "% 0%";
		}
	}
}
function closeMenus() {
	for (var obj in currentMenuAnchors) {
		var menuEl = document.querySelector(obj);
		if (menuEl) {
			if (menuEl.classList.contains('showMenu') && !menuEl.classList.contains('rejectMenuClickEvent')) {
				if (!pointInBox(event.pageX, event.pageY, menuEl.offsetLeft, menuEl.offsetTop, menuEl.offsetWidth, menuEl.offsetHeight))
					menuEl.classList.remove('showMenu');
			}
			else if (menuEl.classList.contains('rejectMenuClickEvent')) {
				menuEl.classList.remove('rejectMenuClickEvent');
			}
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

//Moue Pos
var mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', function () { mouseX = event.clientX, mouseY = event.clientY; });

//Tooltips
setInterval(updateTooltips, 2000);
window.addEventListener('resize', updateTooltips);
var tooltipList = [];
function updateTooltips() {
	[].forEach.call(document.querySelectorAll('[aria-label]'), function (tp) {
		if (tooltipList.indexOf(tp) == -1) {
			tooltipList.push(tp);
		}
	});
}
var CanShowTooltip = true;
var VisibleTooltip = null;
setInterval(checkTooltip, 1000);
document.addEventListener('mousemove', checkTooltip);
document.addEventListener('resize', checkTooltip);
function checkTooltip() {
	if (CanShowTooltip) {
		var el;
		for (var i = 0; i < tooltipList.length; i++) {
			var ELB = tooltipList[i].getBoundingClientRect();
			if (mouseX >= ELB.left && mouseX <= ELB.left + ELB.width && mouseY >= ELB.top && mouseY <= ELB.top + ELB.height)
				el = tooltipList[i];
		}
		if (el && (VisibleTooltip ? el == VisibleTooltip : true)) {
			var ELB = el.getBoundingClientRect();
			VisibleTooltip = el;
			document.querySelector(".bstooltip").innerHTML = el.getAttribute('aria-label');
			document.querySelector('.bstooltip').style.transitionDelay = el.getAttribute('aria-label-delay') || '0.5s';
			document.querySelector(".bstooltip").classList.add("bstooltip--active");
			var elWi = document.querySelector(".bstooltip").innerHTML.length * 3.78 + 18;
			var outsideWindowAdjust = (window.innerWidth - (((ELB.left + (ELB.width / 2)) + elWi))).max(0);
			document.querySelector(".bstooltip-container").style.left = ((ELB.left + (ELB.width / 2)) + outsideWindowAdjust) + "px";
			document.querySelector(".bstooltip-container").style.top = (ELB.top + ELB.height) + "px";
		} else {
			if (VisibleTooltip) {
				VisibleTooltip = null;
				CanShowTooltip = false;
				document.querySelector('.bstooltip').style.transitionDelay = '0s';
				document.querySelector(".bstooltip").classList.remove("bstooltip--active");
				setTimeout(function () {
					CanShowTooltip = true;
					checkTooltip();
				}, 450);
			}
		}
	}
}

//Header Backarrow
var headerUsingBackArrow = false;
function headerUseBackArrow(state) {
	var arrowB = document.querySelector("#HeaderBackArrow");
	var drawerB = document.querySelector("#OpenDrawer");
	if (state && !headerUsingBackArrow) {
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
try {
	searchBoxButton.addEventListener('click', function () {
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
} catch (err) { }