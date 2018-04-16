//Archivedelete Folder Handling
const ArchivedeleteFolderDialogue = new mdc.dialog.MDCDialog(document.querySelector('#archivedelete-folder-dialog'));
var folderDeleting = "";
function archivedeleteFolder(folder) { FormArchivedeleteFolder.querySelector('[type="submit"]').disabled = false; ArchivedeleteFolderDialogue.show(); folderDeleting = folder; document.getElementById("ArchivedeleteFolderText").innerHTML = 'Are You Sure You Want To Delete ' + folder.substr(FolderNumberPadding) + "?"; } //Open the dialog
document.getElementById('ArchivedeleteFolderCancel').addEventListener('click', function () { ArchivedeleteFolderDialogue.close(); }); //Close the dialog
function submitArchivedeleteFolder(e) {
	if (e.preventDefault) e.preventDefault(); FormArchivedeleteFolder.querySelector('[type="submit"]').disabled = true;
	firebase.app().firestore().collection("PMS-Archived").doc(folderDeleting).delete().then(function (doc) {
		ArchivedeleteFolderDialogue.close();
	});
} var FormArchivedeleteFolder = document.getElementById('ArchivedeleteFolderForm'); if (FormArchivedeleteFolder.attachEvent) { FormArchivedeleteFolder.attachEvent("submit", submitArchivedeleteFolder); } else { FormArchivedeleteFolder.addEventListener("submit", submitArchivedeleteFolder); }
