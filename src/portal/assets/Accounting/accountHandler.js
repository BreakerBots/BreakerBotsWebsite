//Account Handling
function logout() { firebase.auth().signOut(); }
document.addEventListener('DOMContentLoaded', function () {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) { //Set the page names to the username of the user signed in
			document.getElementById("UserNameL").innerHTML = user.displayName;
			document.getElementById("UserNameR").innerHTML = user.displayName;
		} else { //If not signed in reroute to public page
			window.open('../index.html', '_self', false);
		}
	});
});