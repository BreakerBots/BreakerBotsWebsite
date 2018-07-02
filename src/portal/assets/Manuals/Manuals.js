// Manuals.js

new RegisteredTab("Manuals", ManualsFirstInit, ManualsEveryInit, ManualsExitInit, true, "manualsView");

var ManualsFab = new FabHandler(document.querySelector('#Manual-Add-Fab'));
var ManualsSnapshot;
var ManualsView;
var ManualsTabDrawn;
function ManualsFirstInit() {
	firebase.app().firestore().collection("Manuals")
		.onSnapshot(function (snapshot) {
			ManualsSnapshot = snapshot;

			ManualsView = stringUnNull(getHashParam('manualsView'));
			if ((getCurrentTab() == "Manuals") && (ManualsSnapshot)) {
				ManualsTabDrawn = ManualsView;
				ManualsDrawTab(false);
			}
		});

	window.addHashVariableListener('manualsView', function () {
		todoView = stringUnNull(getHashParam('manualsView'));
		if ((getCurrentTab() == "Manuals") && (todoSnapshot) && (todoDrawn != todoView)) {
			ManualsTabDrawn = ManualsView;
			ManualsDrawTab(true);
		}
	});
} 

function ManualsEveryInit() {
	showMainLoader(false);
}

function ManualsExitInit() {
	ManualsFab.tabExit();
}

function ManualsDrawTab(transition) {
	try {
		var html = '';
		transition = transition || false;

		// Find Location From Url
		ManualsView = stringUnNull(getHashParam('manualsView'));


		// Get The Table Of Contents Doc and Parse Location From Url
		var toc = findObjectByKey(ManualsSnapshot.docs, "id", "TableOfContents");
		var tocR = (ManualsView == "") ? toc.data() : refByString(toc.data(), ManualsView);

		// Stop Function and Fix Url If Invalid
		if (tocR == undefined && ManualsView != "Trash") {
			setHashParam('manualsView', ManualsView.substring(0, ManualsView.lastIndexOf('\\')));
			return false;
		}

		// Fill In The Stepper With Location Data
		ManualsFillStepper(ManualsView, ManualsSnapshot.docs);

		// Find Current View
		var cv = findObjectByKey(ManualsSnapshot.docs, "id", (ManualsView.indexOf('\\') != -1 ? ManualsView.substring(ManualsView.lastIndexOf('\\') + 1) : ManualsView));
		cv = (cv ? cv.data() : {}) || {};

		document.querySelector('#ManualsWrapper').style.margin = "20px 15px 0px 15px";
		document.querySelector('#ManualsWrapper').style.width = "calc(100% - 30px)";

		// Viewing Manual
		if (cv.info) {
			document.querySelector('#ManualStepperContent').style.maxHeight = "0px";
			document.querySelector('#ManualsWrapper').style.margin = "0px 0px 0px 0px";
			document.querySelector('#ManualsWrapper').style.width = "100%";
			headerUseSearch(false);
			var fmv = ManualsView; fmv = fmv.split('\\\\'); fmv.shift(); fmv.join('\\\\');
			headerUseBackArrow(true, fmv == "" ? "deleteHashParam('manualsView')" : "setHashParam('manualsView', '" + fmv + "')");
			ManualsFab.tabExit();
			PeteSwitcher.set(false);
			html = `<div style="display: flex; align-items: center; justify-content: center; align-content: center;"><div class="Manuals-ViewManualPaper mdc-elevation--z5"><div style="padding: 15px; position: absolute; left: 0; top: 0; right: 0; bottom: 0">` + cv.info + `</div></div></div>`;
		}
		else if (ManualsView == "Trash") {
			try {
				for (var i = 0; i < ManualsSnapshot.docs.length; i++) {
					var data = ManualsSnapshot.docs[i];
					var id = data.id; data = data.data();

					if (data.trashed) {
						html += ManualsGetCardHTML(id, data, transition, true);
					}
				}

				html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>`;
			} catch (err) { console.error(err); }
		}
		// Viewing Folder or Home
		else {
			document.querySelector('#ManualStepperContent').style.maxHeight = "45px";
			headerUseSearch(true);
			headerUseBackArrow(false);
			ManualsFab.tabSwitch();

			for (var i = 0; i < Object.keys(tocR).length; i++) {
				try {
					var data = findObjectByKey(ManualsSnapshot.docs, "id", Object.keys(tocR)[i]);
					var id = data.id; data = data.data();

					if (!data.trashed) {
						html += ManualsGetCardHTML(id, data, transition);
					}
				}
				catch (err) { console.error(err); }
			}

			if (ManualsView == "") html += ManualsGetCardHTML('Trash', { title: "Trash", desc: "" }, transition);

			html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>`;
		}

		document.querySelector("html").style.overflowY = "auto";
		document.querySelector("#ManualsWrapper").innerHTML = html;
		window.mdc.autoInit(document.querySelector("#ManualsWrapper"));
		return true;
	} catch (err) { console.error(err); }
}
function ManualsGetCardHTML(id, data, transition, trashed) {
	return `
	<div class="breaker-layout__panel">
		<div class="mdc-card ` + (transition ? "todo-card" : "") + `" style="min-height: 90px; background-color: rgba(255, 255, 255, 1)">
			<div class="mdc-ripple-surface mdc-ripple-upgraded bl1" style="display: flex; min-height: 65px; align-items: center;" data-mdc-auto-init="MDCRipple" onclick="setHashParam('manualsView', '` + (id != "Trash" ? (ManualsView.split('\\').join("\\\\") + (ManualsView == "" ? "" : "\\\\") + id) : "Trash") + `');">
				<div style="margin-left: 20px; width: 100%;">
					<div class="demo-card__primary" style="width: 70%">
						<h2 class="demo-card__title mdc-typography--headline6">` + data.title + `</h2>
					</div>
					<div class="mdc-typography--body2" style="width: 70%;">` + data.desc + `</div>
					<i class="noselect material-icons" style="font-size: 300%; position: absolute; right: 13px; top: 6px;"><img src="../assets/icons/` + (id == "Trash" ? "trash" : (data.info ? "manual" : "folder")) + `.png" style="width: 45px; filter: opacity(75%)"></i>
				</div>
			</div><div class="mdc-card__action-icons">` + ( id != "Trash" ? `
				<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.ManualsTabMenu').innerHTML, this, 'width: 150px')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button">more_vert</i>
			` : ``) + `</div>
			<div class="ManualsTabMenu" style="display: none">
				<ul class="mdc-list">
					<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="ManualsEditItem('` + id + `'); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons">edit</span>
						<span class="noselect mdc-list-item__text">Edit</span>
					</li>` + ( !trashed ?
					`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="ManualsTrashItem('` + id + `', false); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
						<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
					</li>` : `
					<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="ManualsTrashItem('` + id + `', true); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
						<span class="noselect mdc-list-item__text" style="color: green">Restore</span>
					</li> `) + `
				</ul>
			</div>
		</div>
	</div>
	`;
}
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Add  ----------------------------------------  \\
var ManualsAddRichTextEditor;
ManualsFab.element.addEventListener("click", function () {
	try {
		ShiftingDialog.set({
			id: "ManualsAdd",
			title: "Create Manual or Folder",
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnExternalClick: true,
			forceFullscreen: true,
			contents:
				mainSnips.dropDown("ManualAdd_Type", "Type", "", "ManualsAddUpdateDropdown()", ["Manual", "Manual", true], ["Folder", "Folder", false]) +
				mainSnips.textField("ManualAdd_Title", "Title", "A Title of The Item", null, null, true) +
				mainSnips.textField("ManualAdd_Desc", "Description", "A Description of The Item") +
				mainSnips.richText("ManualAdd_Info", "Information/Description")
		});
		ManualsAddRichTextEditor = new BreakerRichText(document.querySelector('#ManualAdd_Info'), "", {
			textColor: true,
			fillColor: true,
			textSize: true,
			link: true,
			image: true,
			align: true,
			lists: true
		});
		ShiftingDialog.open();
	} catch (err) { console.error(err); }
});
function ManualsAddUpdateDropdown() {
	document.querySelector('#ManualAdd_Info').parentNode.style.display = (document.querySelector('#ManualAdd_Type').value == "Manual") ? "block" : "none";
}
ShiftingDialog.addSubmitListener("ManualsAdd", function (c) {
	try {
		var type = c.querySelector('#ManualAdd_Type').value;
		var title = c.querySelector('#ManualAdd_Title').value;
		var desc = c.querySelector('#ManualAdd_Desc').value;
		var info = ManualsAddRichTextEditor.content;

		var json = {
			title: title,
			desc: desc,
		};

		if (type == "Manual") {
			json.info = info;
			var nd = info.replace(/<img.*>/, 'IMAGE');
			json.changes = [
				{
					user: users.getCurrentUid(),
					from: null,
					to: nd
				}
			]
		}

		firebase.app().firestore().collection("Manuals").add(json)
			.then(function (doc) {
				tocJson = pushDataToJsonByDotnot(findObjectByKey(ManualsSnapshot.docs, "id", "TableOfContents").data(), stringUnNull(getHashParam('manualsView')), doc.id, {});

				firebase.app().firestore().collection("Manuals").doc("TableOfContents").set(tocJson)
					.then(function () {
						ShiftingDialog.close();
					});
			});

	} catch (err) { console.error(err); }
});
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Edit  ----------------------------------------  \\
var ManualsEditRichTextEditor;
var ManualsEditItemTarget;
function ManualsEditItem(id) {
	try {
		var data = findObjectByKey(ManualsSnapshot.docs, "id", id).data();
		ManualsEditItemTarget = id;
		ShiftingDialog.set({
			id: "ManualsEdit",
			title: "Edit " + data.title,
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnExternalClick: true,
			forceFullscreen: true,
			contents:
				mainSnips.textField("ManualEdit_Title", "Title", "A Title of The Item", null, null, true, data.title) +
				mainSnips.textField("ManualEdit_Desc", "Description", "A Description of The Item", null, null, null, data.desc) +
				mainSnips.richText("ManualEdit_Info", "Information/Description")
		});
		ManualsEditRichTextEditor = new BreakerRichText(document.querySelector('#ManualEdit_Info'), data.info, {
			textColor: true,
			fillColor: true,
			textSize: true,
			link: true,
			image: true,
			align: true,
			lists: true
		});
		if (!data.info)
			document.querySelector('#ManualEdit_Info').parentNode.style.display = "none";
		ShiftingDialog.open();
	} catch (err) { console.error(err); }
}
ShiftingDialog.addSubmitListener("ManualsEdit", function (c) {
	try {
		var data = findObjectByKey(ManualsSnapshot.docs, "id", ManualsEditItemTarget).data();

		var title = c.querySelector('#ManualEdit_Title').value;
		var desc = c.querySelector('#ManualEdit_Desc').value;
		var info = ManualsEditRichTextEditor.content;

		var json = {
			title: title,
			desc: desc
		};

		if (data.info) {
			json.info = info;
			var nd = info.replace(/<img.*>/, 'IMAGE');
			var ndo = data.info.replace(/<img.*>/, 'IMAGE');
			json.changes = data.changes || [];
			json.changes.push(
				{
					user: users.getCurrentUid(),
					from: ndo,
					to: nd
				}
			);
		}

		firebase.app().firestore().collection("Manuals").doc(ManualsEditItemTarget).set(json)
			.then(function (doc) {
				ShiftingDialog.close();
			});

	} catch (err) { console.error(err); }
});
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Trash  ----------------------------------------  \\
function ManualsTrashItem(id, restore) {
	try {
		var data = findObjectByKey(ManualsSnapshot.docs, "id", id).data();
		data.trashed = !restore;
		firebase.app().firestore().collection("Manuals").doc(id).set(data);
	} catch (err) { console.error(err); }
}
//  ----------------------------------------    ----------------------------------------  \\