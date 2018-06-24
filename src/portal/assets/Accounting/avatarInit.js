//Avatar Init

//Called when app is ready
function DrawHeaderData() {
	//Load the avatar from cache origionally, then when auth
	//finally loads load it's image and cache it for next time
	if (localStorage.avatar) document.querySelector('#AvatarPicture').src = localStorage.avatar;
	if (localStorage.avatar) document.querySelector('#profileMenu-Avatar').src = localStorage.avatar;
	if (localStorage.username) document.querySelector('#profileMenu-Name').innerHTML = localStorage.username;
	if (localStorage.userrole) document.querySelector('#profileMenu-Role').innerHTML = localStorage.userrole;

	window.addEventListener('DOMContentLoaded', function () {
		function FillInData() {
			if (firebase.auth().currentUser) {
				firebase.app().firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then(function (user) {
					//Fill in data
					document.querySelector('#profileMenu-Name').innerHTML = user.data().username;
					document.querySelector('#profileMenu-Role').innerHTML = user.data().role || "Member";

					//Cache data for a quick load next time
					localStorage.username = user.data().username;
					localStorage.userrole = user.data().role || "Member";
				});
				var gauA = false;
				getAvatarUrl(firebase.auth().currentUser.uid, function (img) {
					if (!gauA) {
						gauA = true;
						//Set the avatar to the recieved download url
						document.querySelector('#AvatarPicture').src = img;
						document.querySelector('#profileMenu-Avatar').src = img;

						//Cache the downloaded image for quick load next time
						localStorage.avatar = img;
					}
				});
			}
			else
				setTimeout(FillInData, 500);
		} FillInData();
	});

	/*
		
		
	 */
} DrawHeaderData();

function HardRefreshHeaderAvatar() {
	getAvatarUrl(users.getCurrentUid(), function (img) {
		if (img) {
			document.querySelector('#AvatarPicture').src = img;
			document.querySelector('#profileMenu-Avatar').src = img;
			localStorage.avatar = img;
		}
	});
}