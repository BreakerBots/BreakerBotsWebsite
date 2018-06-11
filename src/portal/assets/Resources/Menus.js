// Menus.js

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
			try {
				if (menuEl.dataset.menuOffset) {
					pos[0] += Number(menuEl.dataset.menuOffset.split(" ")[0]);
					pos[1] += Number(menuEl.dataset.menuOffset.split(" ")[1]);
				}
			} catch (err) { }

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
