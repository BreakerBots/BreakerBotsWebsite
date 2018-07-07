//Header.js -- Finally Organized!




//------------------------------------ Title Overflow ------------------------------------\\
deleteOverflow();
window.addEventListener('resize', deleteOverflow);
setTimeout(1000, deleteOverflow);
function deleteOverflow() {
	[].forEach.call(document.querySelectorAll('[data-delete-overflow-min]'), function (m) {
		var w = m.dataset.deleteOverflowMin ? m.dataset.deleteOverflowMin : 660;
		m.style.display = (window.innerWidth < w) ? "none" : "";
	});
}
//------------------------------------  ------------------------------------\\





//------------------------------------ Backarrow ------------------------------------\\
var headerUsingBackArrow = false;
function headerUseBackArrow(state, link) {
	try {
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
			arrowB.setAttribute('onclick', link || "window.history.back();");
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
		deleteOverflow();
	} catch (err) {  }
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
	deleteOverflow();
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
//  ----------------------------------------    ----------------------------------------  \\



//  ----------------------------------------  Change Avatar  ----------------------------------------  \\
var HeaderChangeAvatarHandler;function HeaderChangeAvatar() {try {var rlId = "HCAUE--" + guid();ShiftingDialog.set({id:"HeaderChangeAvatar",title:"Change Avatar",submitButton:"Submit",cancelButton:"Cancel",contents:'<div style="width: 100%; height: 100%;" id="' + rlId + '"></div>',centerButtons: !1,dontCloseOnExternalClick: !0});ShiftingDialog.open(); ShiftingDialog.enableSubmitButton(!1); HeaderChangeAvatarHandler = new AvatarEditor(document.querySelector("#" + rlId), function () { "HeaderChangeAvatar" == ShiftingDialog.currentId && ShiftingDialog.enableSubmitButton(!0) })} catch (a) { };}ShiftingDialog.addSubmitListener("HeaderChangeAvatar", function () {try{var rt=HeaderChangeAvatarHandler.get(function(c){fetch(c).then(function(b){return b.blob()}).then(function(b){firebase.storage().ref("Avatars/"+users.getCurrentUid()).put(b).on("state_changed",function(a){},function(a){},function(){ShiftingDialog.close();HardRefreshHeaderAvatar();getAvatarUrl(users.getCurrentUid(),function(a){a&&ProfileTabViewing==users.getCurrentUid()&&(document.querySelector(".ProfileTabJI-Avatar").src=a,allUsers[users.getCurrentUid]=a)})})})});rt||(ShiftingDialog.throwFormError("Please Select An Image"),ShiftingDialog.enableSubmitButton(!0))}catch(c){};});
//  ----------------------------------------    ----------------------------------------  \\