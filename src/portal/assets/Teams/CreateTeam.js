//Create Team Handling

//Init Dialogue
const CreateTeamDialogue = new mdc.dialog.MDCDialog(document.querySelector('#create-team-dialog'));
initAutoResizeTextArea(document.getElementById('CreateTeamDesc'));

//Open Dialog
document.getElementById('AddTeamFab').addEventListener('click', function () {
	FormCreateTeam.querySelector('[type="submit"]').disabled = false;
	CreateTeamDialogue.show();
	document.getElementById('CreateTeamName').value = "";
	document.getElementById('CreateTeamDesc').value = "";
});

//Close the dialog
document.getElementById('CreateTeamCancel').addEventListener('click', function () { CreateTeamDialogue.close(); });

//On Submit
function CreateTeam(e) {
	if (e.preventDefault) e.preventDefault(); FormCreateTeam.querySelector('[type="submit"]').disabled = true;
	var teamName = document.getElementById('CreateTeamName').value;
	var teamDesc = document.getElementById('CreateTeamDesc').value;

	//Make sure a team with that name doesn't already exist
	var firestore = firebase.app().firestore();
	firestore.collection("Teams").doc(teamName).get().then(function (doc) {
		//Doesn't Exists
		if (!doc.exists) {
			//Create a new folder with name, desc and no members
			firestore.collection("Teams").doc(teamName).set({
				Desc: teamDesc,
				Members: [],
				NOM: 0
			}).then(function () {
				//Close the dialogue, as it is done
				CreateTeamDialogue.close();
			});
		}
		//Does Exists
		else {
			//Throw A Text Error Over Name
			document.getElementById("CreateTeamName").setCustomValidity("This team already exists!");
			document.getElementById("CreateTeamName").reportValidity();
			FormCreateTeam.querySelector('[type="submit"]').disabled = false;
		}
	});
}

//Submit Handling
var FormCreateTeam = document.getElementById('CreateTeamForm'); if (FormCreateTeam.attachEvent) { FormCreateTeam.attachEvent("submit", CreateTeam); } else { FormCreateTeam.addEventListener("submit", CreateTeam); }

document.getElementById('CreateTeamName').addEventListener("input", function (event) { document.getElementById("CreateTeamName").setCustomValidity(""); });
