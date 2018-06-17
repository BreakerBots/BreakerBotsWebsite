// EditAccount.js
var EditAccountTab = new RegisteredTab("EditAccount", EditProfileFirstInit, EditProfileInit, null, true, 'EditAccountTab');


//  ----------------------------------------  Init  ----------------------------------------  \\
var EditProfileTabBar;
function EditProfileFirstInit() {
	EditProfileTabBar = new mdc.tabs.MDCTabBarScroller(document.querySelector('.EditAccount-Tabs'));
}
function EditProfileInit() {
	authLoadedFullWait(function () {
		PeteSwitcher.set(false);
		headerUseBackArrow(true, `setHashParam('profile', '` + users.getCurrentUid() + `'); setHashParam('tab', 'Profile');`);
		showMainLoader(false);
		document.querySelector('#page-scroll').scrollTop = 0; document.querySelector('#page-scroll').style.overflowY = 'hidden';
		EditProfileChangeTab();
	});
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Tab Switching  ----------------------------------------  \\
addHashVariableListener('EditAccountTab', EditProfileChangeTab);
function EditProfileChangeTab() {
	//Hide Old Tab
	[].forEach.call(document.querySelectorAll('.EditAccount-View--Active'), function (item) {
		item.classList.remove('EditAccount-View--Active');
	});

	//Show the new One
	var tab = 0;
	try {
		document.querySelector('.EditAccount-View--' + (getHashParam('EditAccountTab') || "0")).classList.add('EditAccount-View--Active');
		EditProfileTabBar.tabBar.setActiveTabIndex_(Number(getHashParam('EditAccountTab') || "0"));
		tab = Number(getHashParam('EditAccountTab') || "0");
	} catch (err) {
		setHashParam('EditAccountTab', 0);
		tab = 0;
	}
	switch (tab) {
		case 0: EditProfileDraw(); break;
		case 1: break;
		case 2: break;
	};
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Fill In Values  ----------------------------------------  \\
function EditProfileDraw() {
	//Do Some Magic
	var data = users.getCurrentUser();
	[].forEach.call(document.querySelectorAll('.EditAccountJS--Autofill'), function (item) {
		try {
			if (item.tagName == "INPUT") item.value = data[item.id.replace('EditAccountJS--', '').toLowerCase()];
			else item.innerHTML = data[item.id.replace('EditAccountJS--', '').toLowerCase()];
		} catch (err) { } });
	resizeTextarea(document.querySelector('#EditAccountJS--Desc'));
	document.querySelector('#EditAccountJS--Avatar').src = data.avatar || '../assets/img/iconT.png';
}
function EditProfileCheckSubmit() {
	var data = users.getCurrentUser();
	var hc = false;
	[].forEach.call(document.querySelectorAll('.EditAccountJS--Autofill'), function (item) {
		try {
			if (!hc) {
				hc = !(item.value == data[item.id.replace('EditAccountJS--', '').toLowerCase()]);
			}
		} catch (err) { }
	});
	document.querySelector('#EditAccountJS--Submit').style.transform = "scale(" + (hc ? 1 : 0) + ")";
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Submit  ----------------------------------------  \\
function EditProfileSubmitChanges() {
	var data = users.getCurrentUser();
	delete data.avatar;
	[].forEach.call(document.querySelectorAll('.EditAccountJS--Autofill'), function (item) {
		try {
			data[item.id.replace('EditAccountJS--', '').toLowerCase()] = item.value == "undefined" ? "" : item.value || "";
		} catch (err) { }
	});
	firebase.app().firestore().collection("users").doc(users.getCurrentUid()).set(data, { merge: true }).then(function () {
		location.reload();
	});
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Change Avatar  ----------------------------------------  \\
var EditProfileChangeAvatarHandler;
function EditProfileChangeAvatar() {
	try {
		var rlId = "HCAUE--" + guid();
		ShiftingDialog.set("EditProfileChangeAvatar", "Change Avatar", "Submit", "Cancel",
			'<div style="width: 100%; height: 100%;" id="' + rlId + '"></div>'
		);
		ShiftingDialog.open();
		ShiftingDialog.enableSubmitButton(!1);
		EditProfileChangeAvatarHandler = new AvatarEditor(document.querySelector("#" + rlId), function () {
			"EditProfileChangeAvatar" == ShiftingDialog.currentId && ShiftingDialog.enableSubmitButton(!0)
		})
	} catch (a) { };
}
ShiftingDialog.addSubmitListener("EditProfileChangeAvatar", function () {
	try {
		var rt = EditProfileChangeAvatarHandler.get(function (c) {
			fetch(c).then(function (b) {
				return b.blob()
			}).then(function (b) {
				firebase.storage().ref("Avatars/" + users.getCurrentUid()).put(b).on("state_changed",
					function (a) { }, function (a) { },
					function () {
						ShiftingDialog.close();
						getAvatarUrl(users.getCurrentUid(), function (img) {
							document.querySelector('#EditAccountJS--Avatar').src = img;
						});
					})
			})
		}); rt || (ShiftingDialog.throwFormError("Please Select An Image"), ShiftingDialog.enableSubmitButton(!0))
	} catch (c) { };
});
//  ----------------------------------------    ----------------------------------------  \\



//  ----------------------------------------    ----------------------------------------  \\
function b84eef34da92d0db411e42dea26c16f5bd1b3aa2bbe7ab24f288964f8a7497d6(a, b) {
	if (a == b) {
		firebase.auth().currentUser.updatePassword(a).then(function () {
			location.reload();
		}).catch(function (error) {
			console.log(error);
		});
	}
}
function f494414f4727bd3e133e5aa895426e8c928e5dff22533a89642e3e9a14a032c9(a) {
	firebase.auth().currentUser.updateEmail(a).then(function () {
		location.reload();	
	}).catch(function (error) {
		console.log(error);
	});
}
//  ----------------------------------------    ----------------------------------------  \\