//PMS UI for Archived Folders
function startPMSArchived() {
	firebase.app().firestore().collection("PMS-Archived")
		.onSnapshot(function (snapshot) {
			var html3 = '';
			snapshot.forEach((doc) => {
				html3 += `<div class="col-lg-6">
							<div class="card card-table">
								<div class="card-header">
									` + doc.id.substr(FolderNumberPadding) + `
									<div class="tools dropdown">
									<a role="button" data-toggle="dropdown" class="dropdown-toggle"><span class="icon mdi mdi-more-vert"></span></a>
										<div role="menu" class="dropdown-menu">
											<a onclick="openArchiveHistory(this.id)" id="` + doc.id + `" href="#" class="dropdown-item">History</a>
											<a onclick="archivedeleteFolder(this.id)" id="` + doc.id + `" class="dropdown-item">Delete</a>
											<a onclick="unarchiveFolder('` + doc.id + `')" class="dropdown-item">Unarchive</a>
										</div>
									</div>
								</div>
								<div class="card-body">
									<div class="table-responsive">
									<table class="table table-striped">
										<thead>
											<tr>
												<th>Item</th>
												<th>Desc</th>
												<th>Priority</th>
												<th>Part Number</th>
												<th class="number">Quantity</th>
												<th>Unit</th>
												<th class="number">Unit Price</th>
												<th class="number">Total Price</th>
												<th>Status</th>
											</tr>
										</thead>
										<tbody>`;
				var GrandTotalPrice2 = 0;
				for (var data in doc.data()) {
					if (data != "History" && data != "index") {
						var part = (doc.data()[data]);
						GrandTotalPrice2 += (part.priceper * part.quantity);
						html3 += `<tr style="background-color: rgba(` + (part.status == "Ordered" ? (`0,255,0,0.2`) : (part.status == "Ready" || part.status == "Not Ready" ? (part.urgency == "Low" ? '0,0,0,0' : (part.urgency == "Medium" ? '214,0,0,0.2' : '214,0,0,0.4')) : '0,0,0,0')) + `);">
									<td>`+ (part.url == undefined || part.url == "http://" ? part.name : `<a target="_blank" href="` + part.url + `">` + part.name + `</a>`) + `</td>
									<td>`+ (part.desc == undefined || part.desc == "" ? "None" : part.desc) + `</td>
									<td>`+ part.urgency + `</td>
									<td>` + part.partNumber + `</td>
									<td class="number">` + part.quantity + `</td>
									<td>` + part.unit + `</td>
									<td class="number">$` + part.priceper + `</td>
									<td class="number">$` + (part.priceper * part.quantity) + `</td>
									<td>` + part.status + (part.status == "Ordered" ? (": " + part.orderDate) : (part.status == "Arrived") ? (": " + part.arriveDate) : ('')) + `</td>
							</tr>`;
					}
				}
				html3 += `</tbody> </table> </div> </div> </div> </div>`;
			});
			document.getElementById('PartsArchiveWrapper').innerHTML = html3;
		}, function (error) {

		});
}
