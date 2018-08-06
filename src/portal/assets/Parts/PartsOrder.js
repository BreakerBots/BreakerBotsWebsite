new RegisteredTab("Parts-Order", null, PartsOrderInit, null, false);

function PartsOrderInit() {
	PartsOrderUpdateList();
	try {
		function a() {
			if (partsSnapshot)
				PartsOrderDraw();
			else
				setTimeout(a, 500);
		} a();
	} catch (err) { }
}

function PartsOrderDraw() {
	var html = '';
	partsSnapshot.docs.forEach(function (doc) {
		try {
			var data = doc.data();
			if (data.items) {
				for (var i = 0; i < Object.keys(data.items).length; i++) {
					var itemData = data.items[Object.keys(data.items)];
					if (itemData.status == 1) {
						html += PartsOrderHTML(doc.id + '/' + Object.keys(data.items), itemData, findObjectByKey(partsSnapshot.docs, "id", "Parts").data()[itemData.part]);
					}
				}
			}
		} catch (err) { }
	});
	document.querySelector('#Parts-OrderTBody').innerHTML = html;
	window.mdc.autoInit(document.querySelector('#Parts-OrderTBody'));
}

function PartsOrderHTML(iid, id, pd) {
	return `
	<tr>
		<td style="width: 40px; padding-left: 25px !important; overflow: visible;">
			<div class="mdc-form-field">
				<div class="mdc-checkbox" data-mdc-auto-init="MDCCheckbox">
					<input onclick="PartsOrderUpdateList(this.parentNode.MDCCheckbox.checked, '` + iid + `', '` + (pd.vendor.replace(' ', '-') || "") + `')" type="checkbox" class="mdc-checkbox__native-control"/>
					<div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" /></svg><div class="mdc-checkbox__mixedmark"></div></div>
				</div>
			</div>
		</td>
		<td style="min-width: 100px;">` + (id.title    || "") + `</td>
		<td style="min-width: 100px;"><a ` + ((stringUnNull(pd.url) != "") ? (`style="text-decoration: underline; color: blue !important;" href="` + (pd.url || "") + `" target="_blank">`) : ('>')) + (pd.name || "") + `</a></td>
		<td style="min-width: 100px;">` + (pd.vendor   || "") + `</td>
		<td style="min-width: 100px;">` + (id.quantity || "") + `</td>
		<td style="min-width: 100px;">` + (id.priority || "") + `</td>
		<td style="min-width: 100px;">` + (id.od       || "") + `</td>
		<td style="min-width: 100px;">` + (pd.od       || "") + `</td>
	</tr>
	`;
}

var PartsOrderSelectedList = [];
var PartsOrderSelectedVendor = null;
function PartsOrderUpdateList(add, id, vendor) {
	try {
		if (add != undefined && id != undefined) {
			if (add) {
				PartsOrderSelectedList.push(id);
				if (PartsOrderSelectedVendor != vendor && PartsOrderSelectedVendor != null)
					alert(`You are choosing from two vendors! Orders can only have one vendor. Though if one item can be bought from two vendors you can order them together.`);
				PartsOrderSelectedVendor = vendor;
			}
			else {
				PartsOrderSelectedList.remove(id);
				if (PartsOrderSelectedList.length == 0)
					PartsOrderSelectedVendor = null;
			}
		}
		else {
			PartsOrderSelectedList = [];
			PartsOrderSelectedVendor = null;
		}


		document.querySelector('#Parts-OrderHeader').style.height = (PartsOrderSelectedList.length > 0) ? '48px' : '0px';
		document.querySelector('#Parts-OrderHeaderText').innerHTML = (PartsOrderSelectedList.length || 0) + " Selected";
	} catch (err) { console.error(err); }
}




//  ----------------------------------------  Order  ----------------------------------------  \\
function PartsOrderCreateOrder() {
	try {
		var html = '';

		PartsOrderSelectedList.forEach(function (item) {
			try {
				var id = findObjectByKey(partsSnapshot.docs, "id", item.split('/')[0]).data().items[item.split('/')[1]];
				var pd = findObjectByKey(partsSnapshot.docs, "id", "Parts").data()[id.part];

				html += `
				<tr>
					<td style="width: 40px; padding-left: 25px !important; overflow: visible;">
						<div class="mdc-form-field">
							<div class="mdc-checkbox" data-mdc-auto-init="MDCCheckbox">
								<input onclick="" type="checkbox" class="mdc-checkbox__native-control"/>
								<div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" /></svg><div class="mdc-checkbox__mixedmark"></div></div>
							</div>
						</div>
					</td>
					<td style="min-width: 100px;">` + (id.title || "") + `</td>
					<td style="min-width: 100px;"><a ` + ((stringUnNull(pd.url) != "") ? (`style="text-decoration: underline; color: blue !important;" href="` + (pd.url || "") + `" target="_blank">`) : ('>')) + (pd.name || "") + `</a></td>
					<td style="min-width: 100px;">` + (pd.vendor || "") + `</td>
					<td style="min-width: 100px;">` + (id.quantity || "") + `</td>
					<td style="min-width: 100px;">` + (id.priority || "") + `</td>
					<td style="min-width: 100px;">` + (id.od || "") + `</td>
					<td style="min-width: 100px;">` + (pd.od || "") + `</td>
				</tr>
				`
			} catch (err) { console.error(err); }
		});

		html = `
		<div class="material-table" style="">
			<table style="min-width: 800px; overflow-x: scroll !important;">
				<thead>
					<tr>
						<th style="width: 40px;"></th>
						<th style="min-width: 100px;">Item</th>
						<th style="min-width: 100px;">Part</th>
						<th style="min-width: 100px;">Vendor</th>
						<th style="min-width: 100px;">Quantity</th>
						<th style="min-width: 100px;">Priority</th>
						<th style="min-width: 100px;">Item OD</th>
						<th style="min-width: 100px;">Part OD</th>
					</tr>
				</thead>
				<tbody>
					` + html + `			
				</tbody>
			</table>
			<br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
		</div>
	`;

		ShiftingDialog.set({
			id: "PartsOrder",
			title: "Order Items",
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnEsc: true,
			forceFullscreen: true,
			contents:
				html +
				mainSnips.textField("PartsOrder-ON", "Order Number") + 
				mainSnips.textField("PartsOrder-OD", "Order Date", "", null, null, null, new Date().toLocaleDateString()) +
				mainSnips.textFieldAutoComplete("PartsOrder-SM", "Shipping Method", "", ["UPS", "US Mail", "FedEx"], null, true) +
				mainSnips.textField("PartsOrder-EA", "Est. Arrival", "") +
				mainSnips.textField("PartsOrder-O", "Other", "Other data")
		});
		ShiftingDialog.open();
	} catch (err) { console.error(err); }
}
ShiftingDialog.addSubmitListener("PartsOrder", function (c) {
	function gd(n) { return c.querySelector('#PartsOrder-' + n).value || ""; }
	var ON = gd('ON');
	var OD = gd('OD');
	var SM = gd('SM');
	var EA = gd('EA');
	var O = gd('O');

	var l = PartsOrderSelectedList;
	var d = {
		OrderNumber: ON,
		OrderDate: new Date(OD),
		ShippingMethod: SM,
		EstArrival: EA,
		Other: O
	};

	var b = firebase.app().firestore().batch();
	var db = firebase.app().firestore().collection('Parts');
	var dbr = {};
	var dbroh;
	l.forEach(function (it) {
		if (!dbr[it.split('/')[0]])
			dbr[it.split('/')[0]] = findObjectByKey(partsSnapshot.docs, "id", it.split('/')[0]).data();
		dbr[it.split('/')[0]].items[it.split('/')[1]].sd = d;
		dbr[it.split('/')[0]].items[it.split('/')[1]].status = 2;
		b.set(db.doc(it.split('/')[0]), dbr[it.split('/')[0]]);

		if (!dbroh)
			dbroh = findObjectByKey(partsSnapshot.docs, "id", "OrderHistory").data().a;
		dbroh.push(it);
	});
	b.set(db.doc('OrderHistory'), { a: dbroh });
	b.commit().then(function () {
		window.location.reload();
	});
});
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Other  ----------------------------------------  \\
function PartsOrderNavOpen() {
	if (users.getCurrentClearance() >= 3)
		toggleNavSubMenu('#OrdersSubmenu');
	else
		setHashParam('tab', 'Parts-OrderHistory')
}
//  ----------------------------------------    ----------------------------------------  \\