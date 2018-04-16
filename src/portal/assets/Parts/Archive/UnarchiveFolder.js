//Unarchive Folder Handling
const UnarchiveFolderDialogue = new mdc.dialog.MDCDialog(document.querySelector('#unarchive-folder-dialog'));
var folderUnarchiving = "";
function unarchiveFolder(folder) { FormUnarchiveFolder.querySelector('[type="submit"]').disabled = false; UnarchiveFolderDialogue.show(); folderUnarchiving = folder; document.getElementById("UnarchiveFolderText").innerHTML = 'Are You Sure You Want To Unarchive ' + folder.substr(FolderNumberPadding) + "?"; } //Open the dialog
document.getElementById('UnarchiveFolderCancel').addEventListener('click', function () { UnarchiveFolderDialogue.close(); }); //Close the dialog
function submitUnarchiveFolder(e) {
	if (e.preventDefault) e.preventDefault(); FormUnarchiveFolder.querySelector('[type="submit"]').disabled = true;

	firebase.app().firestore().collection("PMS").get().then((querySnapshot) => {
		var FolderExists = false;
		querySnapshot.forEach((doc) => {
			if (doc.id.substr(FolderNumberPadding) == folderUnarchiving) { FolderExists = true; }
		});
		if (FolderExists) {
			//document.getElementById("EditFolderInput").setCustomValidity("This folder already exists!");
			//document.getElementById("EditFolderInput").reportValidity();
			alert("FOLDER EXISTS!!!!!");
			FormEditFolder.querySelector('[type="submit"]').disabled = false;
		} else {
			firebase.app().firestore().collection("PMS-Archived").doc(folderUnarchiving).get().then(function (doc) {
				var savedFolder = doc.data(); //Copy The Data

				firebase.app().firestore().collection("PMS-Archived").doc(folderUnarchiving).delete().then(function (doc) { //Delete The Folder
					firebase.app().firestore().collection("PMS").doc(folderUnarchiving).set(savedFolder) //Then Recreate The Folder In The Unarchived Database
						.then(function () {
							UnarchiveFolderDialogue.close();

							firebase.app().firestore().collection("PMS").doc(folderUnarchiving).get().then(function (doc) {
								var json = {};
								var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = { User: firebase.auth().currentUser.displayName, Change: "Unarchived The Project", Date: new Date().getTime() };
								json["History"] = Object.assign(doc.data().History, addedHistory);
								firebase.app().firestore().collection("PMS").doc(folderUnarchiving).update(json);
							});
						});
				});
			});
		}
	});

} var FormUnarchiveFolder = document.getElementById('UnarchiveFolderForm'); if (FormUnarchiveFolder.attachEvent) { FormUnarchiveFolder.attachEvent("submit", submitUnarchiveFolder); } else { FormUnarchiveFolder.addEventListener("submit", submitUnarchiveFolder); }
