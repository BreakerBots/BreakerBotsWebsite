// Admin View Approve User

new RegisteredTab("AV-AU", AV_AU_FInit, AV_AU_Init, null, false);

var ClearanceSnapshot;
var UsersSnapshot;
function AV_AU_FInit() {
	firebase.app().firestore().collection("users").onSnapshot(function (snap) {
		UsersSnapshot = snap;
		if (getHashParam('tab') == 'AV-AU') AV_AU_Draw();
		if (getHashParam('tab') == 'AV-MU') AV_MU_Draw();
	});
	firebase.app().firestore().collection("Clearance").onSnapshot(function (snap) {
		ClearanceSnapshot = snap;
		if (getHashParam('tab') == 'AV-AU') AV_AU_Draw();
		if (getHashParam('tab') == 'AV-MU') AV_MU_Draw();
	});
}

function AV_AU_Init() {
	AVSC.TabEnterCheck();
}

function AV_AU_Draw() {
	if (UsersSnapshot && ClearanceSnapshot) {
		html = '';

		UsersSnapshot.docs.forEach(function (item) {
			if (!findObjectByKey(ClearanceSnapshot.docs, "id", item.id)) {
				html += `
				<div class="breaker-layout__panel">
					<div class="mdc-card todo-card" style="min-height: 100px; background-color: rgba(255, 255, 255, 1)">
						<div style="display: flex; min-height: 100px; align-items: center; position: relative;">
							<div style="margin-left: 20px; width: calc(100% - 20px); top: 0; position: absolute;">
								<div class="demo-card__primary" style="width: 70%">
									<h2 class="demo-card__title mdc-typography--headline6">` + item.data().username + `</h2>
								</div>
								<div class="mdc-typography--body2" style="width: 70%;">` + item.data().email +`</div>
								<i onclick="afgt56('` + item.id + `')" class="noselect mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle" style="position: absolute; right: 5px; top: 1px;">
									<i class="material-icons" style="font-size: 200%;">person_add</i>
								</i>
							</div>
						</div>
					</div>
				</div>
				`;
			}
		});
		document.querySelector("#AV-AU-Empty").style.display = html == '' ? "flex" : "none"
		document.querySelector('#AV-AU-Wrapper').innerHTML = html;
		mdc.autoInit(document.querySelector('#AV-AU-Wrapper'));
	}
}

function afgt56(user) {
	firebase.app().firestore().collection("Clearance").doc(user).set({ a: 1, history: [{ changer: users.getCurrentUid(), from: null, to: 1 }] })
		.then(function () {
			//console.log("Verified ", user);
		})
		.catch(function (err) {
			//console.error(err);
		});
}