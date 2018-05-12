//Delete Team Handling

//Init Dialogue
const DeleteTeamDialogue = new mdc.dialog.MDCDialog(document.querySelector('#delete-team-dialog'));
var teamDeleting;

//Open Dialog
function deleteTeam(team) {
	FormDeleteTeam.querySelector('[type="submit"]').disabled = false;
	teamDeleting = team;
	document.querySelector("#DeleteTeamTitle").innerHTML = "Are You Sure You Want To Delete The " + team + " Team?";
	DeleteTeamDialogue.show();
};

//Close the dialog
document.getElementById('DeleteTeamCancel').addEventListener('click', function () { DeleteTeamDialogue.close(); });

//On Submit
function DeleteTeam(e) {
	if (e.preventDefault) e.preventDefault(); FormDeleteTeam.querySelector('[type="submit"]').disabled = true;

	//Delete the doc and close the dialogue
	var firestore = firebase.firestore();
	firestore.collection("Teams").doc(teamDeleting).get().then(function (doc) {
		doc.data().Members.forEach(function (member) {
			deleteTeamFromUser(teamDeleting, member);
		});

		firestore.collection("Teams").doc(teamDeleting).delete()
		.then(function () {
			DeleteTeamDialogue.close();
		});
	});
}

function deleteTeamFromUser(team, member) {
	var firestore = firebase.firestore();
	firestore.runTransaction(t => {
		return t.get(firestore.collection("users").doc(member))
			.then(doc => {
				var newTeams = doc.data().teams;
				newTeams.remove(team);
				t.update(firestore.collection("users").doc(member), { teams: newTeams });
			});
	});
}

//Submit Handling
var FormDeleteTeam = document.getElementById('DeleteTeamForm'); if (FormDeleteTeam.attachEvent) { FormDeleteTeam.attachEvent("submit", DeleteTeam); } else { FormDeleteTeam.addEventListener("submit", DeleteTeam); }