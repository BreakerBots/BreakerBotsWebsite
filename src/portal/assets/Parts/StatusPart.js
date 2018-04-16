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