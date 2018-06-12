//Header.js -- Finally Organized!




//------------------------------------ Title Overflow ------------------------------------\\
deleteOverflow(); window.addEventListener('resize', deleteOverflow);
function deleteOverflow() {
	[].forEach.call(document.querySelectorAll('[data-delete-overflow-min]'), function (m) {
		var w = m.dataset.deleteOverflowMin ? m.dataset.deleteOverflowMin : 660;
		m.style.display = (window.innerWidth < w) ? "none" : "block";
	});
}
//------------------------------------  ------------------------------------\\





//------------------------------------ Backarrow ------------------------------------\\
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
//------------------------------------  ------------------------------------\\





//------------------------------------ Search ------------------------------------\\
var searchBoxButton = document.querySelector('#headerSearchBoxOpen');
var headerSearchInput = document.querySelector('.headerSearchInput');
var headerSearchBoxOpen = false;
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

//Listener
function addHeaderSearchInputListener(tabName, callback) {
	var tab = tabName;
	var func = callback;
	headerSearchInput.addEventListener('input', function () {
		if (getHashParam('tab') == tab) {
			if (document.querySelector('.headerSearchBox').classList.contains('headerSearchBox--open')) {
				func(headerSearchInput.value);
			}
			else {
				func("");
			}
		}
	});
	document.querySelector('#headerSearchBoxClose').addEventListener('click', function () {
		if (getHashParam('tab') == tab) {
			func("");
		}
	});
	addHashVariableListener('tab', function () {
		if (getHashParam('tab') == tab) {
			if (document.querySelector('.headerSearchBox').classList.contains('headerSearchBox--open')) {
				func(headerSearchInput.value);
			}
			else {
				func("");
			}
		}
	});
}
//------------------------------------  ------------------------------------\\



