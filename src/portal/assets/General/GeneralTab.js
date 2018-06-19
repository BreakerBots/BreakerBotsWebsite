//GeneralTab.js

var GeneralTab = new RegisteredTab("General");




// Temporary time display
var SSSnap;
window.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("SS").onSnapshot(function (snapshot) {
		SSSnap = snapshot;
		var html = '';

		for (var i = 0; i < snapshot.docs.length; i++) {
			var data = snapshot.docs[i].data();
			html += `
			<tr>
				<td>` + data.name + `</td>
				<td>` + (data.history.length % 2 != 0 ? "In" : "Out") + `</td>
				<td>` + SSFindTotalHours(data.history) + `</td>
			</tr>
			`;
		}

		document.querySelector('#SISOTable').innerHTML = html;
	});
});

function SSFindTotalHours(a) {
	var totalMinutes = 0;
	for (var i = 0; i < a.length; i += 2) {
		totalMinutes += Math.round(((a[i + 1] || new Date()).getTime() - a[i].getTime()) / 1000 / 60);
	}
	return Math.floor(totalMinutes / 60) + "h " + Math.floor(totalMinutes % 60) + "m";
}

function SSSignAllOut() {
	var batch = firebase.app().firestore().batch();
	if (SSSnap) {
		for (var i = 0; i < SSSnap.docs.length; i++) {
			var data = SSSnap.docs[i].data();
			if (data.history.length % 2 != 0) {
				data.history.push(new Date);
				batch.set(firebase.app().firestore().collection("SS").doc(SSSnap.docs[i].id), data);
			}
		}
	}
	batch.commit().then(function () {
		alert("Data Written");
	});
}