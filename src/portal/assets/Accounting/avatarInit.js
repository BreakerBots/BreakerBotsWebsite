//Avatar Init

//Called when app is ready
function throwInAvatar() {
	//Load the avatar from cache origionally, then when auth
	//finally loads load it's image and cache it for next time
	if (localStorage.avatar) document.querySelector('#AvatarPicture').src = localStorage.avatar;
	if (localStorage.avatar) document.querySelector('#profileMenu-Avatar').src = localStorage.avatar;
	if (localStorage.username) document.querySelector('#profileMenu-Name').innerHTML = localStorage.username;
	if (localStorage.userrole) document.querySelector('#profileMenu-Role').innerHTML = localStorage.userrole;

	//Wait until AllUser is loaded
	authLoadedFullWait(function () {
		function SAAFR() {
			//Prevent undefined error throwing
			if (users.getCurrentUid() != undefined && (users.getCurrentUid() != undefined ? (users.getAvatar(users.getCurrentUid()) != undefined) : false)) {
				//Set the avatar to the recieved download url
				document.querySelector('#AvatarPicture').src = users.getAvatar(users.getCurrentUid());
				document.querySelector('#profileMenu-Avatar').src = users.getAvatar(users.getCurrentUid());
				document.querySelector('#profileMenu-Name').innerHTML = users.getCurrentUser().username;
				document.querySelector('#profileMenu-Role').innerHTML = users.getCurrentUser().role;

				//Cache the downloaded image for quick load
				localStorage.avatar = users.getAvatar(users.getCurrentUid());
				localStorage.username = users.getCurrentUser().username;
				localStorage.userrole = users.getCurrentUser().role;
			} else {
				//Restart this in a second if there is an error
				setTimeout(SAAFR, 1000);
			}
		} SAAFR();
	});
} throwInAvatar();