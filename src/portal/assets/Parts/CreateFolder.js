//Create Folder Handling
const CreateFolderDialogue = new mdc.dialog.MDCDialog(document.querySelector('#create-folder-dialog'));
document.getElementById('AddFolderFab').addEventListener('click', function () { FormCreateFolder.querySelector('[type="submit"]').disabled = false; CreateFolderDialogue.show(); document.getElementById('CreateFolderInput').value = ""; }); //Open the dialog
document.getElementById('CreateFolderCancel').addEventListener('click', function () { CreateFolderDialogue.close(); }); //Close the dialog
function CreateFolder(e) {
	if (e.preventDefault) e.preventDefault(); FormCreateFolder.querySelector('[type="submit"]').disabled = true;
	var folderName = document.getElementById('CreateFolderInput').value;
	firebase.app().firestore().collection("PMS").get().then((querySnapshot) => {
		var FolderExists = false;
		querySnapshot.forEach((doc) => {
			if (doc.id.substr(FolderNumberPadding) == folderName) { FolderExists = true; }
		});
		if (FolderExists) {
			document.getElementById("CreateFolderInput").setCustomValidity("This folder already exists!");
			document.getElementById("CreateFolderInput").reportValidity();
			FormCreateFolder.querySelector('[type="submit"]').disabled = false;
		} else {
			if (querySnapshot.docs.length > 0) { folderName = (FolderNumberPad(Number(querySnapshot.docs[querySnapshot.docs.length - 1].id.substring(0, 4)) + 1)) + folderName; } else { folderName = FolderNumberPad(0) + folderName; }
			firebase.app().firestore().collection("PMS").doc(folderName).set({ History: { 0: { User: users.getCurrentUid(), Change: "Created This Project, " + folderName.substr(FolderNumberPadding), Date: new Date().getTime() } }, index: 0 })
				.then(function () {
					CreateFolderDialogue.close();
				});
		}
	});
} var FormCreateFolder = document.getElementById('CreateFolderForm'); if (FormCreateFolder.attachEvent) { FormCreateFolder.attachEvent("submit", CreateFolder); } else { FormCreateFolder.addEventListener("submit", CreateFolder); }
document.getElementById('CreateFolderInput').addEventListener("input", function (event) { document.getElementById("CreateFolderInput").setCustomValidity(""); });

//The Naming Sceme For the Folders To Support 1000 Folder Sorting, Converts 1 to 0001.
var FolderNumberPadding = 4;
function FolderNumberPad(num) { return ('000' + num).slice(-4) }
