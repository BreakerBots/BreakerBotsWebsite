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
	try {
		if (SSSnap && getHashParam('tab') == "AV-SS") {
			var html = '';
			var dhtml = '';

			try {
				var minDate = new Date(document.querySelector('#AVSS-SD').value);
				var maxDate = new Date(document.querySelector('#AVSS-ED').value);
			} catch (err) { }

			if (!minDate)
				minDate = findObjectByKey(SSSnap.docs, "id", "Dummy").data().Default;
			if (!maxDate)
				maxDate = new Date();

			for (var i = 0; i < SSSnap.docs.length; i++) {
				try {
					var data = SSSnap.docs[i].data();
					var id = SSSnap.docs[i].id;
					var min = dateArrayToMinCD(data.history, minDate, maxDate);
					//Add User
					if (id != "Dummy") {
						html += `
						<tr onmouseenter="this.querySelector('.b').style.opacity = 1" onmouseleave="this.querySelector('.b').style.opacity = 0">
							<td>` + (data.name || users.getUser(id).name || "") + `</td>
							<td>` + (data.history.length % 2 != 0 ? "In" : "Out") + `</td>
							<td>` + Math.floor(min / 60) + "h " + Math.floor(min % 60) + "m" + `</td>\
							<td>
								<div style="opacity: 0; transition: opacity 0.4s cubic-bezier(.4, 0, .2, 1)" onclick="menu.toggle(this.parentNode.querySelector('.a').innerHTML, this, 'width: 200px')" class="mdc-icon-toggle material-icons b" data-mdc-auto-init="MDCIconToggle">more_vert</div>
								<div style="display: none;" class="a">
									<ul class="mdc-list">
										<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="AV_SS_AddHours('` + id + `'); menu.close();">
											<span class="noselect mdc-list-item__graphic material-icons">add</span>
											<span class="noselect mdc-list-item__text">Add Hours</span>
										</li>` +
										(data.name ? `
										<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick = "AV_SS_LinkToUser('` + id + `'); menu.close();" >
											<span class="noselect mdc-list-item__graphic material-icons">link</span>
											<span class="noselect mdc-list-item__text">Link Account</span>
										</li>` : ``) +
									`</ul>
								</div>
							</td>
						</tr>
						`;
					}
					//Add Dummy to end
					else {
						dhtml += `
						<tr style="border-top: 2px solid rgb(208, 208, 208); background: white" onmouseenter="this.querySelector('.b').style.opacity = 1" onmouseleave="this.querySelector('.b').style.opacity = 0">
							<td>Dummy</td>
							<td>` + (data.history.length % 2 != 0 ? "In" : "Out") + `</td>
							<td>` + Math.floor(min / 60) + "h " + Math.floor(min % 60) + "m" + `</td>
							<td>
								<div style="opacity: 0; transition: opacity 0.4s cubic-bezier(.4, 0, .2, 1)" onclick="menu.toggle(this.parentNode.querySelector('.a').innerHTML, this, 'width: 200px')" class="mdc-icon-toggle material-icons b" data-mdc-auto-init="MDCIconToggle">more_vert</div>
								<div style="display: none;" class="a">
									<ul class="mdc-list">
										<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="AV_SS_AddHours('` + id + `'); menu.close();">
											<span class="noselect mdc-list-item__graphic material-icons">add</span>
											<span class="noselect mdc-list-item__text">Add Hours</span>
										</li>
									</ul>
								</div>
							</td>
						</tr>
						`;
					}
				} catch (err) { console.error(err); }
			}
			document.querySelector('#AV-SS-Wrapper').innerHTML = AV_SS_AddTable(html + dhtml, minDate, maxDate);
			mdc.autoInit(document.querySelector('#AV-SS-Wrapper'));
			return true;
		}
	} catch (err) { console.error(err); return false; }
}

function AV_SS_LinkToUser(from) {
	try {
		var a = prompt('UID:');
		if (a) {
			if (!users.isUid(a))
				throw 'Invalid UID!';

			var h = findObjectByKey(SSSnap.docs, "id", from).data().history;
			if (!h)
				throw 'Failed to copy history!';
			var b = firebase.app().firestore().batch();
			var db = firebase.app().firestore().collection("SS");
			b.delete(db.doc(from));
			b.set(db.doc(a), { history: h });
			b.commit().then(function () {
				alert("Linked " + users.getUser(a).name);
			});
		}
		return;
	} catch (err) { alert(err); return; }
}

var AV_SS_AddHours_Target;
function AV_SS_AddHours(target) {
	AV_SS_AddHours_Target = target;
	ShiftingDialog.set({
		title: "Add Hours To ",
		id: "AVSSAH",
		submitButton: "Submit",
		cancelButton: "Cancel",
		contents:
			mainSnips.datetimepicker("AVSSAH-S", "First Date", "First Date", true, null, true) +
			mainSnips.datetimepicker("AVSSAH-E", "End Date", "End Date", true, null, true)
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("AVSSAH", function (c) {
	try {
		function vd(e) {
			try {
				e = c.querySelector('#AVSSAH-' + e);
				var d = new Date(e.value);
				if (d == "Invalid Date")
					throw "Invalid Date!";
				return d;
			} catch (err) {
				ShiftingDialog.throwFormError(err, e);
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}
		var s = vd('S');
		var e = vd('E');

		if (s && e) {
			var db = firebase.app().firestore().collection('SS').doc(AV_SS_AddHours_Target);
			db.get().then(function (doc) {
				var data = doc.data();
				data.history.push(s);
				data.history.push(e);

				db.set(data).then(function () {
					ShiftingDialog.close();
				})
			})
		}
		else
			return

	} catch (err) { console.error(err); }
});

function GetUserHours(uid, format) {
	try {
		var a = dateArrayToMinCD(findObjectByKey(SSSnap.docs, "id", uid).data().history, findObjectByKey(SSSnap.docs, "id", "Dummy").data().Default || new Date("1/1/2000"), new Date());
		if (format)
			a = Math.floor(a / 60) + "h " + Math.floor(a % 60) + "m";
		return a;
	} catch (err) { return; }
}

function dateArrayToMin(a) {
	var totalMinutes = 0;
	for (var i = 0; i < a.length; i += 2) {
		totalMinutes += Math.round(((a[i + 1] || new Date()).getTime() - a[i].getTime()) / 1000 / 60);
	}
	return totalMinutes;
}

function dateArrayToMinCD(a, minDate, maxDate) {
	var totalMinutes = 0;
	minDate.setHours(0, 0, 0, 0);
	maxDate.setHours(0, 0, 0, 0);
	for (var i = 0; i < a.length; i += 2) {
		var d = a[i + 1];
		if (d) {
			var m = Math.round(((a[i + 1] || new Date()).getTime() - a[i].getTime()) / 1000 / 60);
			d.setHours(0, 0, 0, 0);
			if (d >= minDate && d <= maxDate) {
				totalMinutes += m;
			}
		}
	}
	return totalMinutes;
}

function AV_SS_SignAllOut() {
	ShiftingDialog.set({
		id: "SignAllUserOut",
		title: "Sign All Users Out",
		contents: (
			mainSnips.datetimepicker("SignAllUserOutDateTime", "At Time", "The time to sign out all signed in users.", true, BreakerDate.formatDate(new Date(), true))
			),
		submitButton: 'Submit',
		cancelButton: 'Cancel'
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

function AV_SS_AddTable(html, minDate, maxDate) {
	return `
	<div class="material-table" style="height: 100%; overflow: auto; width: 100%;">
		<div style="overflow: auto; max-width: 100vw; width: 100%;">
			<div class="material-table--header" style="position: relative; overflow: auto; justify-content: space-around; min-width: 600px; border-bottom: solid 2px #DDDDDD;">
				<span class="material-table--title">Member's Hours</span>
				<div class="form-group" style="width: 20%; max-width: 300px; min-width: 140px; min-height: 40px; max-height: 40px; margin: 0 0 0 5%; display: flex">
					<i onclick="AV_SS_SaveDefaultStartDate(document.querySelector('#AVSS-SD').value)" aria-label="Set Default" aria-label-delay="0.1s" class="mdc-icon-toggle material-icons" data-mdc-auto-init="MDCIconToggle">save_alt</i>
					<input data-ondateclose="AV_SS_Draw()" id="AVSS-SD" onfocus="BreakerDate.open(this, false)" value="` + BreakerDate.formatDate(minDate, false) + `" type="text" class="form-control" placeholder="Start Date" autocomplete="off">
				</div>
				<div class="form-group" style="width: 20%; max-width: 300px; min-width: 140px; min-height: 40px; max-height: 40px; margin: 0 0 0 5%; display: flex">
					<input data-ondateclose="AV_SS_Draw()" id="AVSS-ED" onfocus="BreakerDate.open(this, false)" value="` + BreakerDate.formatDate(maxDate, false) + `" type="text" class="form-control" placeholder="End Date" autocomplete="off">
				</div>
				<i onclick="AV_SS_SignAllOut()" aria-label="Sign All User Out" aria-label-delay="0.2s" style="" class="mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle"><i style="font-size: 120%; transform: translate(1px, 1px);" class="material-icons">exit_to_app</i></i>
			</div>
		<div>
		<table style="width: 100%; min-width: 700px" class="striped">
			<thead style="border-bottom: 2px solid #d0d0d0;">
				<tr>
					<th>Name</th>
					<th>Status</th>
					<th>Time</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
			` + html + `
			</tbody>
		</table>
	</div>
	`;
}

function AV_SS_SaveDefaultStartDate(date) {
	var a = confirm('Are you sure you want to make ' + date + ' the default date for the entire Sign in/Sign out system? This affects all users!');
	if (a) {
		var db = firebase.app().firestore().collection("SS").doc("Dummy");
		db.get().then(function (doc) {
			try {
				var d = doc.data();
				cd = new Date(date);
				if (cd == "Invalid Date")
					throw "Invalid Date!";
				d.Default = cd;
				db.set(d).then(function () {
					alert('Set ' + date + ' as the default date for the entire Sign in/Sign out system');
				})
			} catch (err) {
				alert(err);
			}
		})
	}
}