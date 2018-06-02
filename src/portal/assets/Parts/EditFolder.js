//Edit Folder Handling
const EditFolderDialogue = new mdc.dialog.MDCDialog(document.querySelector('#edit-folder-dialog'));
var folderEditing = "";
function editFolder(folder) { FormEditFolder.querySelector('[type="submit"]').disabled = false; EditFolderDialogue.show(); folderEditing = folder; document.getElementById('EditFolderInput').value = folder.substr(FolderNumberPadding); } //Open the dialog
document.getElementById('EditFolderCancel').addEventListener('click', function () { EditFolderDialogue.close(); }); //Close the dialog
function submitEditFolder(e) {
	if (e.preventDefault) e.preventDefault();
	FormEditFolder.querySelector('[type="submit"]').disabled = true;
	const folderName = document.getElementById('EditFolderInput').value;

	if (folderName != folderEditing.substr(FolderNumberPadding)) {
		firebase.app().firestore().collection("PMS").get().then((querySnapshot) => {
			var FolderExists = false;
			querySnapshot.forEach((doc) => {
				if (doc.id.substr(FolderNumberPadding) == folderName) { FolderExists = true; }
			});
			if (FolderExists) {
				document.getElementById("EditFolderInput").setCustomValidity("This folder already exists!");
				document.getElementById("EditFolderInput").reportValidity();
				FormEditFolder.querySelector('[type="submit"]').disabled = false;
			} else {
				firebase.app().firestore().collection("PMS").doc(folderEditing).get().then(function (doc) {
					var savedFolder = doc.data(); //Copy The Data

					firebase.app().firestore().collection("PMS").doc(folderEditing).delete().then(function (doc) { //Delete The Folder
						firebase.app().firestore().collection("PMS").doc(folderEditing.substr(0, FolderNumberPadding) + folderName).set(savedFolder) //Then Create The Renamed Folder and Move The Paste The Data
							.then(function () {
								EditFolderDialogue.close();

								firebase.app().firestore().collection("PMS").doc(folderEditing.substr(0, FolderNumberPadding) + folderName).get().then(function (doc) {
									var json = {};
									var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = { User: users.getCurrentUid(), Change: "Renamed the project from " + folderEditing.substr(FolderNumberPadding) + " to " + folderName, Date: new Date().getTime() };
									json["History"] = Object.assign(doc.data().History, addedHistory);
									firebase.app().firestore().collection("PMS").doc(folderEditing.substr(0, FolderNumberPadding) + folderName).update(json);
								});
							});
					});
				});
			}
		});
	} else {
		EditFolderDialogue.close();
	}
}
var FormEditFolder = document.getElementById('EditFolderForm'); if (FormEditFolder.attachEvent) { FormEditFolder.attachEvent("submit", submitEditFolder); } else { FormEditFolder.addEventListener("submit", submitEditFolder); }
document.getElementById('EditFolderInput').addEventListener("input", function (event) { document.getElementById("EditFolderInput").setCustomValidity(""); });
