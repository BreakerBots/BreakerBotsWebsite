//Account Handling
var authLoaded = {
	aInternal: false,
	aListener: function (val) { },
	set a(val) {
		this.aInternal = val;
		if (val == true) this.aListener();
	},
	get a() {
		return this.aInternal;
	},
	wait: function (listener) {
		this.aListener = listener;
		if (this.aInternal) this.aListener();
	}
};

function logout() { firebase.auth().signOut(); }

document.addEventListener('DOMContentLoaded', function () {
	firebase.auth().onAuthStateChanged(function (user) {
		authLoaded.a = true;
		if (user) { //Set the page names to the username of the user signed in
			document.getElementById("UserNameL").innerHTML = user.displayName;
			document.getElementById("UserNameR").innerHTML = user.displayName;
		} else { //If not signed in reroute to public page
			window.open('../index.html', '_self', false);
		}
	});
});