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
	try {
		//Do Some Magic
		var data = users.getCurrentUser();
		[].forEach.call(document.querySelectorAll('.EditAccountJS--Autofill'), function (item) {
			try {
				if (item.tagName == "INPUT") item.value = data[item.id.replace('EditAccountJS--', '').toLowerCase()];
				else item.innerHTML = data[item.id.replace('EditAccountJS--', '').toLowerCase()];
			} catch (err) { }
		});
		resizeTextarea(document.querySelector('#EditAccountJS--Desc'));
		document.querySelector('#EditAccountJS--Avatar').src = data.avatar || '../assets/img/iconT.png';
		try {
			$('#EditAccountJS--Phone').inputmask({ 'mask': '(999) 999-9999' });
		} catch (err) { }
	} catch (err) {  }
}
function EditProfileCheckSubmit() {
	try {
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
	} catch (err) { }
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
		ShiftingDialog.set({
			id: "EditProfileChangeAvatar",
			title: "Change Avatar",
			submitButton: "Submit",
			cancelButton: "Cancel",
			contents: '<div style="width: 100%; height: 100%;" id="' + rlId + '"></div>',
			centerButtons: !1,
			dontCloseOnExternalClick: !0
		});
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
			if (error.code == 'auth/requires-recent-login') {
				DSI89();
			}
		});
	}
}
function f494414f4727bd3e133e5aa895426e8c928e5dff22533a89642e3e9a14a032c9(a) {
	firebase.auth().currentUser.updateEmail(a).then(function () {
		location.reload();	
	}).catch(function (error) {
		if (error.code == 'auth/requires-recent-login') {
			DSI89();
		}
	});
}

function DSI89() {
	ShiftingDialog.set({
		id: "EditProfileConfirmPassword",
		contents: `
			<div class="card card-border-color card-border-color-primary mdc-elevation--z10" style="min-height: 300px; height: calc(15vw + 10px); transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1); width: 25vw; min-width: 300px;">
				<div class="card-header" style="margin-bottom: 0;">
					<img src="../assets/img/logosheet.png" alt="logo" style="width: 35%; margin-left: 32.5%;" class="logo-img">
					<span class="splash-description">Please Confirm Your Password.</span>
				</div>
				<div class="card-body">
					<form>
						<div class="form-group">
							<div class="SHP">
								<input id="AVRAPass" style="border: none; display: inline; width: 80%;" type="password" required placeholder="Password" autocomplete="off" class="form-control">
								<div style="position: absolute; right: 0; float: right; top: 10px; transform: scale(1); transition: all 0.15s cubic-bezier(.2, 0, .2, 1);">
									<i style="display: inline; font-size: 27px;" class="material-icons mdc-icon-toggle" role="button" data-mdc-auto-init="MDCIconToggle" onclick="SHP(this.parentNode.parentNode.querySelector('input'));">visibility_off</i>
								</div>
							</div>
						</div>
						<div class="form-group login-submit">
							<button onclick="firebase.auth().currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential( firebase.auth().currentUser.email, document.querySelector('#AVRAPass').value )).then(function () {  ShiftingDialog.close(); }).catch(function (err) {  document.querySelector('#AVRAPass').setCustomValidity('Wrong Password'); document.querySelector('#AVRAPass').reportValidity(); });" type="submit" style="width: 90%; display: block; margin: auto;" data-mdc-auto-init="MDCRipple" class="mdc-button mdc-button--raised mdc-ripple-upgraded">Confirm</button>
						</div>
					</form>
				</div>
				<div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: -5; background-color: rgba(0,0,0,0.5); opacity: 0; transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);" id="mainLoader">
					<div style="transform: scale(2); position: absolute; left: 50%; top: 30%;">
						<svg width="50px" height="50px" class="material-loader">
							<circle cx="25" cy="25" r="20" class="material-loader__circle" />
						</svg>
					</div>
				</div>
			</div>
		`,
		dontCloseOnExternalClick: true,
		dontCloseOnEsc: true,
		forceFullscreen: true,
		hideFooter: true,
		hideHeader: true
	}); ShiftingDialog.open();
}
//  ----------------------------------------    ----------------------------------------  \\