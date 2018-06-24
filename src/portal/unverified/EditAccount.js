// Unverified -- EditAccount.js

document.addEventListener('DOMContentLoaded', EditProfileDraw);
var currentUser;
function EditProfileDraw() {
	function a() {
		if (firebase.auth().currentUser) {
			firebase.app().firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then(function (doc) {
				try {
					//Do Some Magic
					var data = doc.data();
					currentUser = data;
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
				} catch (err) { }
			});
		}
		else
			setTimeout(a, 1000);
	} a();
}

function EditProfileCheckSubmit() {
	try {
		var data = currentUser;
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

function EditProfileSubmitChanges() {
	var data = currentUser;
	[].forEach.call(document.querySelectorAll('.EditAccountJS--Autofill'), function (item) {
		try {
			data[item.id.replace('EditAccountJS--', '').toLowerCase()] = item.value == "undefined" ? "" : item.value || "";
		} catch (err) { }
	});
	firebase.app().firestore().collection("users").doc(firebase.auth().currentUser.uid).set(data, { merge: true }).then(function () {
		location.reload();
	});
}

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
				firebase.storage().ref("Avatars/" + firebase.auth().currentUser.uid).put(b).on("state_changed",
					function (a) { }, function (a) { },
					function () {
						ShiftingDialog.close();
						getAvatarUrl(firebase.auth().currentUser.uid, function (img) {
							document.querySelector('#EditAccountJS--Avatar').src = img;
						});
					})
			})
		}); rt || (ShiftingDialog.throwFormError("Please Select An Image"), ShiftingDialog.enableSubmitButton(!0))
	} catch (c) { };
});

function getAvatarUrl(uid, func, rem) {
	var storageRef = firebase.storage().ref('Avatars/' + uid);
	storageRef.getDownloadURL()
		.catch(function (error) {
			if (error.code == "storage/object-not-found") {
				func("../assets/img/iconT.png", rem); return; //Default Avatar Fallback
			}
		})
		.then(function (url) {
			func(url, rem); return; //Return the download url for the avatar
		});
}