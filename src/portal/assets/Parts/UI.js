function nulloutPMS() { };

//PMS UI
function startPMS() {
	startPMS = nulloutPMS();
	firebase.app().firestore().collection("PMS")
		.onSnapshot(function (snapshot) {
			var html = '';
			snapshot.forEach((doc) => {
				html += `<div class="col-lg-6">
							<div class="card card-table">
								<div class="card-header">
									` + doc.id.substr(FolderNumberPadding) + `
									<div class="tools dropdown">
									<a role="button" data-toggle="dropdown" class="dropdown-toggle"><span class="icon mdi mdi-more-vert"></span></a>
										<div role="menu" class="dropdown-menu">
											<a onclick="editFolder(this.id)" href="#" id="` + doc.id + `" class="dropdown-item">Edit</a>
											<a onclick="openHistory(this.id)" id="` + doc.id + `" href="#" class="dropdown-item">History</a>
											<a onclick="openCreatePartDialogue(this)" id="` + doc.id + `" class="dropdown-item">Add</a>
											<div class="dropdown-divider"></div>
											<a onclick="deleteFolder(this.id)" id="` + doc.id + `" class="dropdown-item">Delete</a>
											<a onclick="archiveFolder('` + doc.id + `')" class="dropdown-item">Archive</a>
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
												<th class="actions"></th>
											</tr>
										</thead>
										<tbody>`;

				var GrandTotalPrice = 0;
				for (var data in doc.data()) {
					if (data != "History" && data != "index") {
						var part = (doc.data()[data]);
						GrandTotalPrice += (part.priceper * part.quantity);
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
									<td class="actions">
										<a href="#" role="button" data-toggle="dropdown" class="dropdown-toggle"><span class="icon mdi mdi-more-vert"></span></a>
										<div role="menu" class="dropdown-menu">
											<a onclick="openEditPartDialogue('` + doc.id + `','` + data + `')" class="dropdown-item">Edit</a>
											<a onclick="changePartStatus('` + doc.id + `','` + data + `')" id="` + data + doc.id + Math.random().toString(36).substring(3) + `" class="dropdown-item">Change Status</a>
											<div class="dropdown-divider"></div><a onclick="deletePart('`+ doc.id + `','` + data + `','` + part.name + `','` + part.quantity + `', '` + part.desc + `')" class="dropdown-item">Delete</a>
										</div>
									</td>
								</tr>`;
					}
				}
				html += `<tr>
							<td style="background-color: white;"></td>
							<td style="background-color: white;"></td>
							<td style="background-color: white;"></td>
							<td style="background-color: white;"></td>
							<td style="background-color: white;"></td>
							<td style="background-color: white;" class="number"></td>
							<td style="background-color: white;"></td>
							<td style="background-color: white;" class="number"> GT = $` + GrandTotalPrice + `</td>
						</tr>`
				html += `</tbody> </div> </table> </div> </div> </div> </div>`;
			});
			document.getElementById('PartsAllWrapper').innerHTML = html;
		}, function (error) {

		});
}
