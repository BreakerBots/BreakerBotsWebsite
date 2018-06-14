// SideNav.js

function toggleNavSubMenu(menu) {
	[].forEach.call(document.querySelectorAll(menu), function (m) {
		m.classList.toggle('side-nav__submenu-open');
	});
}