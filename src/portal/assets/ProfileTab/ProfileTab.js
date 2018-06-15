//ProfileTab.js

var ProfileTab = new RegisteredTab("Profile", null, ProfileTabInit, ProfileTabExit, true, "profile");
addHashVariableListener('profile', ProfileTabInit);

//  ----------------------------------------  Setting Data  ----------------------------------------  \\
var ProfileTabViewing;
function ProfileTabInit() {
	try {
		if (getHashParam('tab') == "Profile") {
			authLoadedFullWait(function () { // Wait for AuthAPI
				TeamsAPIWait(function () { // TeamsAPI 
					//Reroute
					var vid = (getHashParam("profile") == "this") ? users.getCurrentUid() : getHashParam("profile");
					ProfileTabViewing = vid;
					var isSelf = (vid == users.getCurrentUid());
					var userdata = users.getUser(vid);

					if (vString(userdata.avatar)) document.querySelector(".ProfileTabJI-Avatar").src = userdata.avatar;
					SetProfileVarible("Name", userdata.name);
					SetProfileVarible("Role", userdata.role);
					SetProfileVarible("Desc", userdata.desc);
					SetProfileVarible("Username", userdata.username, true);
					SetProfileVarible("Clearance", userdata.clearance, true);
					SetProfileVarible("Teams", (formatTeamArray(teams.getTeams(vid))), true, true);
					SetProfileVarible("Grade", userdata.grade, true);
					SetProfileVarible("Slack", userdata.slack, true);
					SetProfileVarible("Github", userdata.github, true);
					SetProfileVarible("Phone", userdata.phone, true);
					SetProfileVarible("Email", userdata.email, true);

					var ProfileAvatarEditorButton = document.querySelector('.ProfileTabJI-AvatarEditor');
					if (isSelf) {
						ProfileTabSettingsFab.tabSwitch();
						ProfileAvatarEditorButton.classList.add('ProfileTab-AvatarEditor--Editing');
						ProfileAvatarEditorButton.setAttribute('onclick', `ProfileChangeAvatar('` + vid + `')`);
					}
					else {
						ProfileTabSettingsFab.tabExit();
						ProfileAvatarEditorButton.classList.remove('ProfileTab-AvatarEditor--Editing');
						ProfileAvatarEditorButton.setAttribute('onclick', ``);
					}
					
					try {
						var tasks = TodoWorkerSearchEngine.search(userdata.username);
						var html = '';
						tasks.forEach(function (item) {
							if (item.status == 1 && (item.people.indexOf(userdata.username) != -1)) {
								html += `
								<div class="breaker-layout__panel">
									<div class="mdc-card" style="min-height: 65px; padding-bottom: 10px; position: relative; background-color: rgba(` + (item.status == 4 ? '190, 190, 190' : '255, 255, 255') + `, 1)">
										<div style="margin-left: 20px; min-height: 65px;">
											<div class="demo-card__primary" style="width: 70%">
												<h2 class="demo-card__title mdc-typography--headline6">` + (item.title) + `</h2>
											</div>
											<div class="demo-card__secondary mdc-typography--body2" style="width: 85%; font-size: .95rem; font-weight: 500; transform: translate(7px, -10px);">` + item.people + `</div>
											<div class="demo-card__secondary mdc-typography--body2" style="width: 85%">` + item.desc + `</div>
											<div class="demo-card__secondary mdc-typography--body2" style="width: 85%; background: rgba(252, 173, 37, 0.3);">` + MSN(item.reason) + `</div>
											<i class="noselect material-icons mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle" style="position: absolute; right: 8px; top: 8px;"> <img style="transform: translate(-5px, -5.5px)" src="` + TodoGetTaskStatus(Number(item.status)) + `"/> </i>
										</div>
									</div>
								</div>
								`;
							}
						});
						document.querySelector(".ProfileTabJI-Tasks").innerHTML = html;
					} catch (err) { }

					document.querySelector('#Profile').style.opacity = 1;
					showMainLoader(false);
				});
			});
		}
	} catch (err) { }
}
var ProfileTabSettingsFab = new FabHandler(document.querySelector('#ProfileTabSettingsFab'));
function ProfileTabExit() {
	ProfileTabSettingsFab.tabExit();
}
//  ----------------------------------------    ----------------------------------------  \\





//  ----------------------------------------  API  ----------------------------------------  \\
var ProfileTabAPI = new class ProfileTabAPI {
	getLink(uid) {
		try {
			return `setHashParam('profile', '` + uid + `'); setHashParam('tab', 'Profile');`;
		} catch (err) { return; }
	}
}
//  ----------------------------------------    ----------------------------------------  \\





//  ----------------------------------------  Other  ----------------------------------------  \\
function formatTeamArray(a) {
	try {
		var ret = "";
		a.forEach(function (tmId, i, arr) {
			var tm = teams.getData(tmId).name;
			ret += tm;
			if (i != arr.length - 1 && arr.length > 2) ret += ", ";
			if (i == arr.length - 2) { ret += (arr.length > 2 ? "" : " ") + "and "; }
		});
		return ret;
	} catch (err) { console.log(err); return null; }
}

function vString(str) {
	try {
		if (str)
			if (str != "")
				return true;
			else return false;
	} catch (err) { return; }
}

function SetProfileVarible(id, to, hidePar, useTooltip) {
	try {
		if (vString(to)) {
			if (hidePar) document.querySelector(".ProfileTabJI-" + id).parentNode.style.display = "";
			if (useTooltip) document.querySelector(".ProfileTabJI-" + id).setAttribute('aria-label', to);
			else document.querySelector(".ProfileTabJI-" + id).removeAttribute('aria-label');
			document.querySelector(".ProfileTabJI-" + id).innerHTML = to;
		}
		else {
			if (hidePar) document.querySelector(".ProfileTabJI-" + id).parentNode.style.display = "none";
			document.querySelector(".ProfileTabJI-" + id).removeAttribute('aria-label');
		}
		return true;
	} catch (err) { return false; }
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Change Avatar  ----------------------------------------  \\
var ProfileTabChangeAvatarHandler;
function ProfileChangeAvatar(pid) {try { if (users.getCurrentUid() == pid) { var rlId = "PCAUE--" + guid(); ShiftingDialog.set("ProfileTabChangeAvatar", "Change Avatar", "Submit", "Cancel", '<div style="width: 100%; height: 100%;" id="' + rlId + '"></div>', !1, !0); ShiftingDialog.open(); ShiftingDialog.enableSubmitButton(!1); ProfileTabChangeAvatarHandler = new AvatarEditor(document.querySelector("#" + rlId), function () { "ProfileTabChangeAvatar" == ShiftingDialog.currentId && ShiftingDialog.enableSubmitButton(!0) }) } } catch (a) { };}
ShiftingDialog.addSubmitListener("ProfileTabChangeAvatar", function () {try{if(users.getCurrentUid()==ProfileTabViewing)var rt=ProfileTabChangeAvatarHandler.get(function(c){fetch(c).then(function(b){return b.blob()}).then(function(b){firebase.storage().ref("Avatars/"+users.getCurrentUid()).put(b).on("state_changed",function(a){},function(a){},function(){ShiftingDialog.close();HardRefreshHeaderAvatar();getAvatarUrl(users.getCurrentUid(),function(a){a&&ProfileTabViewing==users.getCurrentUid()&&(document.querySelector(".ProfileTabJI-Avatar").src=a,allUsers[users.getCurrentUid]=a)})})})});rt||(ShiftingDialog.throwFormError("Please Select An Image"),ShiftingDialog.enableSubmitButton(!0))}catch(c){};});
//  ----------------------------------------    ----------------------------------------  \\