//Folder History Handler
const FolderHistoryDialogue = new mdc.dialog.MDCDialog(document.querySelector('#history-folder-dialog')); var folderHistoryToUITarget = "";
function openHistory(folder) { FolderHistoryDialogue.show(); folderHistoryToUITarget = folder; document.getElementById('FolderHistoryTitle').innerHTML = folder.substr(FolderNumberPadding) + "'s History"; } //Open the dialogue
document.getElementById('HistoryFolderCancel').addEventListener('click', function () { FolderHistoryDialogue.close(); }); //Close the dialog
setInterval(folderHistoryToUI, 60);
function folderHistoryToUI(folder) {
	if (FolderHistoryDialogue.open == true) { //Only update if the client is viewing the history
		var folder = folderHistoryToUITarget;
		if (folder != "") {
			var html = '';
			firebase.app().firestore().collection("PMS").doc(folder).get().then(function (doc) {
				if (doc.exists == true) { //Make sure it exists
					for (var his = Object.keys(doc.data().History).length - 1; his > -1; his--) {
						var change = doc.data().History[his].Change; var user = doc.data().History[his].User; var timeSince = dateDistance(new Date().getTime(), doc.data().History[his].Date);

						if (change.length > 100) {
							//change = change.substring(0, 100);
							//change += "...";
						}

						html += `
												<tr>
													<td>` + user + `</td>
													<td>` + change + `</td>
													<td>` + timeSince + `</td>
												</tr>
												`;
					}

					document.getElementById('HistoryFolderContentWrapper').innerHTML = html;
				}
			});
		}
	}

	function dateDistance(d1, d2) {
		var d, h, m, s;
		s = Math.floor(Math.abs(d1 - d2) / 1000);
		m = Math.floor(s / 60);
		h = Math.floor(m / 60);
		d = Math.floor(h / 24);

		s = s % 60;
		m = m % 60;
		h = h % 24;

		var n = (Math.abs((new Date(d1).getMonth()) - (new Date(d2).getMonth())));
		var y = (Math.abs((new Date(d1).getFullYear()) - (new Date(d2).getFullYear())));

		if (y > 0) { return y + " year" + (y > 1 ? "s" : "") + " ago"; }
		else if (n > 0) { return n + " month" + (n > 1 ? "s" : "") + " ago"; }
		else if (d > 0) { return d + " day" + (d > 1 ? "s" : "") + " ago"; }
		else if (h > 0) { return h + " hour" + (h > 1 ? "s" : "") + " ago"; }
		else if (m > 0) { return m + " minute" + (m > 1 ? "s" : "") + " ago"; }
		else { return s + " second" + (s > 1 ? "s" : "") + " ago"; }
	}
}