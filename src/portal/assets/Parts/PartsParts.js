
new RegisteredTab("Parts-Parts", PartsPartsFirstInit, PartsPartsInit, PartsPartsExit, true, 'PartsPartsTab');

function PartsPartsFirstInit() {
	PartsPartsTabBar = new mdc.tabs.MDCTabBarScroller(document.querySelector('.Parts-Parts-Tabs'));
}

var PartsPartsFab = new FabHandler(document.querySelector('#Parts-Parts-Fab'));
PartsPartsFab.addListener(function () {
	switch (PartsPartsCTAB) {
		case 0:
			PartsCreateNewPart();
			break;
		case 1:
			PartsCreateNewManu()
			break;
		case 2:
			PartsCreateNewUnit()
			break;
	};
});
function PartsPartsInit() {
	PartsPartsChangeTab();
	PartsPartsFab.tabSwitch();
	showMainLoader(false);
}

function PartsPartsExit() {
	PartsPartsFab.tabExit();
}

addHashVariableListener('PartsPartsTab', PartsPartsChangeTab);
var PartsPartsCTAB;
function PartsPartsChangeTab() {
	//Hide Old Tab
	[].forEach.call(document.querySelectorAll('.Parts-Parts-Tab--Active'), function (item) {
		item.classList.remove('Parts-Parts-Tab--Active');
	});

	//Show the new One
	var tab = 0;
	try {
		document.querySelector('.Parts-Parts-Tab--' + (getHashParam('PartsPartsTab') || "0")).classList.add('Parts-Parts-Tab--Active');
		PartsPartsTabBar.tabBar.setActiveTabIndex_(Number(getHashParam('PartsPartsTab') || "0"));
		tab = Number(getHashParam('PartsPartsTab') || "0");
	} catch (err) {
		setHashParam('PartsPartsTab', 0);
		tab = 0;
	}
	try {
		function a() {
			if (partsSnapshot) {
				switch (tab) {
					case 0:
						PartsPartsDrawParts();
						break;
					case 1:
						PartsPartsDrawManu();
						break;
					case 2:
						PartsPartsDrawUnits();
						break;
				};
				PartsPartsCTAB = tab;
			}
			else
				setTimeout(a, 1000);
		} a();
	} catch (err) { console.error(err) }
}


//  ----------------------------------------  Parts  ----------------------------------------  \\
function PartsPartsDrawParts() {
	var at = document.querySelector('.Parts-Parts-Tab--0').querySelector('tbody');
	var a = findObjectByKey(partsSnapshot.docs, "id", "Parts").data();
	var af = ppsort(a, PartsPartsSortingBy, PartsPartsSortingReverse, " <Breaker-ID> ");
	var b = findObjectByKey(partsSnapshot.docs, "id", "PartsUnv").data();
	var html = ``;

	for (var i = 0; i < af.length; i++) {
		var n = af[i].split(' <Breaker-ID> ')[1];
		var d = a[n];
		html += `
			<tr ` + (i % 2 ? ` style="background-color: rgb(230, 230, 230)"` : ``) + `>
				<td>` + d.name + `</td>
				<td>` + d.vendor + `</td>
				<td>` + d.price + `</td>
				<td>` + d.unit + `</td>
				<td>` + d.pn + `</td>
				<td>` + d.url + `</td>
				<td>` + d.image + `</td>
				<td>` + d.other + `</td>
				<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
					<i data-mdc-auto-init="MDCIconToggle" class="mdc-icon-toggle material-icons" onclick="menu.toggle(this.parentNode.parentNode.querySelector('div').innerHTML, this.parentNode, 'width: 160px;')" role="button" aria-pressed="false">more_vert</i>
					<div style="display: none">
						<ul class="mdc-list">
							<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="PartsPartsEdit('` + n + `'); menu.close();">
								<span class="noselect mdc-list-item__graphic material-icons">edit</span>
								<span class="noselect mdc-list-item__text">Edit</span>
							</li>
							<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="PartsPartsDelete('` + n + `'); menu.close();">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Delete</span>
							</li>
						</ul>
					</div>
				</td>
			</tr>
		`;
	}

	for (var i = 0; i < Object.keys(b).length; i++) {
		var n = Object.keys(b)[i];
		var d = b[n];
		html += `
			<tr style="background-color: rgb(255, 200, 200)">
				<td>` + d.name + `</td>
				<td>` + d.vendor + `</td>
				<td>` + d.price + `</td>
				<td>` + d.unit + `</td>
				<td>` + d.pn + `</td>
				<td>` + d.url + `</td>
				<td>` + d.image + `</td>
				<td>` + d.other + `</td>
				<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
					<i data-mdc-auto-init="MDCIconToggle" class="mdc-icon-toggle material-icons" onclick="menu.toggle(this.parentNode.querySelector('div').innerHTML, this.parentNode, 'width: 160px;')" role="button" aria-pressed="false">more_vert</i>
					<div style="display: none">
						<ul class="mdc-list">
							<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="PartsPartsUApprove('` + n + `'); menu.close();">
								<span class="noselect mdc-list-item__graphic material-icons">check</span>
								<span class="noselect mdc-list-item__text">Approve</span>
							</li>
							<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="PartsPartsUDelete('` + n + `'); menu.close();">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Delete</span>
							</li>
						</ul>
					</div>
				</td>
			</tr>
		`;
	}

	at.innerHTML = html;
	window.mdc.autoInit(at);

	function ppsort(t, b, rev, s) {
		var r = [];
		for (var i = 0; i < Object.keys(t).length; i++) {
			var id = Object.keys(t)[i];
			var data = t[Object.keys(t)[i]];
			r.push(data[b] + s + id);
		}
		r.sort();
		if (rev)
			r.reverse();
		return r;
	}
}
var PartsPartsSortingBy = "name";
var PartsPartsSortingReverse = false;
function PartsPartsSortBy(target, el) {
	PartsPartsSortingBy = target;

	var c = el.querySelector('i');
	if (c.classList.contains('active')) {
		c.innerHTML = ((c.innerHTML == "arrow_upward") ? "arrow_downward" : "arrow_upward")
	}
	else {
		el.parentNode.querySelector('.active').classList.remove('active');
		c.classList.add('active');
	}

	PartsPartsSortingReverse = (c.innerHTML == "arrow_downward");

	PartsPartsDrawParts();
}
var PartsPartsChangeTarget;
function PartsPartsDelete(item) {
	try {
		PartsPartsChangeTarget = item;
		var itemData = findObjectByKey(partsSnapshot.docs, "id", "Parts").data()[item];
		ShiftingDialog.set({
			id: "PartsPartsDelete",
			title: "Delete Part",
			submitButton: "Yes",
			cancelButton: "No",
			contents:
				mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
				`<div style="width: 100%"></div>` +
				`<h1 style="text-align: center;"> Are you sure you want to delete the ` + itemData.name + `? <br> This action cannot be undone.</h1>`
			, centerButtons: true
		});
		ShiftingDialog.open();
	} catch (err) { console.error(err) }
}
ShiftingDialog.addSubmitListener("PartsPartsDelete", function (c) {
	try {
		firebase.app().firestore().collection("Parts").doc("Parts").get().then(function (doc) {
			var data = doc.data();
			delete data[PartsPartsChangeTarget]
			firebase.app().firestore().collection("Parts").doc("Parts").set(data).then(function (doc) {
				ShiftingDialog.close();
				PartsPartsDrawParts();
			});
		});
	} catch (err) { console.error(err) }
});
function PartsPartsEdit(item) {
	try {
		PartsPartsChangeTarget = item;
		var itemData = findObjectByKey(partsSnapshot.docs, "id", "Parts").data()[item];

		var d = findObjectByKey(partsSnapshot.docs, "id", "MAN_UN").data();
		var MANU = d.MANU;
		var UNITS = d.UNITS;
		ShiftingDialog.set({
			id: "PartsEditPart",
			title: "Edit ",
			submitButton: (users.getCurrentClearance() >= 2 ? "Submit" : "Request"),
			cancelButton: "Cancel",
			forceFullscreen: true,
			contents:
				mainSnips.textField("EditPart_Name", "Name", "A Short Name of The Part", null, null, true, (itemData.name || "")) +
				mainSnips.textField("EditPart_Url", "Url", "A Url to the Part", "url", null, false, (itemData.url || "")) +
				mainSnips.textFieldAutoComplete("EditPart_Vendor", "Vendor", "The Vendor of the Part", MANU, '', true, (itemData.vendor || "")) +
				mainSnips.textField("EditPart_PartNumber", "Part Number", "The Part Number for the Part", null, null, false, (itemData.pn || "")) +
				mainSnips.textField("EditPart_OD", "Ordering Data", "Any information on ordering the part", null, null, false, (itemData.od || "")) + 
				mainSnips.textField("EditPart_Image", "Image", "A Url To An Image (Right-Click on Image and Press 'Copy image address')", "url", null, false, (itemData.image || "")) +
				mainSnips.textFieldAutoComplete("EditPart_Unit", "Unit", "The Unit for this item (Bags, Pounds, Each, Feet...)", UNITS, '', true, (itemData.unit || "")) +
				`<div class="form-group" style="width: 90%; min-height: 65px; max-height: 73px;" >
					<label  for="EditPart_Price" >Price ($)</label>
					<input  id="EditPart_Price" required  type="number" step="0.01" min="0" max="10000" value="` + (itemData.price || "") + `" class="form-control" placeholder="The Price Per Unit of the Part" autocomplete="off">
				</div>` +
				mainSnips.textField("EditPart_Other", "Other", "Other Important Data About the Part", null, null, false, (itemData.other || ""))
		});
		ShiftingDialog.open();

	} catch (err) { console.error(err) }
}
ShiftingDialog.addSubmitListener("PartsEditPart", function (c) {
	try {
		function gd(n) { return c.querySelector('#EditPart_' + n); }

		//Get Data
		var name = gd("Name").value;
		var url = gd("Url").value;
		var vendor = gd("Vendor").value;
		var pn = gd("PartNumber").value;
		var unit = gd("Unit").value;
		var price = gd("Price").value;
		var other = gd("Other").value;
		var image = gd("Image").value;
		var od = gd("OD").value;

		//Validation
		if (vendor == "" && url == "") {
			ShiftingDialog.throwFormError("You Need Either A Url or A Vendor", gd("Url"));
			ShiftingDialog.enableSubmitButton(true);
			return;
		}

		//Database
		firebase.app().firestore().collection("Parts").doc("Parts").get()
			.then(function (doc) {
				var data = doc.data();

				data[PartsPartsChangeTarget] = {
					name: name,
					url: url,
					vendor: vendor,
					pn: pn,
					unit: unit,
					price: price,
					other: other,
					image: image,
					od: od
				}

				firebase.app().firestore().collection("Parts").doc("Parts").set(data)
					.then(function (doc) {
						ShiftingDialog.close();
						PartsPartsDrawParts();
					})
					.catch(function (e) {
						throw e;
					})
			})
			.catch(function (e) {
				throw e;
			})
	} catch (err) { console.error(err); ShiftingDialog.alert('Unknown Error', "An Unknown Error Has Occured"); ShiftingDialog.enableSubmitButton(true); return; }
});
function PartsPartsUDelete(item) {
	try {
		PartsPartsChangeTarget = item;
		var itemData = findObjectByKey(partsSnapshot.docs, "id", "PartsUnv").data()[item];
		ShiftingDialog.set({
			id: "PartsPartsUDelete",
			title: "Delete Part Request",
			submitButton: "Yes",
			cancelButton: "No",
			contents:
				mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
				`<div style="width: 100%"></div>` +
				`<h1 style="text-align: center;"> Are you sure you want to delete the request for the ` + itemData.name + `?</h1>`
			, centerButtons: true
		});
		ShiftingDialog.open();
	} catch (err) { console.error(err) }
}
ShiftingDialog.addSubmitListener("PartsPartsUDelete", function (c) {
	try {
		firebase.app().firestore().collection("Parts").doc("PartsUnv").get().then(function (doc) {
			var data = doc.data();
			delete data[PartsPartsChangeTarget]
			firebase.app().firestore().collection("Parts").doc("PartsUnv").set(data).then(function (doc) {
				ShiftingDialog.close();
				PartsPartsDrawParts();
			});
		});
	} catch (err) { console.error(err) }
});
function PartsPartsUApprove(item) {
	try {
		firebase.app().firestore().collection("Parts").doc("PartsUnv").get().then(function (doc) {
			var data = doc.data();
			var PartData = data[item];
			delete data[item]
			firebase.app().firestore().collection("Parts").doc("PartsUnv").set(data).then(function (doc) {
				firebase.app().firestore().collection("Parts").doc("Parts").get().then(function (doc) {
					var data = doc.data();

					//Find a unused id
					var AIDs = guid();
					while (data[AIDs] != undefined) {
						AIDs = guid();
					}

					data[AIDs] = PartData;

					firebase.app().firestore().collection("Parts").doc("Parts").set(data)
						.then(function (doc) {
							ShiftingDialog.close();
							PartsPartsDrawParts();
						})
						.catch(function (e) {
							throw e;
						});
				});
			});
		});
	} catch (err) { console.error(err) }
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Manu  ----------------------------------------  \\
function PartsPartsDrawManu() {
	var at = document.querySelector('.Parts-Parts-Tab--1').querySelector('tbody');
	var a = findObjectByKey(partsSnapshot.docs, "id", "MAN_UN").data().MANU;
	var html = ``;

	a.forEach(function (item, i, a) {
		html += `
			<tr ` + (i % 2 ? `style="background-color: rgb(230, 230, 230)"` : ``) + `>
				<td>` + item + `</td>` + 
				((users.getCurrentClearance() > 1) ?
				`<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
					<i data-mdc-auto-init="MDCIconToggle" class="mdc-icon-toggle material-icons" onclick="menu.toggle(this.parentNode.parentNode.querySelector('div').innerHTML, this.parentNode, 'width: 210px;')" role="button" aria-pressed="false">more_vert</i>
					<div style="display: none">
						<ul class="mdc-list">
							<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="PartsPartsDeleteManu('` + item + `'); menu.close();">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Permanent Delete</span>
							</li>
						</ul>
					</div>
				</td>` : ``) +
			`</tr>
		`
	});

	at.innerHTML = html;
	window.mdc.autoInit(at);
}
function PartsCreateNewManu() {
	ShiftingDialog.set({
		id: "PartsCreateNewManu",
		title: "Create New Manufacturer",
		submitButton: "Submit",
		cancelButton: "Cancel",
		contents:
			mainSnips.textField("PartsCreateName", "Name", "The Name of the Manufacturer", null, null, true)
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("PartsCreateNewManu", function (c) {
	var name = c.querySelector('#PartsCreateName').value;
	firebase.app().firestore().collection("Parts").doc("MAN_UN").get().then(function (doc) {
		var data = doc.data();
		data.MANU.push(name);

		firebase.app().firestore().collection("Parts").doc("MAN_UN").set(data).then(function () {
			ShiftingDialog.close();
			PartsPartsDrawManu();
		});
	});
});
function PartsPartsDeleteManu(a) {
	if (users.getCurrentClearance() > 1) {
		ShiftingDialog.confirm('Confirm Delete', 'Are you sure you want to delete ' + a + '? <br> This action cannot be undone.', function (a) {
			if (a)
				firebase.app().firestore().collection("Parts").doc("MAN_UN").get().then(function (doc) {
					var data = doc.data();
					data.MANU.remove(a);

					firebase.app().firestore().collection("Parts").doc("MAN_UN").set(data).then(function () {
						ShiftingDialog.close();
						PartsPartsDrawManu();
					});
				});
		})
	} else ShiftingDialog.alert('Clearance Issue', "You Need Be A Higher Clearance");
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Units  ----------------------------------------  \\
function PartsPartsDrawUnits() {
	var at = document.querySelector('.Parts-Parts-Tab--2').querySelector('tbody');
	var a = findObjectByKey(partsSnapshot.docs, "id", "MAN_UN").data().UNITS;
	var html = ``;

	a.forEach(function (item, i, a) {
		html += `
			<tr ` + (i % 2 ? `style="background-color: rgb(230, 230, 230)"` : ``) + `>
				<td>` + item + `</td>` + 
				((users.getCurrentClearance() > 1) ?
				`<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
					<i data-mdc-auto-init="MDCIconToggle" class="mdc-icon-toggle material-icons" onclick="menu.toggle(this.parentNode.parentNode.querySelector('div').innerHTML, this.parentNode, 'width: 210px;')" role="button" aria-pressed="false">more_vert</i>
					<div style="display: none">
						<ul class="mdc-list">
							<li class="mdc-list-item mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="PartsPartsDeleteUnit('` + item + `'); menu.close();">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Permanent Delete</span>
							</li>
						</ul>
					</div>
				</td>` : ``) +
			`</tr>
		`
	});

	at.innerHTML = html;
	window.mdc.autoInit(at);
}
function PartsCreateNewUnit() {
	ShiftingDialog.set({
		id: "PartsCreateNewUnit",
		title: "Create New Unit",
		submitButton: "Submit",
		cancelButton: "Cancel",
		contents:
			mainSnips.textField("PartsCreateName", "Name", "The Name of the Unit", null, null, true)
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("PartsCreateNewUnit", function (c) {
	var name = c.querySelector('#PartsCreateName').value;
	firebase.app().firestore().collection("Parts").doc("MAN_UN").get().then(function (doc) {
		var data = doc.data();
		data.UNITS.push(name);

		firebase.app().firestore().collection("Parts").doc("MAN_UN").set(data).then(function () {
			ShiftingDialog.close();
			PartsPartsDrawUnits();
		});
	});
});
function PartsPartsDeleteUnit(a) {
	if (users.getCurrentClearance() > 1) {
		ShiftingDialog.confirm('Confirm Delete', 'Are you sure you want to delete ' + a + '? \n This action cannot be undone.', function (a) {
			if (a)
				firebase.app().firestore().collection("Parts").doc("MAN_UN").get().then(function (doc) {
					var data = doc.data();
					data.UNITS.remove(a);

					firebase.app().firestore().collection("Parts").doc("MAN_UN").set(data).then(function () {
						ShiftingDialog.close();
						PartsPartsDrawUnits();
					});
				});
		});
	} else ShiftingDialog.alert('Clearance Issue', "You Need Be A Higher Clearance");
}
//  ----------------------------------------    ----------------------------------------  \\