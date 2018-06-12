//TeamsTab.js

var TeamsTab = new RegisteredTab("Teams", null, teamsInitEvery, teamsExit, true);

//  ----------------------------------------  Init  -------------------------------------------------\\
var teamsSnapshot;
document.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("Teams")
		.onSnapshot(function (snapshot) {
			teamsSnapshot = snapshot;
			teamsDraw(false);
		});
});

function teamsInitEvery() {
	showMainLoader(true);

	teamsDraw(true);

	TeamsFab.tabSwitch();
	showMainLoader(false);
}

function teamsExit() {
	TeamsFab.tabExit();
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Draw  -------------------------------------------------\\
function teamsDraw(teamsDrawTransition) {
	if (teamsSnapshot) {
		var html = '';

		for (var i = 0; i < teamsSnapshot.docs.length; i++) {
			var id = teamsSnapshot.docs[i].id;
			var data = teamsSnapshot.docs[i].data();
			html += `
			<div class="breaker-layout__panel">
				<div class="mdc-card ` + (teamsDrawTransition ? 'todo-card' : '') + `">
					<div style="margin-left: 20px; width: 100%; position: relative;">
						<div class="demo-card__primary" style="width: 90%">
							<h2 class="demo-card__title mdc-typography--headline6">` + data.name + `</h2>
						</div>
						<div class="mdc-typography--body2" style="width: 90%;">` + data.desc + `</div>
						<i onclick="teamsJL('` + id + `', ` + teams.memberInTeam(users.getCurrentUid(), id) + `)" data-mdc-auto-init="MDCIconToggle" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80); position: absolute; right: 20px; top: 0px;" role="button" aria-pressed="false" aria-label="` + (teams.memberInTeam(users.getCurrentUid(), id) ? 'Leave Team' : 'Join Team') + `" aria-label-delay="0.2s"><i class="material-icons" style="font-size: 150%; position: absolute; left: 7px; top: 7px;">` + (teams.memberInTeam(users.getCurrentUid(), id) ? 'call_made' : 'call_received') + `</i></i>
					</div>
					<div class="mdc-card__action-icons" style="position: relative;">
						<i data-mdc-auto-init="MDCIconToggle" onclick="teamsExpandCollapseMembers('` + id + `')" class="material-icons mdc-icon-toggle" role="button" style="color: rgb(80, 80, 80); position: absolute; left: 0; font-size: 200%;" aria-label="Show Members">expand_more</i>
						<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
					</div>
					<div class="teamsMemberList" style="overflow: hidden; opacity: 0; max-height: 0px; transition: opacity .8s, max-height 1s; transition-timing-function: cubic-bezier(.2, 0, .2, 1);">
						` + teamsGetMembersHtml(id) + `
					</div>
					<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" data-menu-offset="0 -27">
						<li class="mdc-elevation--z10">
							<ul class="mdc-list">
								<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="teamsEdit('` + id + `')">
									<span class="noselect mdc-list-item__graphic material-icons">edit</span>
									<span class="noselect mdc-list-item__text">Edit</span>
								</li>
								<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="teamsDelete('` + id + `')">
									<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
									<span class="noselect mdc-list-item__text" style="color: red">Delete</span>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
			`;
		}

		document.querySelector('#TeamsWrapper').innerHTML = html;
		window.mdc.autoInit(document.querySelector("#TeamsWrapper"));
		return true;
	}
	else return false;
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Add  -------------------------------------------------\\
var TeamsFab = new FabHandler(document.querySelector("#AddTeamFab"));
TeamsFab.addListener(function () {
	ShiftingDialog.set("TeamsAdd", "Add Team", "Submit", "Cancel", (
		mainSnips.textField("Teams_Name", "Name", "The Name of the Team", null, null, true, "") + 
		mainSnips.textField("Teams_Desc", "Description", "A Short Description of the Team", null, null, false, "")
	));
	ShiftingDialog.open();
});
ShiftingDialog.addSubmitListener("TeamsAdd", function () {
	var name = document.querySelector("#Teams_Name").value || "";
	var desc = document.querySelector("#Teams_Desc").value || "";
	firebase.app().firestore().collection("Teams").add({ name: name, desc: desc, members: [] }).then(function () {
		ShiftingDialog.close();
	});
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Edit  -------------------------------------------------\\
var teamEditing = "";
function teamsEdit(team) {
	teamEditing = team;
	var teamData = teams.getData(team);
	ShiftingDialog.set("TeamsEdit", "Edit " + teamData.name, "Submit", "Cancel", (
		mainSnips.textField("Teams_Name", "Name", "The Name of the Team", null, null, true, teamData.name) +
		mainSnips.textField("Teams_Desc", "Description", "A Short Description of the Team", null, null, false, teamData.desc)
	));
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TeamsEdit", function () {
	var name = document.querySelector("#Teams_Name").value || "";
	var desc = document.querySelector("#Teams_Desc").value || "";
	firebase.app().firestore().collection("Teams").doc(teamEditing).set({ name: name, desc: desc }, { merge: true }).then(function () {
		ShiftingDialog.close();
	});
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Delete  -------------------------------------------------\\
var teamDeleting = "";
function teamsDelete(team) {
	teamDeleting = team;
	var teamData = teams.getData(team);
	ShiftingDialog.set("TeamsDelete", "Delete Team", "Yes", "No",
		mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
		`<div style="width: 100%"></div>` +
		`<h1 style="text-align: center;"> Are you sure you want to delete ` + teamData.name + `?</h1>`
		, true, true);
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TeamsDelete", function () {
	firebase.app().firestore().collection("Teams").doc(teamEditing).delete().then(function () {
		ShiftingDialog.close();
	});
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Join/Leave  -------------------------------------------------\\
function teamsJL(team, leave) {
	var data = teams.getData(team);

	if (leave) data.members.splice(data.members.indexOf(users.getCurrentUid()), 1);
	else data.members.push(users.getCurrentUid());

	firebase.app().firestore().collection("Teams").doc(team).set(data);
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Expand/Collapse Members  -------------------------------------------------\\
function teamsExpandCollapseMembers(id) {
	try {
		var btn = event.srcElement;
		var doExpand = (btn.innerHTML == "expand_more");
		btn.innerHTML = doExpand ? "expand_less" : "expand_more";
		var lst = btn.parentNode.parentNode.querySelector('.teamsMemberList');
		if (doExpand) {
			lst.style.opacity = "1";
			lst.style.maxHeight = (40 * lst.childNodes.length) + "px";
		}
		else {
			lst.style.opacity = "0";
			lst.style.maxHeight = "0px";
		}
	} catch (err) { console.log(err); }
}
function teamsGetMembersHtml(id) {
	var html = '';
	var membs = teams.getMembers(id);
	for (var i = 0; i < membs.length; i++) {
		var mem = users.getUser(membs[i]);
		html += `
			<div style="width: 100%; background: ` + ((i % 2 == 0) ? '#efefef' : '#ffffff') + `; height: 40px; position: relative;">
				<img style="border-radius: 50%; width: 35px; margin: 2.5px 5px 0 2.5px;" src="` + (mem.avatar || "../assets/img/iconT.png") + `">
				<div style="position: absolute; left: 42px; top: 8.5px;">
					<span style="font-size: 120%; font-weight: 600;">` + (mem.username || "Username") + `</span>
					<span style="font-size: 90%; margin-left: 2px;">` + (mem.name || (mem.username || "Name")) + `</span>
				</div>
			</div>
		`;
	}
	return html;
}
//  ----------------------------------------    -------------------------------------------------\\