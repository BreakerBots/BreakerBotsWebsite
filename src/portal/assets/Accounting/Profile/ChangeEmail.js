//Change Email Handling
const ChangeEmailDialogue = new mdc.dialog.MDCDialog(document.querySelector('#change-email-dialog'));
document.getElementById('ChangeEmailCancel').addEventListener('click', function () { ChangeEmailDialogue.close(); }); //Close the dialog
function ChangeEmail(e) {
	if (e.preventDefault) e.preventDefault(); FormChangeEmail.querySelector('[type="submit"]').disabled = true;
	var user = firebase.auth().currentUser;
	var credentials = firebase.auth.EmailAuthProvider.credential(
		user.email,
		document.getElementById('ChangeEmailInput').value
	);
	user.reauthenticateWithCredential(credentials).then(function () {
		ChangeEmailDialogue.close();
		firebase.auth().currentUser.updateEmail(document.querySelector('#PE-Email').value).then(function () {
			firebase.app().firestore().collection("users").doc(profileId).set({
				email: document.querySelector('#PE-Email').value
			}, { merge: true }).then(function () { location.reload(); });
		});
	}).catch(function (error) {
		if (error.code == "auth/wrong-password") {
			document.getElementById("ChangeEmailInput").setCustomValidity("Wrong Password!");
			document.getElementById("ChangeEmailInput").reportValidity();
			FormChangeEmail.querySelector('[type="submit"]').disabled = false;
		}
	});

} var FormChangeEmail = document.getElementById('ChangeEmailForm'); if (FormChangeEmail.attachEvent) { FormChangeEmail.attachEvent("submit", ChangeEmail); } else { FormChangeEmail.addEventListener("submit", ChangeEmail); }
document.getElementById('ChangeEmailInput').addEventListener("input", function (event) { document.getElementById("ChangeEmailInput").setCustomValidity(""); });
