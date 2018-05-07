//Delete Part Handling
const DeletePartDialogue = new mdc.dialog.MDCDialog(document.querySelector('#delete-part-dialog'));
var partDeleting = ""; var partFolderDeleting = ""; var partDeletingName = ""; var partDeletingAmount = ""; var partDeletingDesc = "";
function deletePart(folder, part, partName, partAmount, partDesc) { FormDeletePart.querySelector('[type="submit"]').disabled = false; DeletePartDialogue.show(); partFolderDeleting = folder; partDeleting = part; document.getElementById("DeletePartText").innerHTML = "Are You Sure You Want To Remove The " + partAmount + " " + partName + (partAmount > 1 ? "s" : "") + (partDeletingDesc == "" ? "" : " for " + partDeletingDesc) + " from " + folder.substr(FolderNumberPadding) + "?"; partDeletingName = partName; partDeletingAmount = partAmount; partDeletingDesc = partDesc; } //Open the dialog
document.getElementById('DeletePartCancel').addEventListener('click', function () { DeletePartDialogue.close(); }); //Close the dialog
function submitDeletePart(e) {
	if (e.preventDefault) e.preventDefault(); FormDeletePart.querySelector('[type="submit"]').disabled = true;

	firebase.app().firestore().collection("PMS").doc(partFolderDeleting).get()
		.then(function (doc) {
			var json = doc.data();

			delete json[partDeleting];

			firebase.app().firestore().collection("PMS").doc(partFolderDeleting).set(json).then(function () {
				DeletePartDialogue.close();

				var json = {};
				var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = { User: users.getCurrentUid(), Change: "Deleted the " + partDeletingAmount + " " + partDeletingName + (partDeletingAmount > 1 ? "s" : "") + (partDeletingDesc == "" ? "" : " for " + partDeletingDesc), Date: new Date().getTime() };
				json["History"] = Object.assign(doc.data().History, addedHistory);
				firebase.app().firestore().collection("PMS").doc(partFolderDeleting).update(json);
			});
		});
} var FormDeletePart = document.getElementById('DeletePartForm'); if (FormDeletePart.attachEvent) { FormDeletePart.attachEvent("submit", submitDeletePart); } else { FormDeletePart.addEventListener("submit", submitDeletePart); }
