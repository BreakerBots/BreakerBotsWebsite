new RegisteredTab("Parts-OrderHistory", null, PartsOrderHistoryInit, null, true);

function PartsOrderHistoryInit() {
	PartsOrderHistoryUpdateList();
	try {
		function a() {
			if (partsSnapshot)
				PartsOrderHistoryDraw();
			else
				setTimeout(a, 500);
		} a();
	} catch (err) { console.error(err); }
	showMainLoader(false);
} 

function PartsOrderHistoryDraw() {
	var html = '';

	var data = findObjectByKey(partsSnapshot.docs, "id", "OrderHistory").data().a;

	data.forEach(function (it) {
		try {
			var id = findObjectByKey(partsSnapshot.docs, "id", it.split('/')[0]).data().items[it.split('/')[1]];
			var pd = findObjectByKey(partsSnapshot.docs, "id", "Parts").data()[id.part];

			html += `
			<tr>
				<td style="width: 40px; padding-left: 25px !important; overflow: visible;">
					<div class="mdc-form-field">
						<div class="mdc-checkbox">
							<input onclick="PartsOrderHistoryUpdateList(this.checked, '` + it + `')" type="checkbox" class="mdc-checkbox__native-control"/>
							<div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" /></svg><div class="mdc-checkbox__mixedmark"></div></div>
						</div>
					</div>
				</td>
				<td>` + id.title + `</td>
				<td>` + pd.name + `</td>
				<td onmouseover="menu.open(\`` + FormatSD((id.sd || {} )) + `\`)" onmouseleave="menu.close();" style="cursor: pointer;" class="noselect">{ ... }</td>
				<td>` + pd.vendor + `</td>
				<td>` + id.quantity + `</td>
				<td>` + id.status + `</td>
				<td>` + id.priority + `</td>
			</tr>
			`;

			function FormatSD(obj) {
				var str = `
				<table style='margin: 10px'>
					<tbody>
				`;
				for (var i = 0; i < Object.keys(obj).length; i++) {
					str += `
					<tr style='margin: 2px 0 2px 0'>
						<td>` + Object.keys(obj)[i] + `</td>
						<td>` + obj[Object.keys(obj)[i]] + `</td>
					</tr>
					`;
				}
				str += `
					</tbody>
				</table>
				`;
				return str;
			}
		} catch (err) { console.error(err); }
	});

	document.querySelector('#Parts-OrderHistoryTBody').innerHTML = html;
}

var PartsOrderHistorySelectedList = [];
function PartsOrderHistoryUpdateList(add, id) {
	try {
		if (add != undefined && id != undefined) {
			if (add) {
				PartsOrderHistorySelectedList.push(id);
			}
			else {
				PartsOrderHistorySelectedList.remove(id);
			}
		}
		else {
			PartsOrderHistorySelectedList = [];
		}


		document.querySelector('#Parts-OrderHistoryHeader').style.height = (PartsOrderHistorySelectedList.length > 0) ? '48px' : '0px';
		document.querySelector('#Parts-OrderHistoryHeaderText').innerHTML = (PartsOrderHistorySelectedList.length || 0) + " Selected";
	} catch (err) { console.error(err); }
}

function PartsOrderHistoryMarkArrived() {
	ShiftingDialog.confirm('Confirm Arrival', 'Are you sure you want to mark these items as arrived. Your account will be recorded as making this change.', function (a) {
		if (a) {
			var l = PartsOrderHistorySelectedList;
			var d = {
				date: new Date(),
				marker: users.getCurrentUid()
			};

			var b = firebase.app().firestore().batch();
			var db = firebase.app().firestore().collection('Parts');
			var dbr = {};
			l.forEach(function (it) {
				if (!dbr[it.split('/')[0]])
					dbr[it.split('/')[0]] = findObjectByKey(partsSnapshot.docs, "id", it.split('/')[0]).data();
				dbr[it.split('/')[0]].items[it.split('/')[1]].ar = d;
				dbr[it.split('/')[0]].items[it.split('/')[1]].status = 4;
				b.set(db.doc(it.split('/')[0]), dbr[it.split('/')[0]]);
			});
			b.commit().then(function () {
				window.location.reload();
			});
		}
	});
}