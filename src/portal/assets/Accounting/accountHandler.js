//Account Handling:

//Auth Loaded Waiter
var authLoadedVal = false; var authLoadedFullVal = false;
function authLoadedWait(func) {
	function ALCheck() {
		if (authLoadedVal) { func(); return; }
		else { setTimeout(ALCheck, 1000); }
	} ALCheck();
}
function authLoadedFullWait(func) {
	function ALCheck() {
		if (authLoadedFullVal) { func(); return; }
		else { setTimeout(ALCheck, 1000); }
	} ALCheck();
}

//Rerouting and setting names on header
document.addEventListener('DOMContentLoaded', function () {
	firebase.auth().onAuthStateChanged(function (user) {
		//console.log(user);
		if (user) { //Set the page names to the username of the user signed in

		} else { //If not signed in reroute to public page
			window.open('../index.html', '_self', false);
		}
	});
	firebase.auth().addAuthTokenListener(function (a) {
		//console.log('err', a);
	});
});

//All User
var allUsers = {};
document.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("users").get().then(function (snapshot) {
		snapshot.docs.lforEach(function (doc, last) {
			allUsers[doc.id] = doc.data();
			getAvatarUrl(doc.id, function (url, rem) {
				allUsers[doc.id].avatar = url;
				if (rem) authLoadedFullVal = true; //Notify Long Wait Events
			}, last);
		});
		authLoadedVal = true; //Notify Wait Events
	});

	//Update data on user profile updates
	var SUUC = false;
	firebase.app().firestore().collection("users")
		.onSnapshot(function (snapshot) {
			if (SUUC) {
				snapshot.docs.forEach(function (doc) {
					allUsers[doc.id] = doc.data();
					getAvatarUrl(doc.id, function (url) {
						allUsers[doc.id].avatar = url;
					});
				});
			} else { SUUC = true; }
		});
});

const masterAdminLevel = 10; const adminLevel = 5;
var users = {
	getUsername: function (Uid) { return allUsers[Uid].username; },
	getUid: function (Username) { return Object.keys(allUsers).find(key => allUsers[key].username === Username); },
	getAvatar: function (uid) { return allUsers[uid].avatar; },
	getUser: function (uid) { return allUsers[uid]; },
	getCurrentUser: function () { return allUsers[firebase.auth().currentUser.uid]; },
	getCurrentUid: function () { return firebase.auth().currentUser.uid; },
	getCurrentUsername: function () { return firebase.auth().currentUser.displayName; },
	getCurrentClearance: function () { return allUsers[firebase.auth().currentUser.uid].clearance; },
	amAdmin: function () { return this.getCurrentClearance() >= adminLevel; },
	amMasterAdmin: function () { return this.getCurrentClearance() >= masterAdminLevel; },
	isUsername: function (Username) { return Object.keys(allUsers).find(key => allUsers[key].username === Username) != undefined; },
	isUid: function (Uid) { return allUsers.hasOwnProperty(Uid); }
};
//



//Resources

//For Each Loop With Last Iteration Notification
Array.prototype.lforEach = function (callback, thisArg) { for (var i = 0; i < this.length; i++) { if (i in this) { callback.call(thisArg, this[i], i == this.length - 1); } } };

//Get Avatar Url Through Callback
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