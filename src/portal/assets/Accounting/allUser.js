//All User

var allUsers = { uids: {}, names: {} };

document.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("users")
		.onSnapshot(function (snapshot) {
			snapshot.forEach((doc) => {
				allUsers.uids[doc.id] = doc.data().username;
				allUsers.names[doc.data().username] = doc.id;
			});
		});
});

var users =  {
	getUsername: function (Uid) { return allUsers.uids[Uid]; },
	getUid: function (Username) { return allUsers.names[Username]; },
	getCurrentUid: function () { return firebase.auth().currentUser.uid; },
	getCurrentUsername: function () { return firebase.auth().currentUser.displayName; },
	isUsername: function (Username) { return allUsers.names.hasOwnProperty(Username); },
	isUid: function (Uid) { return allUsers.uids.hasOwnProperty(Uid); }
};