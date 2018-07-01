// Menus.js

/*
	This File contains code for V1 (depricated) and V2
	
	For V2:
		Uses a function call to to open
		Init:
			
		Options:
			
		
	For V1 (depricated):
		Uses a div with menu html inside
		Init:
			add the classes: "dropdown-menu-c" and "dropdown-menu"
			call "toggleMenu(MENU, ANCHOR_TO_ME)" to open or close
	
		Options:
			data-menu-offset="X_PIXELS Y_PIXELS"
*/

//  ----------------------------------------  V2  ----------------------------------------  \\
var menu = new class Menu {
	constructor() {
		window.addEventListener('resize', this.anchor);
		setInterval(this.anchor, 5000);
	}

	/**
	 * Opens the menu and sets the content
	 * @param {String} html The HTML Content to Fill in The Menu
	 * @param {HTMLElement} anchorElement The Element To Anchor the Menu to. Will Default to To An Element Calling The Function
	 * @param {String} style (Optional) Any Extra CSS Properties You Want On The Menu
	 */
	open(html, anchorElement, style) {
		try {
			anchorElement = anchorElement || event.srcElement;
			if (!menu.isOpen) {
				menu.element.innerHTML = html;
				menu.anchorElement = anchorElement;
				menu.element.style.cssText = style;
				menu.element.classList.add('breaker-menu--open');
				menu.anchor();
			}
			else {
				menu.close();
				setTimeout(function () {
					menu.element.innerHTML = html;
					menu.anchorElement = anchorElement;
					menu.element.style.cssText = style;
					menu.element.classList.add('breaker-menu--open');
					menu.anchor();
				}, menu.closetime);
			}
		} catch (err) { console.error('Caught', err); return false; }
	}

	/**
	 * Toggles The Menu (Opens if it closed and closes it if open) and sets the content
	 * @param {String} html The HTML Content to Fill in The Menu
	 * @param {HTMLElement} anchorElement The Element To Anchor the Menu to. Will Default to To An Element Calling The Function
	 * @param {String} style (Optional) Any Extra CSS Properties You Want On The Menu
	 */
	toggle(html, anchorElement, style) {
		if (menu.isOpen) {
			menu.close();
		}
		else {
			menu.open(html, anchorElement, style);
		}
	}

	/**
	 * Closes The Menu
	 */
	close() {
		try {
			menu.element.classList.remove('breaker-menu--open');
			menu.anchorElement = undefined;
			setTimeout(function () {
				if (!menu.anchorElement) {
					menu.element.style.left = "-100vw";
					menu.element.style.top = "-100vh";
					menu.element.innerHTML = "";
					menu.anchor();
				}
			}, menu.closetime);
		} catch (err) { return false; }
	}

	anchor() {
		if (menu.anchorElement) {
			var a = menu.anchorElement.getBoundingClientRect();
			var mw = menu.element.scrollWidth;

			var sw = window.innerWidth;

			var tx = (a.left);
			var ty = (a.top + a.height);

			//Check Overflow Right
			if (tx + mw > sw) {
				//Check If Can Flip
				if (tx - mw > 0) {
					//Flip
					tx = tx - mw + a.width;
				}
				else {
					//Adjust Overflow Right
					tx -= ((tx + mw) - sw).min(0);
				}
			}
			//Adjust Overflow Left
			tx.min(0);

			menu.element.style.left = tx + "px";
			menu.element.style.top = ty + "px";
			menu.element.style.transformOrigin = "50% 0";
		}
	}

	get isOpen() {
		try {
			return menu.element.classList.contains('breaker-menu--open');
		} catch (err) { return false; }
	}

	get element() {
		try {
			return document.querySelector('#BreakerMenu');
		} catch (err) { return; }
	}

	get closetime() {
		return 800;
	}

	get opentime() {
		return 800;
	}
}


//  ----------------------------------------    ----------------------------------------  \\





//  ----------------------------------------  V1 (depricated)  ----------------------------------------  \\
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
	var menuEl = (
		menu ?
			(typeof menu == "string" ? document.querySelector(menu) : menu) :
			findNearestMenu(event.srcElement)
	);

	//If element wants menu anchored to it
	if (anchorToMe) {
		// Add To Anchor List 
		if (currentMenuAnchors[1].indexOf(menuEl) == -1 ) {
			currentMenuAnchors[1].push(menuEl);
			currentMenuAnchors[0].push(event.srcElement);
		}
		//Update the anchors for the first time or just in case
		updateMenuAnchors();
	}

	//Show/Hide the menu
	menuEl.classList.toggle('showMenu');
	menuEl.classList.add('rejectMenuClickEvent');
}
var currentMenuAnchors = [[], []];
window.addEventListener('resize', updateMenuAnchors);
window.addEventListener('click', closeMenus);
function updateMenuAnchors() {
	for (var i = 0; i < currentMenuAnchors[0].length; i++) {
		var menuEl = currentMenuAnchors[1][i];
		var menuButton = currentMenuAnchors[0][i];

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
			menuEl.style.left = pos[0].min(0) + "px";
			menuEl.style.top = pos[1].min(0) + "px";
			menuEl.style.transformOrigin = transfOrX + "% 0%";
		}
	}
}
function closeMenus() {
	currentMenuAnchors[1].forEach(function (obj) {
		var menuEl = obj;
		if (menuEl) {
			if (menuEl.classList.contains('showMenu') && !menuEl.classList.contains('rejectMenuClickEvent')) {
				var menuPos = menuEl.getBoundingClientRect();
				if (!pointInBox(event.pageX, event.pageY, menuPos.left, menuPos.top, menuPos.width, menuPos.height)) {
					menuEl.classList.remove('showMenu');
				}
			}
			else if (menuEl.classList.contains('rejectMenuClickEvent')) {
				menuEl.classList.remove('rejectMenuClickEvent');
			}
		}
	});
}
//  ----------------------------------------    ----------------------------------------  \\

var sfd8g7 =
	`
	<ul class="mdc-list demo-list mdc-list--two-line mdc-list--avatar-list">
	<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple">
		<span class="mdc-list-item__graphic material-icons" aria-hidden="true" style="font-size: 30px;">assignment</span>
		<span class="mdc-list-item__text" style="font-size: 16px;">
			Todo List
			<span class="mdc-list-item__secondary-text" style="font-size: 13px;">
				Revert From A Version in History, ...
			</span>
		</span>
	</li>
	<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple">
		<span class="mdc-list-item__graphic material-icons" aria-hidden="true" style="font-size: 30px;">build</span>
		<span class="mdc-list-item__text" style="font-size: 16px;">
			Item Management System
			<span class="mdc-list-item__secondary-text" style="font-size: 13px;">
				Add a new Part, Approve Part Requests, 
			</span>
		</span>
	</li>
	<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple">
		<span class="mdc-list-item__graphic material-icons" aria-hidden="true" style="font-size: 30px;">person</span>
		<span class="mdc-list-item__text" style="font-size: 16px;">
			Sign In/Sign Out
			<span class="mdc-list-item__secondary-text" style="font-size: 13px;">
				View Hours Of Members or Sign Everyone Out
			</span>
		</span>
	</li>
	<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple">
		<span class="mdc-list-item__graphic material-icons" aria-hidden="true" style="font-size: 30px;">group</span>
		<span class="mdc-list-item__text" style="font-size: 16px;">
			Teams
			<span class="mdc-list-item__secondary-text" style="font-size: 13px;">
				Make A User A Team Lead, or Add Them To Team
			</span>
		</span>
	</li>
	<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple">
		<span class="mdc-list-item__graphic material-icons" aria-hidden="true" style="font-size: 30px;">person_add</span>
		<span class="mdc-list-item__text" style="font-size: 16px;">
			Approve Users
			<span class="mdc-list-item__secondary-text" style="font-size: 13px;">
				Approve A User
			</span>
		</span>
	</li>
	<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple">
		<span class="mdc-list-item__graphic material-icons" aria-hidden="true" style="font-size: 30px;">lock</span>
		<span class="mdc-list-item__text" style="font-size: 16px;">
			Manage Users
			<span class="mdc-list-item__secondary-text" style="font-size: 13px;">
				Change a users Clearance
			</span>
		</span>
	</li>
</ul>
`;