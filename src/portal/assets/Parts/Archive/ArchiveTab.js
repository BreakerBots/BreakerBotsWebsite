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
									<table class="table table-striped" style=" width: 100%; table-layout: fixed;">
										<thead>
											<tr>
												<th style="width:20%;">Item</th>
												<th style="width:21%;">Desc</th>
												<th style="width:15%;">Prio.</th>
												<th style="width:11%;" class="number">#</th>
												<th style="width:13%;" class="number">$</th>
												<th style="width:15%;">Ord.</th>
												<th class="actions"></th>
											</tr>
										</thead>
										<tbody>`;

				for (var data in doc.data()) {
					if (data != "History" && data != "index") {
						var part = (doc.data()[data]);
						html3 += `<tr>
									<td>`+ (part.url == undefined || part.url == "http://" ? part.name : `<a target="_blank" href="` + part.url + `">` + part.name + `</a>`) + `</td>
									<td>`+ (part.desc == undefined || part.desc == "" ? "None" : part.desc) + `</td>
									<td>`+ part.urgency + `</td>
									<td class="number">` + part.quantity + `</td>
									<td class="number">$` + part.priceper + `</td>
									<td>` + part.status + `</td>
								</tr>`;
					}
				}
				html3 += `</tbody> </table> </div> </div> </div>`;
			});
			document.getElementById('PartsArchiveWrapper').innerHTML = html3;
		}, function (error) {

		});
}
