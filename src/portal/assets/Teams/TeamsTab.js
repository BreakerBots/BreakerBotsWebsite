//Teams Tab UI
function startTeams() {
	startTeams = nulloutPMS();

	var AddTeamFab = document.querySelector('#AddTeamFab');
	mdc.ripple.MDCRipple.attachTo(AddTeamFab);

	authLoadedWait(function () {

		if (users.amMasterAdmin()) AddTeamFab.classList.remove('mdc-fab--exited');

		firebase.app().firestore().collection("Teams")
			.onSnapshot(function (snapshot) {
				firebase.app().firestore().collection("Teams").orderBy("NOM");
				var html = '';
				snapshot.forEach((doc) => {
					html += `<div class="col-lg-6">
							<div class="card card-table">
								<div class="card-header">
									` + doc.id + `
									<div class="tools dropdown">`;
					if (!users.getCurrentUser().teams.includes(doc.id)) html += `<div class="btn-group btn-hspace"> <button onclick="joinTeam('` + doc.id + `')" type="button" class="btn btn-primary">Join</button> </div>`;
					else html += `<div class="btn-group btn-hspace"> <button onclick="leaveTeam('` + doc.id + `')" type="button" class="btn btn-primary">Leave</button> </div>`;
					if (users.amMasterAdmin()) html += `<a role="button" style="margin-left: 20px;" data-toggle="dropdown" class="dropdown-toggle"><span class="icon mdi mdi-more-vert"></span></a>`;
					html += `				<div role="menu" class="dropdown-menu">
											<a onclick="editTeam('` + doc.id + `', '` + doc.data().Desc + `')" class="dropdown-item">Edit</a>
											<a onclick="deleteTeam('` + doc.id + `')" class="dropdown-item" style="color: red;">Delete</a>
										</div>
									</div>
									<span class="card-subtitle">` + doc.data().Desc + `</span>
								</div>
								<div class="card-body">
									<div class="table-responsive noSwipe">
										<table class="table table-striped table-hover">
										  <thead>
											<tr>
											  <th>User</th>
											</tr>
										  </thead>
										  <tbody>`;
					for (var mi = 0; mi < Object.keys(doc.data().Members).length; mi++) {
						var member = doc.data().Members[mi];
						html +=
											`<tr>
												<td class="cell-detail user-info">
												<img src="` + users.getAvatar(member) + `" alt="Avatar" style="width: 32px; margin-right: 8px;">
												<a href="` + ('?profile=' + member + '#tab=Profile') + `"><span>` + users.getUsername(member) + `</span></a>
												<span class="cell-detail-description">` + users.getUser(member).role + `</span></td>
												<td class="text-right">`;
						if (users.getUser(member).clearance < users.getCurrentClearance() && users.amMasterAdmin()) {
												`<div class="btn-group btn-hspace">
													<button type="button" data-toggle="dropdown" class="btn btn-secondary dropdown-toggle">Open <span class="icon-dropdown mdi mdi-chevron-down"></span></button>
													<div role="menu" class="dropdown-menu">
														<a class="dropdown-item" style="color: red;">Remove</a>
													</div>
												</div>`;
						}
						html +=				  `</td>
											</tr>`;
					}
					html += `			</tbody>
										</table>
									 </div>
								</div> 
							</div>
						</div>`;
				});
				document.getElementById('TeamsWrapper').innerHTML = html;
			}, function (error) {

			});
	});
}
