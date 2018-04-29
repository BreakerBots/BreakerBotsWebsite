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
	var folder = doc.data()[data].folder;
	firebase.app().firestore().collection("PMS").doc(folder).get().then(function (doc) {
		var html = '';
		var part = (doc.data()[data]);
		if (part != undefined ? part.status == "Ordered" : false) {
			html += `<tr style="background-color: rgba(` + (part.status == "Ordered" ? (`0,255,0,0.2`) : (part.status == "Ready" || part.status == "Not Ready" ? (part.urgency == "Low" ? '0,0,0,0' : (part.urgency == "Medium" ? '214,0,0,0.2' : '214,0,0,0.4')) : '0,0,0,0')) + `);">
									<td>`+ (part.url == undefined || part.url == "http://" ? part.name : `<a target="_blank" href="` + part.url + `">` + part.name + `</a>`) + `</td>
									<td>`+ (part.desc == undefined || part.desc == "" ? "None" : part.desc) + `</td>
									<td>`+ part.urgency + `</td>
									<td>` + part.partNumber + `</td>
									<td class="number">` + part.quantity + `</td>
									<td>` + part.unit + `</td>
									<td class="number">$` + part.priceper + `</td>
									<td class="number">$` + (part.priceper * part.quantity) + `</td>
									<td>` + part.status + (part.status == "Ordered" ? (": " + part.orderDate) : (part.status == "Arrived") ? (": " + part.arriveDate) : ('')) + `</td>
									<td><a href="?tab=PartsAll">`+ doc.id.substring(FolderNumberPadding) + `</a></td>
								</tr>`;
			document.getElementById('PartsOrderedWrapper').innerHTML += html;
		} else {
			//Remove non-ordered and deleted/archived/moves/etc. items
			firebase.app().firestore().collection("PMS-Extra").doc("Ordered").get().then(function (doc) {
				var json = doc.data();
				delete json[data];
				firebase.app().firestore().collection("PMS-Extra").doc("Ordered").set(json);
			});
		}
	}).catch(function (error) {
		console.log(error);
		});
}