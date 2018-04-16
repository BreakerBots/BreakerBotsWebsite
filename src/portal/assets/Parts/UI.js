//PMS UI
function startPMS() {
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
												<th>Prio.</th>
												<th class="number">#</th>
												<th class="number">$</th>
												<th>Ordered</th>
												<th class="actions"></th>
											</tr>
										</thead>
										<tbody>`;

				for (var data in doc.data()) {
					if (data != "History" && data != "index") {
						var part = (doc.data()[data]);
						html += `<tr ` + (part.status == "No" ? (`style="background-color: rgba(214,0,0,` + (part.urgency == "Low" ? 0 : (part.urgency == "Medium" ? 0.2 : 0.4))) : "") + `);">
									<td>`+ (part.url == undefined || part.url == "http://" ? part.name : `<a target="_blank" href="` + part.url + `">` + part.name + `</a>`) + `</td>
									<td>`+ (part.desc == undefined || part.desc == "" ? "None" : part.desc) + `</td>
									<td>`+ part.urgency + `</td>
									<td class="number">` + part.quantity + `</td>
									<td class="number">$` + part.priceper + `</td>
									<td>` + part.status + `</td>
									<td class="actions">
										<a href="#" role="button" data-toggle="dropdown" class="dropdown-toggle"><span class="icon mdi mdi-more-vert"></span></a>
										<div role="menu" class="dropdown-menu">
											<a onclick="openEditPartDialogue('` + doc.id + `','` + data + `')" class="dropdown-item">Edit</a>
											<a onclick="flipPartStatus('` + doc.id + `','` + data + `',this.id)" id="` + data + doc.id + Math.random().toString(36).substring(3) + `" class="dropdown-item">` + "Mark as " + (part.status == "No" ? "Ordered" : "Unordered") + `</a>
											<div class="dropdown-divider"></div><a onclick="deletePart('`+ doc.id + `','` + data + `','` + part.name + `','` + part.quantity + `', '` + part.desc + `')" class="dropdown-item">Delete</a>
										</div>
									</td>
								</tr>`;
					}
				}
				html += `</tbody> </div> </table> </div> </div> </div> </div>`;
			});
			document.getElementById('PartsAllWrapper').innerHTML = html;
		}, function (error) {

		});
}
