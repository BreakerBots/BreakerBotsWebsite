//Edit Part Handling
const EditPartDialogue = new mdc.dialog.MDCDialog(document.querySelector('#edit-part-dialog'));
var editingPartFolder = ""; var editingPart = ""; var editingPartData = {};
function openEditPartDialogue(folder, part) {
	FormEditPart.querySelector('[type="submit"]').disabled = false;
	EditPartDialogue.show();
	editingPartFolder = folder;
	editingPart = part;
	firebase.app().firestore().collection("PMS").doc(editingPartFolder).get().then(function (doc) {
		editingPartData = doc.data()[part];
		document.getElementById('EditPartInput').value = doc.data()[editingPart].name;
		document.getElementById('EditPartInputU').value = doc.data()[editingPart].urgency;
		document.getElementById('EditPartInputQ').value = doc.data()[editingPart].quantity;
		document.getElementById('EditPartInputP').value = doc.data()[editingPart].priceper;
		document.getElementById('EditPartInputD').value = doc.data()[editingPart].desc;
		document.getElementById('EditPartInputUrl').value = (doc.data()[editingPart].url == "http://" ? "" : doc.data()[editingPart].url);
		document.getElementById('EditPartInputUnit').value = doc.data()[editingPart].unit;
		document.getElementById('EditPartInputPN').value = doc.data()[editingPart].partNumber;
	});
} //Open the dialog
document.getElementById('EditPartCancel').addEventListener('click', function () { EditPartDialogue.close(); }); //Close the dialog
function EditPart(e) {
	if (e.preventDefault) e.preventDefault(); FormEditPart.querySelector('[type="submit"]').disabled = true;

	const partName = document.getElementById('EditPartInput').value;
	const partUr = document.getElementById('EditPartInputU').value;
	const partQu = document.getElementById('EditPartInputQ').value;
	const partPr = document.getElementById('EditPartInputP').value;
	const partDe = document.getElementById('EditPartInputD').value;
	var partUrl = document.getElementById('EditPartInputUrl').value; if (!partUrl.match(/^[a-zA-Z]+:\/\//)) { partUrl = 'http://' + partUrl; }
	const partUnit = document.getElementById('EditPartInputUnit').value;
	const partPN = document.getElementById('EditPartInputPN').value;
	firebase.app().firestore().collection("PMS").doc(editingPartFolder).get().then(function (doc) {
		var currentIndex = editingPart;
		var json = { index: (doc.data().index + 1) };
		json[currentIndex] = {
			name: partName,
			desc: partDe,
			urgency: partUr,
			quantity: partQu,
			priceper: partPr,
			url: partUrl,
			partNumber: partPN,
			unit: partUnit
		};
		var EditingChange = []; var nd = editingPartData.name + (editingPartData.desc != "" ? " for " + editingPartData.desc : "");
		if (partName != editingPartData.name || partDe != editingPartData.desc) {
			EditingChange.push("Renamed the " + nd + " to " + partName + " for " + partDe);
		}
		if (partQu != editingPartData.quantity) {
			if (EditingChange.length == 0) {
				EditingChange.push((partQu > editingPartData.quantity ? "Increased" : "Decreased") + " the quantity of the " + nd + " from " + editingPartData.quantity + " to " + partQu);
			}
			else {
				EditingChange.push((partQu > editingPartData.quantity ? "increased" : "decreased") + " the quantity from " + editingPartData.quantity + " to " + partQu);
			}
		}
		if (partPr != editingPartData.priceper) {
			if (EditingChange.length == 0) {
				EditingChange.push((partPr > editingPartData.priceper ? "Increased" : "Decreased") + " the price of the " + nd + " from " + editingPartData.priceper + " to " + partPr);
			}
			else {
				EditingChange.push((partPr > editingPartData.priceper ? "increased" : "decreased") + " the price from " + editingPartData.priceper + " to " + partPr);
			}
		}
		if (partUr != editingPartData.urgency) {
			if (EditingChange.length == 0) {
				EditingChange.push("Marked the " + nd + " as " + ((partUr == "Low" ? 0 : (partUr == "Medium" ? 1 : 2)) > (editingPartData.urgency == "Low" ? 0 : (editingPartData.urgency == "Medium" ? 1 : 2)) ? "More" : "Less") + " important");
			}
			else {
				EditingChange.push("marked it as " + ((partUr == "Low" ? 0 : (partUr == "Medium" ? 1 : 2)) > (editingPartData.urgency == "Low" ? 0 : (editingPartData.urgency == "Medium" ? 1 : 2)) ? "More" : "Less") + " important");
			}
		}
		if (partUrl != editingPartData.url) {
			if (EditingChange.length == 0) {
				EditingChange.push("Changed the url of the " + nd + " from " + editingPartData.url + " to " + partUrl);
			}
			else {
				EditingChange.push("changed the url of from " + editingPartData.url + " to " + partUrl);
			}
		}

		var EditingChangeString = "";
		for (var i = 0; i < EditingChange.length; i++) {
			if (i == 0) { EditingChangeString += EditingChange[i]; }
			else if (i == EditingChange.length - 1) { EditingChangeString += " and " + EditingChange[i]; }
			else { EditingChangeString += ", " + EditingChange[i]; }
		}

		var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = {
			User: users.getCurrentUid(),
			Change: EditingChangeString,
			Date: new Date().getTime()
		};
		json["History"] = Object.assign(doc.data().History, addedHistory);

		firebase.app().firestore().collection("PMS").doc(editingPartFolder).set(json, { merge: true })
			.then(function () {
				EditPartDialogue.close();
			});
	});

} var FormEditPart = document.getElementById('EditPartForm'); if (FormEditPart.attachEvent) { FormEditPart.attachEvent("submit", EditPart); } else { FormEditPart.addEventListener("submit", EditPart); }
