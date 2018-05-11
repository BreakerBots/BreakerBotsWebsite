//Delete Team Handling

//Init Dialogue
const EditTeamDialogue = new mdc.dialog.MDCDialog(document.querySelector('#edit-team-dialog'));
initAutoResizeTextArea(document.getElementById('EditTeamDesc'));
var teamEditing;

//Open Dialog
function editTeam(team, desc) {
	FormEditTeam.querySelector('[type="submit"]').disabled = false;
	teamEditing = team;
	document.getElementById('EditTeamName').value = team;
	document.getElementById('EditTeamDesc').value = desc;
	EditTeamDialogue.show();
};

//Close the dialog
document.getElementById('EditTeamCancel').addEventListener('click', function () { EditTeamDialogue.close(); });

//On Submit
function EditTeam(e) {
	if (e.preventDefault) e.preventDefault(); FormEditTeam.querySelector('[type="submit"]').disabled = true;

	var teamName = document.getElementById('EditTeamName').value;
	var teamDesc = document.getElementById('EditTeamDesc').value;

	//First Update The Desc
	var firestore = firebase.app().firestore();
	firestore.collection("Teams").doc(teamEditing).set({
		Desc: teamDesc
	}, { merge: true }).then(function () {

		//Then Change Name If Need To
		if (teamEditing != teamName) {
			//Make sure not renaming to existing team
			firestore.collection("Teams").doc(teamName).get().then(function (doc) {
				//Doesn't Exist
				if (!doc.exists) {
					//Get The Data
					firestore.collection("Teams").doc(teamEditing).get().then(function (doc) {
						//Copy The Data
						var copiedData = doc.data();

						//Delete The Doc
						firestore.collection("Teams").doc(teamEditing).delete().then(function () {
							//Paste The Data Into a New Doc With New Name
							firestore.collection("Teams").doc(teamName).set(copiedData);
						});
					});
				}
				//Does Exist
				else {
					//Throw A Text Error Over Name
					document.getElementById("EditTeamName").setCustomValidity("This team already exists!");
					document.getElementById("EditTeamName").reportValidity();
					FormEditTeam.querySelector('[type="submit"]').disabled = false;
				}
			});
		}
	});
}

//Submit Handling
var FormEditTeam = document.getElementById('EditTeamForm'); if (FormEditTeam.attachEvent) { FormEditTeam.attachEvent("submit", EditTeam); } else { FormEditTeam.addEventListener("submit", EditTeam); }

document.getElementById('EditTeamName').addEventListener("input", function (event) { document.getElementById("EditTeamName").setCustomValidity(""); });
