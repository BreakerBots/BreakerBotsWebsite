//Delete Folder Handling
const DeleteFolderDialogue = new mdc.dialog.MDCDialog(document.querySelector('#delete-folder-dialog'));
var folderDeleting = "";
function deleteFolder(folder) { FormDeleteFolder.querySelector('[type="submit"]').disabled = false; DeleteFolderDialogue.show(); folderDeleting = folder; document.getElementById("DeleteFolderText").innerHTML = 'Are You Sure You Want To Delete ' + folder.substr(FolderNumberPadding) + "?"; } //Open the dialog
document.getElementById('DeleteFolderCancel').addEventListener('click', function () { DeleteFolderDialogue.close(); }); //Close the dialog
function submitDeleteFolder(e) {
	if (e.preventDefault) e.preventDefault(); FormDeleteFolder.querySelector('[type="submit"]').disabled = true;
	firebase.app().firestore().collection("PMS").doc(folderDeleting).delete().then(function (doc) {
		DeleteFolderDialogue.close();
	});
} var FormDeleteFolder = document.getElementById('DeleteFolderForm'); if (FormDeleteFolder.attachEvent) { FormDeleteFolder.attachEvent("submit", submitDeleteFolder); } else { FormDeleteFolder.addEventListener("submit", submitDeleteFolder); }
