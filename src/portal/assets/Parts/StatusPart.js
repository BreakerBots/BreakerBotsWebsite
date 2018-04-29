//Part Status Handling
const PartStatusDialogue = new mdc.dialog.MDCDialog(document.querySelector('#part-status-dialog'));

var PartStatusFolder = "";
var PartStatusPart = "";

function changePartStatus(folder, part) {
	PartStatusForm.querySelector('[type="submit"]').disabled = false;
	PartStatusDialogue.show();

	PartStatusFolder = folder;
	PartStatusPart = part;

	firebase.app().firestore().collection("PMS").doc(PartStatusFolder).get().then(function (doc) {
		document.getElementById('PartStatusInput').value = doc.data()[PartStatusPart].status;
		document.getElementById('PartStatusOrderDate').value = doc.data()[PartStatusPart].orderDate;
		document.getElementById('PartStatusArriveDate').value = doc.data()[PartStatusPart].arriveDate;
	});

	$('.datetimepicker').datetimepicker({
		autoclose: true,
		minView: 2,
		pickTime: false,
		format: 'mm/dd/yyyy',
	});
} //Open the dialog

document.getElementById('PartStatusCancel').addEventListener('click', function () { PartStatusDialogue.close(); }); //Close the dialog

function markPartStatus(e) {
	if (e.preventDefault) e.preventDefault(); PartStatusForm.querySelector('[type="submit"]').disabled = true;

	var PartStatusInput = document.getElementById('PartStatusInput').value;
	var PartStatusInputO = document.getElementById('PartStatusOrderDate').value;
	var PartStatusInputA = document.getElementById('PartStatusArriveDate').value;

	firebase.app().firestore().collection("PMS").doc(PartStatusFolder).get().then(function (doc) {
		var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = {
			User: firebase.auth().currentUser.displayName,
			Change: "Marked the " + doc.data()[PartStatusPart].name + (doc.data()[PartStatusPart].desc != "" ? " for " + doc.data()[PartStatusPart].desc : "") + " as " + doc.data()[PartStatusPart].status,
			Date: new Date().getTime()
		};
		var json1 = {};
		json1["History"] = Object.assign(doc.data().History, addedHistory);
		json1[PartStatusPart] = { status: PartStatusInput, orderDate: PartStatusInputO, arriveDate: PartStatusInputA };
		firebase.app().firestore().collection("PMS").doc(PartStatusFolder).set(json1, { merge: true })
			.then(function () {
				PartStatusDialogue.close();

				if (PartStatusInput == "Ordered") {
					var json2 = {};
					json2[PartStatusPart] = Object.assign(doc.data()[PartStatusPart], { folder: PartStatusFolder });
					firebase.app().firestore().collection("PMS-Extra").doc("Ordered").set(json2, { merge: true });
				}
			});
	});
}

var PartStatusForm = document.getElementById('PartStatusForm'); if (PartStatusForm.attachEvent) { PartStatusForm.attachEvent("submit", markPartStatus); } else { PartStatusForm.addEventListener("submit", markPartStatus); }



//Old
/*
function flipPartStatus(folder, part, element) {
	firebase.app().firestore().collection("PMS").doc(folder).get().then(function (doc) {
		var addedHistory = {}; addedHistory[Object.keys(doc.data().History).length] = {
			User: firebase.auth().currentUser.displayName,
			Change: "Marked the " + doc.data()[part].name + (doc.data()[part].desc != "" ? " for " + doc.data()[part].desc : "") + " as " + (doc.data()[part].status == "No" ? "Ordered" : "Unordered"),
			Date: new Date().getTime()
		};
		var json1 = {};
		json1["History"] = Object.assign(doc.data().History, addedHistory);
		json1[part] = { status: doc.data()[part].status == "No" ? "Yes" : "No" };
		firebase.app().firestore().collection("PMS").doc(folder).set(json1, { merge: true });
		if (doc.data()[part].status == "No") {
			var json2 = {};
			json2[part] = folder;
			firebase.app().firestore().collection("PMS-Extra").doc("Ordered").set(json2, { merge: true });
		}
	});
}
*/