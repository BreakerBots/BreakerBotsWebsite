//Tabs.Js

//The main update tabs function
function updateTabs(tab) {
	//If JSI (Just Signed In)
	if (window.location.hash == "#jsi") {
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

		document.querySelector('.permanent-drawer').classList.add("transition--instant");
		document.querySelector('.permanent-drawer').style.transform = "translateX(-320px)";
		setTimeout(function () { document.querySelector('.permanent-drawer').classList.remove("transition--instant"); }, 10);

		var header = document.querySelector('header');
		setTimeout(function () {
			header.style.transition = "all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)";
			header.style.transform = "";
		}, 10);
		setTimeout(function () {
			header.style.transition = "";
			document.querySelector('.permanent-drawer').style.transform = "translateX(0px)";

			setTimeout(function () {
				//Reroute to default page
				window.location.hash = "#tab=General";
			}, 600);
		}, 600);
	}
	else {
		document.querySelector('header').style.transform = "";

		showMainLoader(true);

		//Switch To Tab To Select Tab From Url
		if (tab == undefined) { tab = getTabFromURL('tab'); if (tab == null) { tab = 'General'; } }

		//Send Open Callback to tab handlers
		sendTabOpenCallback(tab);

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
			if (lnl.querySelector('[href="#tab=' + tab + '"]')) { lnl.querySelector('[href="#tab=' + tab + '"]').classList.add('mdc-list-item--activated'); }
		});

		//Open the new tab and play animation
		document.getElementById(tab).classList.add('active');
	}
}

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

function willHrefReload(href) {
	return window.location.search != href;
}

//Update the tab on refresh
document.addEventListener('DOMContentLoaded', function () { updateTabs(); });
//Update the tabs on "#" change in url
$(window).on('hashchange', function () { updateTabs(); });


//Show the main loader (under header)
function showMainLoader(state) {
	document.querySelector("#MainLoader").style.opacity = (state ? 1 : 0);
} function hideML() { showMainLoader(false); }


//Get the tab and other data from url
function getTabFromURL() {
	return window.location.hash == "" ? null : window.location.hash.substring(5);
}
function getUrlParameterByName(name, url) {
	if (!url) url = window.location.href; name = name.replace(/[\[\]]/g, "\\$&"); var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url); if (!results) return null; if (!results[2]) return ''; return decodeURIComponent(results[2].replace(/\+/g, " "));
}
