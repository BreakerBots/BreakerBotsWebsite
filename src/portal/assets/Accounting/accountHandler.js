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
		if (user) {
			firebase.app().firestore().collection("Clearance").doc(user.uid).get().then(function (doc) {
				var ud = doc.data();
				if (!ud)
					window.open('unverified.html', '_self', false);
			});
		} else { //If not signed in reroute to signin
			window.open('enter.html', '_self', false);
		}
	});
	firebase.auth().addAuthTokenListener(function (a) {
		//console.log('err', a);
	});
});

//All User
var allUsers = {};
document.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("users").onSnapshot(function (snapshot) {
		snapshot.docs.lforEach(function (doc, last) {
			allUsers[doc.id] = doc.data();
			getAvatarUrl(doc.id, function (url, rem) {
				allUsers[doc.id].avatar = url;
				if (rem) authLoadedFullVal = true; //Notify Long Wait Events
			}, last);
		});
		authLoadedVal = true; //Notify Wait Events
	});

	firebase.app().firestore().collection("Clearance").onSnapshot(function (snapshot) {
		snapshot.docs.lforEach(function (doc, last) {
			allUsers[doc.id].clearance = doc.data().a;
		});
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

const users = {
	getUsername: function (Uid) { try {
		return allUsers[Uid].username;
	} catch (err) { return; } },
	getUid: function (Username) { try {
		return Object.keys(allUsers).find(key => allUsers[key].username === Username);
	} catch (err) { return; } },
	getAvatar: function (uid) { try {
		return allUsers[uid].avatar;
	} catch (err) { return "../assets/img/iconT.png"; } },
	getUser: function (uid) { try {
		return allUsers[uid];
	} catch (err) { return; } },
	getCurrentUser: function () { try {
		return allUsers[firebase.auth().currentUser.uid];
	} catch (err) { return; } },
	getCurrentUid: function () { try {
		return firebase.auth().currentUser.uid;
	} catch (err) { return; } },
	getCurrentUsername: function () { try {
		return firebase.auth().currentUser.displayName;
	} catch (err) { return; } },
	getCurrentClearance: function () { try {
		return Number(allUsers[firebase.auth().currentUser.uid].clearance);
	} catch (err) { return 0; } },
	isUsername: function (Username) { try {
		return Object.keys(allUsers).find(key => allUsers[key].username === Username) != undefined;
	} catch (err) { return false; } },
	isUid: function (Uid) { try {
		return allUsers.hasOwnProperty(Uid);
	} catch (err) { return false; } }
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