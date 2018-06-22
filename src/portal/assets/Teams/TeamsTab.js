//TeamsTab.js

var TeamsTab = new RegisteredTab("Teams", null, teamsInitEvery, teamsExit, true);

//  ----------------------------------------  Init  -------------------------------------------------\\
var teamsSnapshot;
document.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("Teams")
		.onSnapshot(function (snapshot) {
			teamsSnapshot = snapshot;
			TeamsAPIWaitDone();
			teamsDraw(false);
		});
});

//Waiting
var TeamsAPIWaiters = [], TeamsAPIReady = -1; function TeamsAPIWait(a) { 1 == TeamsAPIReady ? a() : TeamsAPIWaiters.push(a) } function TeamsAPIWaitDone() { -1 == TeamsAPIReady && TeamsAPIWaiters.forEach(function (a) { a() }); TeamsAPIReady = 1 };

function teamsInitEvery() {
	showMainLoader(true);

	teamsDraw(true);

	authLoadedWait(function () {
		if (users.getCurrentClearance() > 1)
			TeamsFab.tabSwitch();
		showMainLoader(false);
	});
}

function teamsExit() {
	TeamsFab.tabExit();
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Draw  -------------------------------------------------\\
function teamsDraw(teamsDrawTransition) {
	authLoadedFullWait(function () {
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
								<h2 class="demo-card__title mdc-typography--headline6">` + MSN(data.name || "") + `</h2>
							</div>
							<div class="mdc-typography--body2" style="width: 90%;">` + MSN(data.desc) + `</div>
						</div>
						<div class="mdc-card__action-icons" style="position: relative;">
							<i data-mdc-auto-init="MDCIconToggle" onclick="teamsExpandCollapseMembers('` + id + `')" class="teamsExpandCollapseButton material-icons mdc-icon-toggle" role="button" style="color: rgb(80, 80, 80); position: absolute; left: 0; font-size: 200%;" aria-label="Show Members">expand_more</i>
							<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
						</div>
						<div class="teamsMemberList" id="teamsMemberList--` + id + `" style="overflow: hidden; opacity: 0; max-height: 0px; transition: opacity .8s, max-height 1s; transition-timing-function: cubic-bezier(.4, 0, .4, 1);">
							` + MSN(teamsGetMembersHtml(id)) + `
						</div>
						<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" data-menu-offset="0 -27">
							<li class="mdc-elevation--z10">
								<ul class="mdc-list">
									<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" aria-label-delay="0.2s" aria-label="` + (teams.memberInTeam(users.getCurrentUid(), id) ? 'Leave Team' : 'Join Team') + `" onclick="teamsJL('` + id + `', ` + teams.memberInTeam(users.getCurrentUid(), id) + `)">
										<span class="noselect mdc-list-item__graphic material-icons">` + (teams.memberInTeam(users.getCurrentUid(), id) ? 'call_made' : 'call_received') + `</span>
										<span class="noselect mdc-list-item__text">` + (teams.memberInTeam(users.getCurrentUid(), id) ? 'Leave Team' : 'Join Team') + `</span>
									</li>` +
									(users.getCurrentClearance() > 1 ?
									`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="teamsEdit('` + id + `')">
										<span class="noselect mdc-list-item__graphic material-icons">edit</span>
										<span class="noselect mdc-list-item__text">Edit</span>
									</li>` +
									(users.getCurrentClearance() > 2 ?
									`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="teamsDelete('` + id + `')">
										<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
										<span class="noselect mdc-list-item__text" style="color: red">Delete</span>
									</li>` : ``) : ``) +
								`</ul>
							</li>
						</ul>
					</div>
				</div>
				`;
			}

			document.querySelector('#TeamsWrapper').innerHTML = html;
			window.mdc.autoInit(document.querySelector("#TeamsWrapper"));
			teamsUpdateExpandCollapseMembers();
			return true;
		}
		else return false;
	});
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Add  -------------------------------------------------\\
var TeamsFab = new FabHandler(document.querySelector("#AddTeamFab"));
TeamsFab.addListener(function () {
	ShiftingDialog.set({
		id: "TeamsAdd",
		title: "Add Team",
		submitButton: "Submit",
		cancelButton: "Cancel",
		contents:
			mainSnips.textField("Teams_Name", "Name", "The Name of the Team", null, null, true, "") +
			mainSnips.textField("Teams_Desc", "Description", "A Short Description of the Team", null, null, false, "")
	});
	ShiftingDialog.open();
});
ShiftingDialog.addSubmitListener("TeamsAdd", function () {
	if (users.getCurrentClearance() > 1) {
		var name = document.querySelector("#Teams_Name").value || "";
		var desc = document.querySelector("#Teams_Desc").value || "";
		firebase.app().firestore().collection("Teams").add({ name: name, desc: desc, members: [] }).then(function () {
			ShiftingDialog.close();
		});
	}
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Edit  -------------------------------------------------\\
var teamEditing = "";
function teamsEdit(team) {
	teamEditing = team;
	var teamData = teams.getData(team);
	ShiftingDialog.set({
		id: "TeamsEdit",
		title: "Edit " + teamData.name,
		submitButton: "Submit",
		cancelButton: "Cancel", 
		contents:
			mainSnips.textField("Teams_Name", "Name", "The Name of the Team", null, null, true, teamData.name) +
			mainSnips.textField("Teams_Desc", "Description", "A Short Description of the Team", null, null, false, teamData.desc)
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TeamsEdit", function () {
	if (users.getCurrentClearance() > 1) {
		var name = document.querySelector("#Teams_Name").value || "";
		var desc = document.querySelector("#Teams_Desc").value || "";
		firebase.app().firestore().collection("Teams").doc(teamEditing).set({ name: name, desc: desc }, { merge: true }).then(function () {
			ShiftingDialog.close();
		});
	}
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Delete  -------------------------------------------------\\
var teamDeleting = "";
function teamsDelete(team) {
	teamDeleting = team;
	var teamData = teams.getData(team);
	ShiftingDialog.set({
		id: "TeamsDelete",
		title: "Delete Team",
		submitButton: "Yes",
		cancelButton: "No",
		contents:
			mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
			`<div style="width: 100%"></div>` +
			`<h1 style="text-align: center;"> Are you sure you want to delete ` + teamData.name + `?</h1>`
		,centerButtons: true
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TeamsDelete", function () {
	if (users.getCurrentClearance() > 2) {
		firebase.app().firestore().collection("Teams").doc(teamDeleting).delete().then(function () {
			ShiftingDialog.close();
		});
	}
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Join/Leave  -------------------------------------------------\\
function teamsJL(team, leave) {
	var data = teams.getData(team);

	if (leave) data.members.splice(data.members.indexOf(users.getCurrentUid()), 1);
	else data.members.push(users.getCurrentUid());

	firebase.app().firestore().collection("Teams").doc(team).set(data);
}
function teamsRemoveUser(team, user) {
	var data = teams.getData(team);
	data.members.splice(data.members.indexOf(user), 1);
	firebase.app().firestore().collection("Teams").doc(team).set(data);
}
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Team Leaders  ----------------------------------------  \\
function teamsChangeTeamLeadStatus(team, user, add) {
	var data = teams.getData(team);

	if (!data.leads)
		data.leads = [];

	if (add && data.leads.indexOf(user) == -1) 
		data.leads.push(user);
	else if (data.leads.indexOf(user) != -1)
		data.leads.splice(data.leads.indexOf(user), 1);

	firebase.app().firestore().collection("Teams").doc(team).set(data);
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Expand/Collapse Members  -------------------------------------------------\\
function teamsExpandCollapseMembers(id) {
	try {
		var btn = event.srcElement;
		var doExpand = (btn.innerHTML == "expand_more");
		btn.innerHTML = doExpand ? "expand_less" : "expand_more";
		var lst = btn.parentNode.parentNode.querySelector('.teamsMemberList');
		if (doExpand) {
			if (teamsExpandCollapseList.indexOf('teamsMemberList--' + id) == -1)
				teamsExpandCollapseList.push('teamsMemberList--' + id);
		}
		else {
			if (teamsExpandCollapseList.indexOf('teamsMemberList--' + id) != -1)
				teamsExpandCollapseList.remove('teamsMemberList--' + id);
		}
		teamsUpdateExpandCollapseMembers();
	} catch (err) { console.log(err); }
}
teamsExpandCollapseList = [];
function teamsUpdateExpandCollapseMembers() {
	var tml = document.querySelector("#TeamsWrapper").querySelectorAll(".teamsMemberList");
	[].forEach.call(tml, function (lst) {
		try {
			if (teamsExpandCollapseList.indexOf(lst.id) != -1) {
				lst.style.opacity = "1";
				lst.style.maxHeight = (40 * lst.childNodes.length) + "px";
				lst.style.pointerEvents = "";
				lst.parentNode.querySelector('.teamsExpandCollapseButton').innerHTML = 'expand_less';
			}
			else {
				lst.style.opacity = "0";
				lst.style.maxHeight = "0px";
				lst.style.pointerEvents = "none";
				lst.parentNode.querySelector('.teamsExpandCollapseButton').innerHTML = 'expand_more';
			}
		} catch (err) { }
	});
}
function teamsGetMembersHtml(id) {
	var html = ['', ''];
	var membs = teams.getMembers(id);
	var leads = teams.getData(id).leads || [];
	for (var i = 0; i < membs.length; i++) {
		var memId = membs[i];
		var mem = users.getUser(memId);
		var menuId = 'teamsMenu' + guid();
		var memITL = leads.indexOf(memId) != -1;
		html[(memITL ? 1 : 0)] += `
			<div onmouseover="this.querySelector('.teamsMemberOptions').style.opacity = 1;" onmouseleave="this.querySelector('.teamsMemberOptions').style.opacity = 0;" onclick="if (!event.target.classList.contains('teamsMemberOptions')) { ` + (ProfileTabAPI.getLink(memId)) + ` }" style="width: 100%; background: ` + ((i % 2 == 0) ? '#efefef' : '#ffffff') + `; height: 40px; position: relative;" class="mdc-ripple-surface" data-mdc-auto-init="MDCRipple">
				<img style="border-radius: 50%; width: 35px; margin: 2.5px 5px 0 2.5px;" src="` + (mem.avatar) + `">`
				+ (memITL ? '<span class="material-icons" style="transform: translate(-6px, 5px)">star</span>' : '') +
				`<div style="position: absolute; left: ` + (memITL ? 60 : 42) + `px; top: 8.5px; right: 0;">
					<span style="font-size: 120%; font-weight: 600;">` + (mem.username || "Username") + `</span>
					<span style="font-size: 90%; margin-left: 2px;">` + (mem.name || (mem.username || "Name")) + `</span>` +
					(users.getCurrentClearance() > 1 ?
					`<i onclick="toggleMenu('#` + menuId + `', true)" style="position: absolute; opacity: 0; transition: opacity 0.4s cubic-bezier(.2, 0, .2, 1); right: 0; top: -7px; width: 40px; height: 40px;" class="mdc-icon-toggle teamsMemberOptions" data-mdc-auto-init="MDCIconToggle"><i class="material-icons teamsMemberOptions">more_vert</i></i>`
					: ``)
				+ `</div>
			</div>
			<ul id="` + menuId + `" class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" data-menu-offset="-10 -20">
				<li class="mdc-elevation--z10">
					<ul class="mdc-list">
						<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="teamsChangeTeamLeadStatus('` + id + `', '` + memId + `', ` + !memITL + `)">
							<span class="noselect mdc-list-item__graphic material-icons">` + (memITL ? 'star_border' : 'star') + `</span>
							<span class="noselect mdc-list-item__text">` + (memITL ? 'Remove From Team Lead' : 'Make Team Lead') + `</span>
						</li>
						<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="teamsRemoveUser('` + id + `', '` + memId + `')">
							<span class="noselect mdc-list-item__graphic material-icons" style="color: red">remove</span>
							<span class="noselect mdc-list-item__text" style="color: red">Remove From Team</span>
						</li>
					</ul>
				</li>
			</ul>
		`;
	}
	return html[1] + html[0];
}
//  ----------------------------------------    -------------------------------------------------\\