function startPMSOrdered() {
	firebase.app().firestore().collection("PMS-Extra").doc("Ordered")
		.onSnapshot(function (doc) {
			document.getElementById('PartsOrderedWrapper').innerHTML = "";
			for (var data in doc.data()) {
				drawOrderedTableElement(data, doc);
			}
		});
}

function drawOrderedTableElement(data, doc) {
	var folder = doc.data()[data];
	firebase.app().firestore().collection("PMS").doc(folder).get().then(function (doc) {
		var html = '';
		var part = (doc.data()[data]);
		if (part != undefined ? part.status == "Yes" : false) {
			html += `<tr ` + (part.status == "No" ? (`style="background-color: rgba(214,0,0,` + (part.urgency == "Low" ? 0 : (part.urgency == "Medium" ? 0.2 : 0.4))) : "") + `);">
					<td>`+ (part.url == undefined || part.url == "http://" ? part.name : `<a target="_blank" href="` + part.url + `">` + part.name + `</a>`) + `</td>
					<td>`+ (part.desc == undefined || part.desc == "" ? "None" : part.desc) + `</td>
					<td>`+ doc.id.substring(FolderNumberPadding) + `</td>
					<td class="number">` + part.quantity + `</td>
					<td class="number">$` + part.priceper + `</td>
					</tr>`;
			document.getElementById('PartsOrderedWrapper').innerHTML += html;
		} else {
			firebase.app().firestore().collection("PMS-Extra").doc("Ordered").get().then(function (doc) {
				var json = doc.data();
				delete json[data];
				console.log(json);
				firebase.app().firestore().collection("PMS-Extra").doc("Ordered").set(json);
			});
		}
	});
}