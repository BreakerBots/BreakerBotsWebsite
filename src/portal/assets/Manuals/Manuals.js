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

			ManualsGetSearchData();

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

	ManualsInitSearch();
} 

function ManualsEveryInit() {
	ManualsPHI_Main();
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

		//Viewing Search
		if (ManualsInSearch) {
			document.querySelector('#ManualStepperContent').style.maxHeight = "45px";
			headerUseSearch(true);
			headerUseBackArrow(false);
			ManualsFab.tabSwitch();

			for (var i = 0; i < (ManualsSearchResults).length; i++) {
				try {
					var data = ManualsSearchResults[i];
					var id = data.id;

					if (!data.trashed) {
						html += ManualsGetCardHTML(id, data, transition);
					}
				} catch (err) { console.error(err); }
			}

			html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>` + '<br>'.repeat(10);
		}

		// Viewing Manual
		else if (cv.info) {
			document.querySelector('#ManualStepperContent').style.maxHeight = "0px";
			document.querySelector('#ManualsWrapper').style.margin = "0px 0px 0px 0px";
			document.querySelector('#ManualsWrapper').style.width = "100%";
			headerUseSearch(false);
			var fmv = ManualsView;fmv = fmv.split('\\');fmv.splice(-1, 1);fmv.join('\\');
			headerUseBackArrow(true, fmv == "" ? "deleteHashParam('manualsView'); ManualsTabDrawn = ManualsView; ManualsDrawTab(true);" : "setHashParam('manualsView', '" + fmv + "')");
			ManualsFab.tabExit();
			PeteSwitcher.set(false);
			html = `<div style="display: flex; align-items: center; justify-content: center; align-content: center;">
						<div class="Manuals-ViewManualPaper mdc-elevation--z5">
							<div class="Manuals-ViewManualContent">
								` + cv.info + `
							</div>
						</div>
					</div>`;
		}

		//Viewing Trash
		else if (ManualsView == "Trash") {
			try {
				for (var i = 0; i < ManualsSnapshot.docs.length; i++) {
					var data = ManualsSnapshot.docs[i];
					var id = data.id; data = data.data();

					if (data.trashed) {
						html += ManualsGetCardHTML(id, data, transition, true);
					}
				}

				html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>` + '<br>'.repeat(10);
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

			html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>` + '<br>'.repeat(10);
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
			<div class="mdc-ripple-surface mdc-ripple-upgraded bl1" style="cursor: pointer; display: flex; min-height: 65px; align-items: center;" data-mdc-auto-init="MDCRipple" onclick="setHashParam('manualsView', '` + (id != "Trash" ? (ManualsView.split('\\').join("\\\\") + (ManualsView == "" ? "" : "\\\\") + id) : "Trash") + `');">
				<div style="margin-left: 20px; width: 100%;">
					<div class="demo-card__primary" style="width: 70%">
						<h2 class="demo-card__title mdc-typography--headline6" style="overflow-wrap: break-word;">` + data.title + `</h2>
					</div>
					<div class="mdc-typography--body2" style="width: 70%; overflow-wrap: break-word;">` + data.desc + `</div>
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




//  ----------------------------------------  Searching  -------------------------------------------------\\
//Get Search Data
var ManualsSearchEngine;
function ManualsGetSearchData() {
	try {
		var allData = [];
		var data;
		var td;
		for (var i = 0; i < ManualsSnapshot.docs.length; i++) {
			if (ManualsSnapshot.docs[i].id != "TableOfContents") {
				data = ManualsSnapshot.docs[i].data();
				data.id = ManualsSnapshot.docs[i].id;
				allData.push(data);
			}
		}
		ManualsSearchEngine = new Fuse(allData, {
			shouldSort: true,
			threshold: 0.6,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
				"title",
				"desc"
			]
		});
	} catch (err) { }
}
//Access Search
var ManualsInSearch = false;
var ManualsSearchResults = {};
function ManualsInitSearch() {
	try {
		setTimeout(function () {
			addHeaderSearchInputListener('Manuals', function (inp) {
				if (stringUnNull(inp) == "") {
					ManualsInSearch = false;
					ManualsSearchResults = {};
				}
				else {
					ManualsInSearch = true;
					ManualsSearchResults = ManualsSearchEngine.search(inp);
				}
				ManualsDrawTab(true);
			});
		}, 10);
	} catch (err) { }
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Helper Intr.  ----------------------------------------  \\
function ManualsPHI_Main() {
	Helper.API.wait(function () {
		switch (Helper.API.getProgress("Manuals", 0)) {
			case 0:
				Helper.drawing.display("This is the Manuals System, a way to store tutorials for other members of the team.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Manuals", 0, 1); ManualsPHI_Main(); }, function () { Helper.API.setProgress("Manuals", 0, 4); ManualsPHI_Main(); });
				break;
			case 1:
				Helper.drawing.display("Inside the Manuals System there are folders (for organization) and manuals (the tutorials themselves).",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Manuals", 0, 2); ManualsPHI_Main(); }, function () { Helper.API.setProgress("Manuals", 0, 4); ManualsPHI_Main(); });
				break;
			case 2:
				Helper.drawing.display("To navigate through the Manuals System, you can click on any folder or manual to open it. You can press the back arrow next to the url or the home button under the header to return to this page.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Manuals", 0, 3); ManualsPHI_Main(); }, function () { Helper.API.setProgress("Manuals", 0, 4); ManualsPHI_Main(); });
				break;
			case 3:
				Helper.drawing.display("If you ever want to edit or trash an item, you can press the three stacked dots (⋮) at the bottom of it.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Manuals", 0, 4); ManualsPHI_Main(); }, function () { Helper.API.setProgress("Manuals", 0, 4); ManualsPHI_Main(); });
				break;
			default:
				Helper.drawing.close();
				break;
		}
	});
}
//  ----------------------------------------    ----------------------------------------  \\