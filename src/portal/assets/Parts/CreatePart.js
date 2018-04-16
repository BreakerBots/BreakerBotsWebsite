//Create Part Handling
const CreatePartDialogue = new mdc.dialog.MDCDialog(document.querySelector('#create-part-dialog'));
var addingPartTo = "Ref";
function openCreatePartDialogue(from) {
	CreatePartDialogue.show();
	addingPartTo = from.id;
	document.getElementById('CreatePartInput').value = "";
	document.getElementById('CreatePartInputU').value = "Low";
	document.getElementById('CreatePartInputQ').value = "1";
	document.getElementById('CreatePartInputP').value = "";
	document.getElementById('CreatePartInputD').value = "";
	document.getElementById('CreatePartInputUrl').value = "";
	FormCreatePart.querySelector('[type="submit"]').disabled = false;
} //Open the dialog
document.getElementById('CreatePartCancel').addEventListener('click', function () { CreatePartDialogue.close(); }); //Close the dialog
function CreatePart(e) {
	if (e.preventDefault) e.preventDefault(); FormCreatePart.querySelector('[type="submit"]').disabled = true;

	const partName = document.getElementById('CreatePartInput').value;
	const partUr = document.getElementById('CreatePartInputU').value;
	const partQu = document.getElementById('CreatePartInputQ').value;
	const partPr = document.getElementById('CreatePartInputP').value;
	const partDe = document.getElementById('CreatePartInputD').value;
	var partUrl = document.getElementById('CreatePartInputUrl').value; if (!partUrl.match(/^[a-zA-Z]+:\/\//)) { partUrl = 'http://' + partUrl; }
	firebase.app().firestore().collection("PMS").doc(addingPartTo).get().then(function (doc) {
		var currentIndex = (doc.data().index + ":" + Math.random().toString(36).substring(3));
		var json = { index: (doc.data().index + 1) };
		json[currentIndex] = {
			name: partName,
			desc: partDe,
			urgency: partUr,
			quantity: partQu,
			priceper: partPr,
			url: partUrl,
			status: "No",
			createdBy: firebase.auth().currentUser.uid
		};
		var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = { User: firebase.auth().currentUser.displayName, Change: "Added " + partQu + " " + partName + (partQu > 1 ? "s" : "") + (partDe == "" ? "" : " for " + partDe), Date: new Date().getTime() };
		json["History"] = Object.assign(doc.data().History, addedHistory);

		firebase.app().firestore().collection("PMS").doc(addingPartTo).update(json)
			.then(function () {
				CreatePartDialogue.close();

				addPartToAutocomplete(partName, partPr, partUrl);
			});
	});

} var FormCreatePart = document.getElementById('CreatePartForm'); if (FormCreatePart.attachEvent) { FormCreatePart.attachEvent("submit", CreatePart); } else { FormCreatePart.addEventListener("submit", CreatePart); }

