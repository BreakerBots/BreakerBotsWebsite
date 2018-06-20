//Tabs.Js

/**
 * Ignore This handled by an assortment of other classes including this one. 
 */
function updateTabs(tab) {
	//If JSI (Just Signed In)
	if (window.location.hash == "#jsi") {
		TabHandleJSI();
		return;
	}

	// Last Tab
	var lastTab = document.querySelector('.tab.active');
		
	//Get the tab from the url and verify
	if (stringUnNull(tab) == "") {
		tab = getHashParam('tab');
		if (stringUnNull(tab) == "") {
			tab = 'General';
		}
	}

	if (!document.querySelector('#' + tab)) {
		setHashParam('tab', TabGuessName(tab));
		return;
	}

	//Make sure your not switching to the same tab
	if (!lastTab || (!lastTab ? false : (lastTab.id != tab))) {
		document.querySelector('header').style.transform = "";
		showMainLoader(true);
		headerUseBackArrow(false);
		headerUseSearch(false);

		//Clear the last tab's header extension
		document.querySelector('#headerExtensionContainer');

		//Make sure content is scrollable
		document.querySelector("#page-scroll").style.overflowY = "auto";
		document.querySelector("#page-scroll").scrollTop = 0;

		//Move the last tab out
		if (lastTab) {
			//Send Exit Callback to tab handlers
			sendTabExitCallback(lastTab.id);

			//Exit the last tab and play animation
			lastTab.classList.remove('active');
			lastTab.classList.add('exit');
			lastTab.addEventListener("animationend", function () { event.srcElement.classList.remove('exit'); });
		}

		//Delete Hash Junk
		deletePerTabHashJunk(tab);

		//Update the selected item in menu
		var LeftNavLists = document.querySelectorAll('.LeftNavList');
		[].forEach.call(LeftNavLists, function (lnl) {
			if (lnl.querySelector(".mdc-list-item--activated")) lnl.querySelector(".mdc-list-item--activated").classList.remove('mdc-list-item--activated');
			if (lnl.querySelector('[href="#tab=' + tab + '"]')) { lnl.querySelector('[href="#tab=' + tab + '"]').classList.add('mdc-list-item--activated'); }
		});

		//Open the new tab and play animation
		document.querySelector('#' + tab).classList.add('active');

		//Send Open Callback to tab handlers
		sendTabOpenCallback(tab);
	}
}

/**
 * Clears the current tab (So that no tab is visible). Can be used for a transition to a new tab through a reload
 */
function clearTab() {
	var lastTab = document.querySelector('.tab.active');
	if (lastTab) {
		//Send Exit Callback to tab handlers
		sendTabExitCallback(lastTab.id);

		//Exit the last tab and play animation
		lastTab.classList.remove('active');
		lastTab.classList.add('exit');
		lastTab.addEventListener("animationend", function () { event.srcElement.classList.remove('exit'); });
	}

	//Update the selected item in menu
	var LeftNavLists = document.querySelectorAll('.LeftNavList');
	[].forEach.call(LeftNavLists, function (lnl) {
		if (lnl.querySelector(".mdc-list-item--activated")) lnl.querySelector(".mdc-list-item--activated").classList.remove('mdc-list-item--activated');
	});
}

function getCurrentTab() {
	return document.querySelector('.tab.active') ? document.querySelector('.tab.active').id : null;
}

//Update the tabs on "#" change in url
window.addHashVariableListener("tab", updateTabs);
document.addEventListener("DOMContentLoaded", function (event) {
	if (window.location.hash == "#jsi")
		updateTabs(undefined);
});

/**
 * Shows and hides the main the loader (the one under the header)
 * @param {boolean} state (False) Hides the loader, (True) Shows the loader.
 */
function showMainLoader(state) {
	document.querySelector("#MainLoader").style.opacity = (state ? 1 : 0);
} function hideML() { showMainLoader(false); }


//Just signed in intro
function TabHandleJSI() {
	//JSI Transition
	var lastTab = document.querySelector('.tab.active');
	if (lastTab) {
		//Send Exit Callback to tab handlers
		sendTabExitCallback(lastTab.id);

		//Exit the last tab and play animation
		lastTab.classList.remove('active');
		lastTab.classList.add('exit');
		lastTab.addEventListener("animationend", function () { event.srcElement.classList.remove('exit'); });
	}

	PeteSwitcher.instantClosePermDrawer();

	var header = document.querySelector('header');
	setTimeout(function () {
		header.style.transition = "all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)";
		header.style.transform = "";
	}, 10);
	setTimeout(function () {
		header.style.transition = "";
		PeteSwitcher.openPermDrawer();

		setTimeout(function () {
			//Reroute to default page
			setHashParam('tab', 'General');
		}, 600);
	}, 600);
}

//Guess the tab
var TabSearchEngine;
function TabGuessName(tab) {
	try {
		if (!TabSearchEngine)
			TabSearchEngine = new Fuse(registeredTabs, {
				shouldSort: true,
				threshold: 1.0,
				location: 0,
				distance: 200,
				maxPatternLength: 64,
				minMatchCharLength: 1,
				keys: [
					"tabName"
				]
			});
		var gt = TabSearchEngine.search(tab);

		if (gt[0] && (gt[0] ? gt[0].tabName : false))
			return gt[0].tabName || 'General';
		else
			return 'General';
	} catch (err) { return 'General'; }
}