//PeTeSwitcher.js

const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new mdc.topAppBar.MDCTopAppBar(topAppBarElement);

var pageContent = document.querySelector('.page-content');
var pdrawer = document.querySelector('.permanent-drawer');
var tdrawer = document.querySelector('.mdc-drawer--temporary');
var openDrawerButton = document.querySelector('#OpenDrawer');
PeteSwitcher(pageContent, pdrawer, tdrawer, openDrawerButton, topAppBarElement);

//PeTe Switcher [Permanent (Desktop), Temporary (Mobile)]
function PeteSwitcher(pageContent, pdrawer, tdrawerEl, openDrawerButton, topAppBarElement) {
	tdrawerEl.innerHTML = pdrawer.innerHTML; //Clone Data
	var tdrawer = new mdc.drawer.MDCTemporaryDrawer(tdrawerEl); //Init Temp Drawer
	var CPeteState = 0; //Pete Switcher State [0: Blank, 1: Mobile, -1: Desktop]
	window.addEventListener("resize", adjustPete); //Adjust On Window Resize
	adjustPete(); //Adjust At Start
	function adjustPete() {
		if (window.matchMedia('(max-width: 768px)').matches && CPeteState != 1) { //Fire On Change To width < 768
			if (CPeteState != 0) tdrawer.open = pdrawerOpen();
			openPDrawer(false);
			CPeteState = 1; //Set Pete Switcher State
			pdrawer.style.display = "none"; //Hide The Perm Drawer
		}
		else if (window.matchMedia('(min-width: 800px)').matches && CPeteState != -1) { //Fire On Change To width > 800
			if (CPeteState != 0) openPDrawer(tdrawer.open);
			tdrawer.open = false;
			CPeteState = -1; //Set Pete Switcher State
			pdrawer.style.display = "block"; //Show the Perm Drawer
		}
		pdrawer_adjustpagecontent();
		tdrawerEl.style.marginTop = topAppBarElement.clientHeight + "px"; //Adjust the height of the temp drawer relative to the header
		document.querySelector("main").style.paddingTop = topAppBarElement.clientHeight + "px"; //Adjust the page-content relative too the header
	}
	openDrawerButton.addEventListener('click', toggleDrawer);
	PeteSwitcher.toggle = toggleDrawer;
	function toggleDrawer() {
		if (CPeteState == 1) {
			tdrawer.open = !tdrawer.open;
		} else if (CPeteState == -1) {
			openPDrawer(!pdrawerOpen());
		}
	}
	PeteSwitcher.set = function (state) {
		if (CPeteState == 1) {
			tdrawer.open = state;
		} else if (CPeteState == -1) {
			openPDrawer(state);
		}
	}
	PeteSwitcher.closeTempDrawer = function () {
		tdrawer.open = false;
	}
	window.addEventListener('hashchange', function () {
		tdrawer.open = false;
	});
	function openPDrawer(state) { pdrawer.style.transform = state ? "translateX(0px)" : "translateX(-320px)"; pdrawer_adjustpagecontent(); }
	function pdrawerOpen() { return !(pdrawer.style.transform == "translateX(-320px)"); }
	function pdrawer_adjustpagecontent() {
		pageContent.style.marginLeft = (CPeteState == -1 ? (320 + Number(pdrawer.style.transform.substring(11).slice(0, -3))) : 0) + "px";
	}
}

//Show a highlight arround the current tab
addHashVariableListener("tab", function () {
	[].forEach.call(document.querySelector("#MainNavDrawers").querySelectorAll(".mdc-drawer-item--selected"), function (item) {
		item.classList.remove("mdc-drawer-item--selected");
	});
	[].forEach.call(document.querySelector("#MainNavDrawers").querySelectorAll(`[onclick="setHashParam('tab','` + getHashParam("tab") + `');"]`), function (item) {
		item.classList.add("mdc-drawer-item--selected");
	});
});