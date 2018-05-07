//Archive Folder Handling
const ArchiveFolderDialogue = new mdc.dialog.MDCDialog(document.querySelector('#archive-folder-dialog'));
var folderArchiving = "";
function archiveFolder(folder) { FormArchiveFolder.querySelector('[type="submit"]').disabled = false; ArchiveFolderDialogue.show(); folderArchiving = folder; document.getElementById("ArchiveFolderText").innerHTML = 'Are You Sure You Want To Archive ' + folder.substr(FolderNumberPadding) + "?"; } //Open the dialog
document.getElementById('ArchiveFolderCancel').addEventListener('click', function () { ArchiveFolderDialogue.close(); }); //Close the dialog
function submitArchiveFolder(e) {
	if (e.preventDefault) e.preventDefault(); FormArchiveFolder.querySelector('[type="submit"]').disabled = true;

	firebase.app().firestore().collection("PMS-Archived").get().then((querySnapshot) => {
		var FolderExists = false;
		querySnapshot.forEach((doc) => {
			if (doc.id.substr(FolderNumberPadding) == folderArchiving) { FolderExists = true; }
		});
		if (FolderExists) {
			//document.getElementById("EditFolderInput").setCustomValidity("This folder already exists!");
			//document.getElementById("EditFolderInput").reportValidity();
			alert("FOLDER EXISTS!!!!!");
			FormEditFolder.querySelector('[type="submit"]').disabled = false;
		} else {
			firebase.app().firestore().collection("PMS").doc(folderArchiving).get().then(function (doc) {
				var savedFolder = doc.data(); //Copy The Data

				firebase.app().firestore().collection("PMS").doc(folderArchiving).delete().then(function (doc) { //Delete The Folder
					firebase.app().firestore().collection("PMS-Archived").doc(folderArchiving).set(savedFolder) //Then Recreate The Folder In The Archived Database
						.then(function () {
							ArchiveFolderDialogue.close();

							firebase.app().firestore().collection("PMS-Archived").doc(folderArchiving).get().then(function (doc) {
								var json = {};
								var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = { User: users.getCurrentUid(), Change: "Archived The Project", Date: new Date().getTime() };
								json["History"] = Object.assign(doc.data().History, addedHistory);
								firebase.app().firestore().collection("PMS-Archived").doc(folderArchiving).update(json);
							});
						});
				});
			});
		}
	});

} var FormArchiveFolder = document.getElementById('ArchiveFolderForm'); if (FormArchiveFolder.attachEvent) { FormArchiveFolder.attachEvent("submit", submitArchiveFolder); } else { FormArchiveFolder.addEventListener("submit", submitArchiveFolder); }
