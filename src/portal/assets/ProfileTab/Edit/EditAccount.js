// EditAccount.js
var EditAccountTab = new RegisteredTab("EditAccount", EditProfileFirstInit, EditProfileInit, null, true, 'EditAccountTab');


//  ----------------------------------------  Init  ----------------------------------------  \\
function EditProfileFirstInit() {
	new mdc.tabs.MDCTabBarScroller(document.querySelector('.EditAccount-Tabs'));
}
function EditProfileInit() {
	authLoadedFullWait(function () {
		headerUseBackArrow(true, `setHashParam('profile', '` + users.getCurrentUid() + `'); setHashParam('tab', 'Profile');`);
		showMainLoader(false);
		document.querySelector('#page-scroll').scrollTop = 0; document.querySelector('#page-scroll').style.overflowY = 'hidden';
		EditProfileDraw(true)
	});
}

addHashVariableListener('EditAccountTab', EditProfileDraw);

function EditProfileDraw(dontPlaySwipe) {
	
}
//  ----------------------------------------    ----------------------------------------  \\