//Called when user transitions to the profile tab
function startProfile() {
	//Close dialogues possibly opened when moved to this tab
	if (FolderHistoryDialogue.open) { FolderHistoryDialogue.close(); }
	if (FolderArchiveHistoryDialogue.open) { FolderArchiveHistoryDialogue.close(); }

	authLoadedWait(function () {
		//Find if the user is viewing his own profile
		var onThisProfile = (getUrlParameterByName("profile", null) == "this") || (getUrlParameterByName("profile", null) == users.getCurrentUid());

		//Get the profile id from the url if viewing another user else find the logged in users id
		var profileId = onThisProfile ? firebase.auth().currentUser.uid : getUrlParameterByName("profile", null);

		//Fill in the values for the profile on the gui
		firebase.app().firestore().collection("users").doc(profileId).get().then(function (doc) {
			document.querySelector('#PE-Name').value = doc.data().name;
			document.querySelector('#PE-User').value = doc.data().username;
			document.querySelector('#PE-Desc').value = doc.data().desc;
			document.querySelector('#PE-Role').value = doc.data().role;
			document.querySelector('#PE-Grade').value = doc.data().grade;
			document.querySelector('#PE-Phone').value = doc.data().phone;
			document.querySelector('#PE-Email').value = doc.data().email;
			document.querySelector('#PE-Slack').value = doc.data().slack;
			document.querySelector('#PE-Github').value = doc.data().github;
			document.querySelector('#PE-Clearance').innerHTML = doc.data().clearance;
			document.querySelector('#PE-Contributions').innerHTML = 0; 
			document.querySelector('#PE-Tasks').innerHTML = 0;
			document.querySelector('#PE-Teams').value = formatTeamArray(doc.data().teams);
		});

		//doc.data().teams.length

		//Download and display the profile picture
		function refreshProfileAvatar() {
			document.querySelector('#ProfilePicture').src = users.getAvatar(profileId);
			if (onThisProfile) document.querySelector('#AvatarPicture').src = users.getAvatar(profileId);
		} refreshProfileAvatar();
		startProfile.refreshProfileAvatar = refreshProfileAvatar;

		//Viewing Own Account
		if (onThisProfile) {
			//Initialize the save fab (but dont open yet)
			var EditAccountFab = document.querySelector('#EditAccountFab'); mdc.ripple.MDCRipple.attachTo(EditAccountFab);

			//Show Textboxes
			document.querySelectorAll('.ProfileEdit').forEach(function (PE, i) {
				PE.removeAttribute('readonly');
				PE.addEventListener('input', function () {
					//On text box edit, show the save fab
					EditAccountFab.classList.remove('mdc-fab--exited');
					mdc.ripple.MDCRipple.attachTo(EditAccountFab);
				});
			});
			//Show Profile Picture Hover Thinggy
			document.querySelector('#ProfileEditPictureButton').removeAttribute('hidden');

			//On Clicking Save
			EditAccountFab.addEventListener('click', function () {
				//Hide Save Button
				EditAccountFab.classList.add('mdc-fab--exited');

				//Save Data To Database (Execpt Email and Username)
				firebase.app().firestore().collection("users").doc(profileId).set({
					github: document.querySelector('#PE-Github').value,
					slack: document.querySelector('#PE-Slack').value,
					grade: document.querySelector('#PE-Grade').value,
					phone: document.querySelector('#PE-Phone').value,
					role: document.querySelector('#PE-Role').value,
					name: document.querySelector('#PE-Name').value,
					desc: document.querySelector('#PE-Desc').value
				}, { merge: true }).then(function () {
					//Then Save the username and email to Authentication
					if (document.querySelector('#PE-Email').value != firebase.auth().currentUser.email) { ChangeEmailDialogue.show(); }
					if (document.querySelector('#PE-User').value != firebase.auth().currentUser.displayName) {
						firebase.app().firestore().collection("users").doc(profileId).set({
							username: document.querySelector('#PE-User').value
						}, { merge: true }).then(function () {
							firebase.auth().currentUser.updateProfile({
								displayName: document.querySelector('#PE-User').value,
								photoURL: null
							}).then(function () {
								document.getElementById("UserNameL").innerHTML = firebase.auth().currentUser.displayName;
								document.getElementById("UserNameR").innerHTML = firebase.auth().currentUser.displayName;

								firebase.app().firestore().collection("users").doc(profileId).get().then(function (doc) {
									document.querySelector('#PE-Name').value = doc.data().name;
									document.querySelector('#PE-User').value = doc.data().username;
									document.querySelector('#PE-Desc').value = doc.data().desc;
									document.querySelector('#PE-Role').value = doc.data().role;
									document.querySelector('#PE-Grade').value = doc.data().grade;
									document.querySelector('#PE-Phone').value = doc.data().phone;
									document.querySelector('#PE-Slack').value = doc.data().slack;
									document.querySelector('#PE-Github').value = doc.data().github;
									document.querySelector('#PE-Clearance').innerHTML = doc.data().clearance;
								});
							});
						});
					}
				});
			});
		}
		//Viewing Other Account
		else {

		}
	});
}

function formatTeamArray(teams) {
	var ret = "";
	teams.forEach(function (tm, i, arr) {
		ret += tm;
		if (i != arr.length - 1 && arr.length > 2) ret += ", ";
		if (i == arr.length - 2) { ret += (arr.length > 2 ? "" : " ") + "and "; }
	});
	return ret;
}