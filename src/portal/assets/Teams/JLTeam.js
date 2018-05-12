// <!-- Join and Leave Teams -->
function joinTeam(team) {
	authLoadedFullWait(function () { //Confirm Login
		//Disable the button to prevent double click
		event.srcElement.disabled = true;

		//Add Team to Member Collection
		firebase.app().firestore().collection("users").doc(users.getCurrentUid()).get().then(function (doc) {
			var newData = doc.data();
			newData.teams.push(team);
			firebase.app().firestore().collection("users").doc(users.getCurrentUid()).set(newData).then(function () {
				//Then Add Member To Team Collection
				firebase.app().firestore().collection("Teams").doc(team).get().then(function (doc) {
					var newData = doc.data();
					newData.Members.push(users.getCurrentUid());
					newData.NOM = newData.Members.length;
					firebase.app().firestore().collection("Teams").doc(team).set(newData).then(function () {

					});
				});
			});
		});
	});
}

function leaveTeam(team) {
	authLoadedFullWait(function () { //Confirm login
		//Disable the button to prevent double click
		event.srcElement.disabled = true;

		//Add Team to Member Collection
		firebase.app().firestore().collection("users").doc(users.getCurrentUid()).get().then(function (doc) {
			var newData = doc.data();
			newData.teams.remove(team);
			firebase.app().firestore().collection("users").doc(users.getCurrentUid()).set(newData).then(function () {
				//Then Add Member To Team Collection
				firebase.app().firestore().collection("Teams").doc(team).get().then(function (doc) {
					var newData = doc.data();
					newData.Members.remove(users.getCurrentUid());
					newData.NOM = newData.Members.length;
					firebase.app().firestore().collection("Teams").doc(team).set(newData).then(function () {

					});
				});
			});
		});
	});
}