// Admin View Sign In/Sign Out

new RegisteredTab("AV-SS", null, AV_SS_Init, null, false);

function AV_SS_Init() {
	AVSC.TabEnterCheck();
	AV_SS_Draw();
}
var SSSnap;
window.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("SS").onSnapshot(function (snapshot) {
		SSSnap = snapshot;
		AV_SS_Draw();
	});
});

function AV_SS_Draw() {
	if (SSSnap && getHashParam('tab') == "AV-SS") {
		var totalMin = 0;
		var html = '';
		for (var i = 0; i < SSSnap.docs.length; i++) {
			var data = SSSnap.docs[i].data();
			var min = AV_SS_FindTotalHours(data.history);
			totalMin += min;
			html += `
			<tr>
				<td>` + data.name + `</td>
				<td>` + (data.history.length % 2 != 0 ? "In" : "Out") + `</td>
				<td>` + Math.floor(min / 60) + "h " + Math.floor(min % 60) + "m" + `</td>
			</tr>
			`;
		}
		html += `
		<tr style="border-top: 1px solid rgb(208, 208, 208);">
			<td>Total</td>
			<td></td>
			<td>` + Math.floor(totalMin / 60) + "h " + Math.floor(totalMin % 60) + "m" + `</td>
		</tr>
		`;
		document.querySelector('#AV-SS-Wrapper').innerHTML = AV_SS_AddTable(html);
		mdc.autoInit(document.querySelector('#AV-SS-Wrapper'))
	}
}

function AV_SS_FindTotalHours(a) {
	var totalMinutes = 0;
	for (var i = 0; i < a.length; i += 2) {
		totalMinutes += Math.round(((a[i + 1] || new Date()).getTime() - a[i].getTime()) / 1000 / 60);
	}
	return totalMinutes;
}

function AV_SS_SignAllOut() {
	ShiftingDialog.set({
		id: "SignAllUserOut",
		title: "Sign All Users Out",
		contents: (`
		<div class="form-group" style="width: 90%; min-height: 65px; max-height: 75px; border-radius: 2px;">
			<label>Sign Out At</label>
			<input type="text" id="SignAllUserOutDateTime" value="" placeholder="A Date/Time To Sign Users Out" class="form-control datetimepicker">
			<div class="autocomplete-items"></div>
		</div>
		`),
		submitButton: 'Submit',
		cancelButton: 'Cancel'
	});
	$('#SignAllUserOutDateTime').datetimepicker({
		autoclose: true,
		pick12HourFormat: false,
		minView: 0
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("SignAllUserOut", function (c) {
	try {
		var date = new Date(c.querySelector('#SignAllUserOutDateTime').value);
		var batch = firebase.app().firestore().batch();
		if (SSSnap) {
			for (var i = 0; i < SSSnap.docs.length; i++) {
				var data = SSSnap.docs[i].data();
				if (data.history.length % 2 != 0) {
					data.history.push(date);
					batch.set(firebase.app().firestore().collection("SS").doc(SSSnap.docs[i].id), data);
				}
			}
		}
		batch.commit().then(function () {
			ShiftingDialog.close();
		});
	} catch (err) { console.error('Caught', err); ShiftingDialog.throwFormError('Invalid Date', document.querySelector('#SignAllUserOutDateTime')) }
});

function AV_SS_AddTable(html) {
	return `
	<div class="material-table" style="height: 100%">
		<div class="material-table--header" style="position: relative;">
			<span class="material-table--title">Member's Hours</span>
			<i onclick="AV_SS_SignAllOut()" aria-label="Sign All User Out" aria-label-delay="0.2s" style="position: absolute; top: 4px; right: 4px;" class="mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle"><i style="font-size: 120%; transform: translate(1px, 1px);" class="material-icons">exit_to_app</i></i>
		</div>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Status</th>
					<th>Time</th>
				</tr>
			</thead>
			<tbody>
			` + html + `
			</tbody>
		</table>
	</div>
	`;
}