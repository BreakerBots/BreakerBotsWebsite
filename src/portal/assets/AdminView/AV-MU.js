// Admin View Manage Users

new RegisteredTab("AV-MU", AV_AU_FInit, AV_MU_Init, null, false);

function AV_MU_Init() {
	AVSC.TabEnterCheck();
	AV_MU_Draw();
}

function AV_MU_Draw() {
	if (ClearanceSnapshot && UsersSnapshot) {
		authLoadedFullWait(function () {
			html = '';

			UsersSnapshot.docs.forEach(function (item) {
				if (findObjectByKey(ClearanceSnapshot.docs, "id", item.id)) {
					html += `
					<div class="breaker-layout__panel">
						<div class="mdc-card todo-card" style="min-height: 70px; background-color: rgba(255, 255, 255, 1)">
							<div style="position: relative; display: flex; min-height: 70px; align-items: center;">
								<div style="margin-left: 20px; width: 100%; position: absolute; top: 10px;">
									<div class="demo-card__primary" style="width: 70%">
										<h2 class="demo-card__title mdc-typography--headline6" onclick="` + ProfileTabAPI.getLink(item.id) + `" style="margin: 0; font-weight: 1000; cursor: pointer">` + (item.data().name || item.data().username) + `</h2>
										<h4 class="demo-card__title mdc-typography--headline10" style="margin-top: 0; margin-left: 5px;">` + item.data().role + `</h2>
									</div>
									<i class="noselect material-icons" style="font-size: 300%; position: absolute; right: 30px; top: -8px;"> <img src="` + (users.getUser(item.id).avatar || "../assets/img/iconT.png") + `" style="width: 45px; border-radius: 50%;"> </i>
								</div>
							</div>
							<div class="mdc-card__action-icons">
								<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons mdc-ripple-upgraded mdc-ripple-upgraded--unbounded" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false" tabindex="-1">more_vert</i>
							</div>
							<div class="dropdown-menu-c dropdown-menu be-connections mdc-elevation--z10" style="padding: 0;" data-menu-offset="0 -27">
								<ul class="mdc-list">` +
									(users.getUser(item.id).clearance < users.getCurrentClearance() ? `
									<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="AV_MU_ChangeClearance('` + item.id + `')">
										<span class="noselect mdc-list-item__graphic material-icons">security</span>
										<span class="noselect mdc-list-item__text">Change Clearance</span>
									</li>` : ``) + `
									<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="AV_MU_ViewHistory('` + item.id + `')">
										<span class="noselect mdc-list-item__graphic material-icons">history</span>
										<span class="noselect mdc-list-item__text">View History</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
					`;
				}
			});
			document.querySelector('#AV-MU-Wrapper').innerHTML = html;
			mdc.autoInit(document.querySelector('#AV-MU-Wrapper'));
		});
	}
}

var AV_MU_ChangeClearance__Target;
function AV_MU_ChangeClearance(user) {
	if (Number(users.getUser(user).clearance) < Number(users.getCurrentClearance())) {
		AV_MU_ChangeClearance__Target = user;
		ShiftingDialog.set({
			id: "AV-MU-ChangeClearance",
			title: "Change " + users.getUsername(user) + `'s Clearance`,
			submitButton: "Submit",
			cancelButton: "Cancel",
			contents: 
				mainSnips.radioButtons("AV-MU-ChangeClearance-Option", [
					'<i style="font-size: 28px; transform: translate(0px, 6px);" class="material-icons">looks_one</i> <span style="font-size: 16px; display: inline-block; transform: translate(0px, -3px);">&nbsp Member</span>',
					'<i style="font-size: 28px; transform: translate(0px, 6px);" class="material-icons">looks_two</i> <span style="font-size: 16px; display: inline-block; transform: translate(0px, -3px);">&nbsp Team Lead / Manager: A Restricted Admin</span>',
					'<i style="font-size: 28px; transform: translate(0px, 6px);" class="material-icons">looks_3</i> <span style="font-size: 16px; display: inline-block; transform: translate(0px, -3px);">&nbsp Admin / Mentor</span>'
				])
		});
		ShiftingDialog.open();
		setTimeout(function () {
			setRadioButtonValue(document.querySelector('#AV-MU-ChangeClearance-Option'), ((Number(users.getUser(user).clearance) - 1) || 0));
		}, 10);
	}
	else
		alert("Sorry But You Need To Have A Higher Clearance Than A User To Change Their Clearance");
}
ShiftingDialog.addSubmitListener("AV-MU-ChangeClearance", function (c) {
	var val = getRadioButtonValue(c.querySelector('#AV-MU-ChangeClearance-Option')) + 1;
	// If Not Changed
	if (!(val == Number(users.getUser(AV_MU_ChangeClearance__Target).clearance))) {
		firebase.app().firestore().collection("Clearance").doc(AV_MU_ChangeClearance__Target).get().then(function (doc) {
			var data = doc.data();
			if (!data.history) data.history = [];
			data.history.push({
				changer: users.getCurrentUid(),
				from: data.a,
				to: val
			});
			data.a = val;
			firebase.app().firestore().collection("Clearance").doc(AV_MU_ChangeClearance__Target).set(data).then(function (doc) {
				ShiftingDialog.close();
			});
		});
	} else {
		ShiftingDialog.close();
	}
});

function AV_MU_ViewHistory(user) {
	var html = '';
	var data = findObjectByKey(ClearanceSnapshot.docs, "id", user).data();
	var his = data.history || [];
	var lp = -1;
	his.forEach(function (item) {
		html += `
		<tr>
			<td>` + (users.getUsername(item.changer) || "") + `</td>
			<td>` + (item.from || 0) + `</td>
			<td>` + (item.to || 0) + `</td>
		</tr>`;
		lp = item.to;
	});
	if (data.a != lp) {
		html += `
		<tr>
			<td><i style="transform: translateY(6px)" class="material-icons">warning</i>&nbsp Undocumented Change</td>
			<td>` + (lp || 0).min(0) + `</td>
			<td>` + (data.a || 0) + `</td>
		</tr>`;
	}
	ShiftingDialog.set({
		id: "AV-MU-ViewHistory",
		title: users.getUsername(user) + "'s History",
		cancelButton: "Okay", centerButtons: true,
		contents: `
		<div class="material-table">
			<table>
				<thead>
					<tr>
						<th>User</th>
						<th>From</th>
						<th>To</th>
					</tr>
				</thead>
				<tbody>
					` + html + `
				</tbody>
			</table>
		</div>
		`
	});
	ShiftingDialog.open();
}