// Parts All Tab

//  ----------------------------------------  Initialization  -------------------------------------------------\\
var PartsTab = new RegisteredTab("Parts", null, partsTabInit, partsTabExit, true, "partsView");
var partsSnapshot;
var partsDrawn;
var partsView;
var partsViewingItemGroup = false;
var partsViewCard = true;
function partsTabInit() {
	PartsAddFab.tabSwitch();
	setTimeout(function () { headerUseSearch(true); }, 10);
	PartsPHI_Main();
	showMainLoader(false);
}

window.addEventListener('DOMContentLoaded', partsTabFirstInit);
function partsTabFirstInit() {
	firebase.app().firestore().collection("Parts")
		.onSnapshot(function (snapshot) {
			partsSnapshot = snapshot;
			getPartsTabSearchData();

			partsView = stringUnNull(getHashParam('partsView'));
			if (partsSnapshot) {
				if (getCurrentTab() == "Parts") {
					partsDrawn = partsView;
					drawPartsTab(false);
				}
				else if(getCurrentTab() == "Parts-Parts") {
					PartsPartsDrawUnits();
					PartsPartsDrawManu();
					PartsPartsDrawParts();
				}
			}
		});

	window.addHashVariableListener('partsView', function () {
		partsView = stringUnNull(getHashParam('partsView'));
		if ((getCurrentTab() == "Parts") && (partsSnapshot) && (partsDrawn != partsView)) {
			partsDrawn = partsView;
			drawPartsTab(true);
		}
	});

	PartsInitSearch();
}

function partsTabExit() {
	PartsAddFab.tabExit();
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Draw Parts Tab  -------------------------------------------------\\
function drawPartsTab(partsDrawTransition) {
	var html = '';
	partsDrawTransition = partsDrawTransition || false;

	//Find the dir to show
	partsView = stringUnNull(getHashParam('partsView'));

	//Get the table of contents and then find the directory
	var toc = findObjectByKey(partsSnapshot.docs, "id", "TableOfContents");
	var tocR = (partsView == "") ? toc.data() : refByString(toc.data(), partsView);

	//Stop if path is invalid
	if (tocR == undefined) {
		setHashParam('partsView', partsView.substring(0, partsView.lastIndexOf('\\')));
		return false;
	}

	//Fill in the stepper with new data
	fillPartsStepper(partsView, partsSnapshot.docs);

	var cv = findObjectByKey(partsSnapshot.docs, "id", (partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView));

	// Not In Search
	if (!PartsInSearch) {
		var view = (cv ? (cv.data().items ? "Item-Group" : "Folder") : "Folder") || "Folder";

		// Viewing Inside Item-Group
		if (view == "Item-Group") {
			partsViewingItemGroup = true;
			var tg = findObjectByKey(partsSnapshot.docs, "id", (partsView.lastIndexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView)).data();
			var htmlTrash = '';
			for (var i = 0; i < Object.keys(tg.items).length; i++) {
				try {
					var tgtN = Object.keys(tg.items)[i];
					var tgt = tg.items[tgtN];
					var toDraw = PartsGetItemHtml(tgt, tgtN, partsDrawTransition);
					if (tgt.status == 4) htmlTrash += toDraw;
					else html += toDraw;
				} catch (err) { console.error(err); }
			}
			html += htmlTrash;
		}

		// Viewing Inside Folder or Home
		else {
			partsViewingItemGroup = false;
			var htmlTrash = '';
			for (var i = 0; i < Object.keys(tocR).length; i++) {
				try {
					var fotgN = Object.keys(tocR)[i];
					var fotg = findObjectByKey(partsSnapshot.docs, "id", fotgN).data();
					var fotgP = (fotg.items == undefined) ? PartsFolderStatus(fotgN) : PartsItemGroupStatus(fotgN);
					var toDraw = PartsGetFIGHtml(fotg, fotgN, fotgP, partsDrawTransition);
					if (fotg.trash) htmlTrash += toDraw;
					else html += toDraw;
				}
				catch (err) { console.error(err);  }
			}
			html += htmlTrash;
		}
	}
	// In Search
	else {
		var htmlTrash = '';
		for (var i = 0; i < Object.keys(PartsSearchResults).length; i++) {
			var name = PartsSearchResults[Object.keys(PartsSearchResults)[i]].key;
			var data = PartsSearchResults[Object.keys(PartsSearchResults)[i]];

			try {
				//If Item
				if (name.substring(0, 5) == 'item-') {
					name = name.substr(5);
					var toDraw = PartsGetItemHtml(data, name, partsDrawTransition);
					if (data.status == 4) htmlTrash += toDraw;
					else html += toDraw;
				}
				//If Folder Or Item Group
				else {
					var toDraw = PartsGetFIGHtml(data, name, partsDrawTransition);
					if (data.trash) htmlTrash += toDraw;
					else html += toDraw;
				}
			} catch (err) { }
		}
	}

	//Add The Table Layout
	if (!partsViewCard) {
		//Overscroll
		html += '<tr style="background-color: white;"><td><br></td></tr>'.repeat(10);
		html = getPartsTableStart(!partsViewingItemGroup, partsDrawTransition) + html + getPartsTableEnd(!partsViewingItemGroup);
		document.querySelector("html").style.overflowY = "hidden";
	}
	//Or The Card Layout
	else {
		html = `<div class="breaker-layout" style="position: absolute; top: 60px; left: 10px; right: 15px; min-height: 100%;">` + html + `</div>` + '<br>'.repeat(10);
		document.querySelector("html").style.overflowY = "auto";
	}
	document.querySelector("#PartsWrapper").innerHTML = html;
	window.mdc.autoInit(document.querySelector("#PartsWrapper"));
	return true;
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Get HTML  -------------------------------------------------\\
//FIG
function PartsGetFIGHtml(fotg, fotgN, fotgP, transi) {
	var dropdownMenu = `
		<ul class="mdc-list">
			<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="PartsEditFIG('` + fotgN + `'); menu.close();">
				<span class="noselect mdc-list-item__graphic material-icons">edit</span>
				<span class="noselect mdc-list-item__text">Edit</span>
			</li>` +
			(fotg.trash ?
			`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick = "PartsRecoverFIG('` + fotgN + `'); menu.close();" >
				<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
				<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
			</li >` +
			(users.getCurrentClearance() > 1 ? `<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="PartsConfirmDeleteFIG('` + fotgN + `'); menu.close();">
				<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
				<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
			</li>` : ``) :
			`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="PartsTrashFIG('` + fotgN + `'); menu.close();">
				<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
				<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
			</li>`) +
		`</ul>
	`;
	//Card View
	if (partsViewCard) {
		return (`
		<div class="breaker-layout__panel">
			<div class="mdc-card ` + (transi ? 'todo-card' : '') + `" id="` + fotgN + `" style="min-height: 65px; background-color: rgba(` + (fotg.trash ? '190, 190, 190, 1' : '255, 255, 255, 1') + `)">
				<div class="mdc-ripple-surface mdc-ripple-upgraded bl1" style="cursor: pointer; display: flex; min-height: 65px; align-items: center;" data-mdc-auto-init="MDCRipple" onclick="setHashParam('partsView', '` + (partsView.split('\\').join("\\\\") + (partsView == "" ? "" : "\\\\") + fotgN) + `');">
					<div style="margin-left: 20px; width: 100%;">
						<div class="demo-card__primary" style="width: 70%">
							<h2 class="demo-card__title mdc-typography--headline6" style="overflow-wrap: break-word;">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</h2>
						</div>
						<div class="mdc-typography--body2" style="width: 70%; overflow-wrap: break-word;">` + (fotg.desc) + `</div>
						<i class="noselect material-icons" style="font-size: 300%; position: absolute; right: 20px; top: 20px;"> 
							` + (fotg.items ? 'shopping_cart' : 'folder') + `
						</i>
					</div>
				</div>` +
				((fotgP.N > 0 || fotgP.R > 0 ||fotgP.OR > 0 ||fotgP.OV > 0 || fotgP.A > 0) ? `<div class="FTG-Progress-Wrapper" style="width: calc(100% - 43px); margin: 0 0 0 20px; padding: 8px 0 8px 0; height: 21px; display: flex; border-radius: 10px; overflow: hidden;" aria-label-delay="0.1s" aria-label="` +
				(fotgP.N + ' Not Ready / ' + fotgP.R + ' Ready / ' + fotgP.OR + ' Ordered / ' + fotgP.OV + ' Overdue / ' + fotgP.A + ' Arrived') +
				`">
					<div style="height: 100%; width: ` + (fotgP.N / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(33, 31, 30);"></div>
					<div style="height: 100%; width: ` + (fotgP.R / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(57, 163, 76);"></div>
					<div style="height: 100%; width: ` + (fotgP.OR / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(0,0,255);;"></div>
					<div style="height: 100%; width: ` + (fotgP.OV / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(244, 64, 4);"></div>
					<div style="height: 100%; width: ` + (fotgP.A / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(242, 224, 31);"></div>
				</div>` : ``) +
				`<div class="mdc-card__action-icons">
					<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.PartsCardDropdownMenu').innerHTML, this, 'width: 150px;')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
				</div>
				<div style="display: none" class="PartsCardDropdownMenu">
					` + dropdownMenu + `
				</div>
			</div>
		</div>
		`);
	}
	//List View
	else {
		return (`
		<tr style="` + (fotg.trash ? 'background-color: rgba(190, 190, 190, 1)' : '') + `">
			<td style="min-width: 60px; max-width: 60px; float: left; overflow: visible; text-overflow: visible;">
				<i data-mdc-auto-init="MDCIconToggle" onclick="setHashParam('partsView', '` + (partsView.split('\\').join("\\\\") + (partsView == "" ? "" : "\\\\") + fotgN) + `');" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80); font-size: 200%;" role="button" aria-pressed="false">
					` + (fotg.items ? 'shopping_cart' : 'folder') + `
				</i>
			</td>
			<td style="min-width: 300px; width: 20%; padding-left: 30px;">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</td>
			<td style="min-width: 400px; width: 60%;">` + (fotg.desc) + `</td>
			<td style="min-width: 90px; max-width: 90px; padding: 0;">
				<div class="FTG-Progress-Wrapper" style="width: calc(100% - 43px); margin: 0 0 0 20px; padding: 8px 0 8px 0; height: 21px; display: flex; border-radius: 10px; overflow: hidden;" aria-label-delay="0.1s" aria-label="` +
				(fotgP.N + ' Not Ready / ' + fotgP.R + ' Ready / ' + fotgP.OR + ' Ordered / ' + fotgP.OV + ' Overdue / ' + fotgP.A + ' Arrived') +
				`">
					<div style="height: 100%; width: ` + (fotgP.N / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(33, 31, 30);"></div>
					<div style="height: 100%; width: ` + (fotgP.R / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(57, 163, 76);"></div>
					<div style="height: 100%; width: ` + (fotgP.OR / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(0,0,255);;"></div>
					<div style="height: 100%; width: ` + (fotgP.OV / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(244, 64, 4);"></div>
					<div style="height: 100%; width: ` + (fotgP.A / (fotgP.N + fotgP.R + fotgP.OR + fotgP.OV + fotgP.A) * 100) + `%; background-color: rgb(242, 224, 31);"></div>
				</div>
			</td>
			<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
				<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.PartsCardDropdownMenu').innerHTML, this, 'width: 150px;')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
			</td>
			<td style="width: 0px; padding: 0px; margin: 0px; border: 0px; height: 0px;">
				<div style="display: none" class="PartsCardDropdownMenu">
					` + dropdownMenu + `
				</div>
			</td>
		</tr>
		`);
	}
}
//Items
function PartsGetItemHtml(tgt, tgtN, transi) {
	var pd = {};
	try { pd = PartsGetPartData(tgt.part); } catch (err) {  }
	//The Card
	return `
	<div class="breaker-layout__panel">
		<div class="mdc-card ` + (transi ? 'todo-card' : '') + `" style="min-height: 120px; position: relative; background-color: rgba(` + (tgt.status == 4 ? '190, 190, 190' : '255, 255, 255') + `, 1)">
			<div style="margin-left: 20px; min-height: 45px; margin-bottom: 20px;">
				<div class="demo-card__primary" style="width: 70%">
					<h2 class="demo-card__title mdc-typography--headline6" style="overflow: hidden;">` + (tgt.title) + `</h2>
				</div>
				<div class="demo-card__secondary mdc-typography--body2" style="width: 85%; overflow: hidden; overflow-wrap: break-word;">` + tgt.desc + `</div>
				<i class="noselect material-icons mdc-icon-toggle" onclick="PartsCSItem('` + tgtN + `')" aria-label-delay="0.15s" aria-label="Change Status" data-mdc-auto-init="MDCIconToggle" style="position: absolute; right: 8px; top: 8px;"> <img style="transform: translate(-5px, -5.5px)" src="` + PartsGetItemStatus(Number(tgt.status)) + `"/> </i>
			</div>
			<div style="height: 40px; width: 40px; overflow: hidden; border-radius: 5px; position: absolute; left: 6px; bottom: 16px; background: white;">
				<img src="` + pd.image + `" style="width: 40px;">
			</div>
			<div style="position: absolute; left: ` + (stringUnNull(pd.image) == "" ? 12 : 52) + `px; bottom: 16px; height: 40px; right: 48px; oveflow: hidden;">
				<div style="font-weight: 600; width: 100%; overflow: hidden; max-height: 18px; text-overflow: ellipsis; white-space: nowrap;"><a` + ((stringUnNull(pd.url) != "") ? ` target="_blank" href="` + pd.url + `"` : ``) + `>` + pd.name + `</a></div>
				<div style="width: 100%; overflow: hidden; max-height: 18px; text-overflow: ellipsis; white-space: nowrap;">` + pd.vendor + `</div>
				<div style="width: 100%; overflow: hidden; max-height: 18px; text-overflow: ellipsis; white-space: nowrap;">` + tgt.quantity + ' ' + pd.unit + ' for $' + (Number(pd.price) * Number(tgt.quantity)) + `</div>
			</div>
			<div class="mdc-card__action-icons">
				<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.PartsItemDropdownMenu').innerHTML, this, 'width: 180px;')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
			</div>
			<div style="display: none" class="PartsItemDropdownMenu">
				<ul class="mdc-list">
					<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="PartsEditItem('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons">edit</span>
						<span class="noselect mdc-list-item__text">Edit</span>
					</li>
					<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="PartsCSItem('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons">assignment_turned_in</span>
						<span class="noselect mdc-list-item__text">Change Status</span>
					</li>` +
					(tgt.status == 4 ?
					`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="PartsRecoverItem('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
						<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
					</li >
					<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="PartsConfirmDeleteItem('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
						<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
					</li>` :
					`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="PartsTrashItem('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
						<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
					</li>` ) +
				`</ul>
			</div>
		</div>
	</div>
	`;
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Add  -------------------------------------------------\\
var PartsAddFab = new FabHandler(document.querySelector('#Parts-Add-Fab'));
var PartsAddRichText;
PartsAddFab.element.addEventListener('click', function () {
	// Folder and Item-Groups (FIG)
	if (!partsViewingItemGroup) {
		ShiftingDialog.set({
			id: "PartsAddFIG",
			title: "Add Folder or Item-Group",
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnExternalClick: true,
			contents:
				mainSnips.dropDown("PartsAdd_Type", "Type", "", "", ["Folder", "Folder - Contains Other Folders and Item-Groups", true], ["Item-Group", "Items-Group - Contains Items", false]) +
				mainSnips.textField("PartsAdd_Title", "Title", "The Title of the Item", null, null, true) +
				mainSnips.textArea("PartsAdd_Desc", "Description", "A Desc Of the Item")
		});
		ShiftingDialog.open();
	}
	// Items
	else {
		var ap = PartsGetAllParts();
		var pn = [];
		for (var i = 0; i < Object.keys(ap).length; i++) {
			pn.push(ap[Object.keys(ap)[i]].name);
		}

		ShiftingDialog.set({
			id: "PartsAddItem",
			title: "Add a new Item",
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnExternalClick: true,
			dontCloseOnEsc: true,
			contents:
				mainSnips.textField("PartsAdd_Title", "Title", "The Title of the Item", null, null, true) +
				mainSnips.richText("PartsAdd_Desc", "Description") +
				mainSnips.textFieldAutoComplete("PartsAdd_Part", "Part", "The Part", pn, '', true, '', 'PartsAddItemInput') +
				mainSnips.textField("PartsAdd_OD", "Ordering Data", "Any Special Order Data for the Part") +
				mainSnips.textField("PartsAdd_Quan", "Quantity", "The Quantity of the Part", "number", null, true, 1, null) +
				mainSnips.dropDown("PartsAdd_Priority", "Priority", "", "", ["1", "Low - There is Little Rush In Ordering This Item (Recommended)", true], ["2", "Medium - This Item is Needed Very Soon", false], ["3", "High - The Robot is Dependent On This Item", false]) +
				mainSnips.dropDown("PartsAdd_Status", "Status", "", "", ["0", "Not Ready (Still Being Decided)", false], ["1", "Ready (Ready To Be Ordered)", true])
		});
		PartsAddRichText = new BreakerRichText(document.querySelector('#PartsAdd_Desc'), "", {
			textColor: false,
			fillColor: false,
			textSize: false,
			link: true,
			image: false,
			align: false,
			lists: false
		});
		ShiftingDialog.open();
	}
});
function PartsAddItemInput() {
	try {
		var el = document.querySelector('#PartsAdd_Part');
		var u = '';
		try {
			u = PartsGetPartData(PartsGetPartByName(el.value)).unit;
		} catch (err) {  }
		document.querySelector('#PartsAdd_Quan').parentNode.querySelector('label').innerHTML = `Quantity` + ((u == "" || !u) ? ('') : (' ( ' + u + ' )'))
	} catch (err) { console.error(err) }
}
// Folder and Item-Groups (FIG)
ShiftingDialog.addSubmitListener("PartsAddFIG", function (content) {
	try {
		var title = content.querySelector("#PartsAdd_Title").value || "";
		var type = content.querySelector("#PartsAdd_Type").value || "";
		var desc = content.querySelector("#PartsAdd_Desc").value || "";

		var json = { title: title, desc: desc };
		if (type == "Item-Group") json.items = {};
		firebase.app().firestore().collection("Parts").add(json)
			.then(function (doc) {
				tocJson = pushDataToJsonByDotnot(findObjectByKey(partsSnapshot.docs, "id", "TableOfContents").data(), stringUnNull(getHashParam('partsView')), doc.id, {});

				firebase.app().firestore().collection("Parts").doc("TableOfContents").set(tocJson)
					.then(function () {
						PartsAddToHistory(
							"add",
							null,
							json,
							"fig",
							doc.id
						);
						ShiftingDialog.close();
					});
			});
	} catch (err) { }
});
// Items
ShiftingDialog.addSubmitListener("PartsAddItem", function (c) {
	try {
		function gd(n) { return c.querySelector('#PartsAdd_' + n); }

		var title = gd("Title").value;
		var desc = PartsAddRichText.content || "";
		var priority = Number(gd("Priority").value || "1");
		var status = Number(gd("Status").value || "1");
		var quan = Number(gd("Quan").value);
		var part = gd("Part").value || "";
		var od = gd("OD").value || "";
		part = PartsGetPartByName(part);

		if (!part) {
			ShiftingDialog.enableSubmitButton();

			ShiftingDialog.confirm("Unregistered Part", "This Part Isn't Registered In The Database, Would You Like To Register It?", function (a) {
				if (a)
					PartsCreateNewPart((gd("Part").value || ""));
			});
		}
		else {

			var ctgN = partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView;
			var ctg = findObjectByKey(partsSnapshot.docs, "id", ctgN).data();

			//Find a unused id
			var AIDs = guid();
			while (ctg.items[AIDs] != undefined) {
				AIDs = guid();
			}

			ctg.items[AIDs] = {
				title: title,
				desc: desc,
				status: status,
				priority: priority,
				quantity: quan,
				part: part,
				od: od,
				sd: {

				}
			};

			firebase.app().firestore().collection("Parts").doc(ctgN).set(ctg)
				.then(function () {
					var newData = ctg.items[AIDs];
					PartsAddToHistory(
						"add",
						null,
						newData || null,
						"item",
						ctgN + "\\" + AIDs
					);
					ShiftingDialog.close();
				})
				.catch(function (a) {
					ShiftingDialog.alert("Unknown Error", "An Unknown Error Has Occured, This May Be Because of A Bad Internet Connection, or a Server Error.");
					console.error(a);
					ShiftingDialog.enableSubmitButton();
				});
		}
	} catch (err) { console.error(err); }
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Delete  -------------------------------------------------\\
//FIG
var PartsFIG_Deleting = "";
function PartsConfirmDeleteFIG(item) {
	if (users.getCurrentClearance() > 1) {
		PartsFIG_Deleting = item;
		var itemData = findObjectByKey(partsSnapshot.docs, "id", item).data();
		ShiftingDialog.set({
			id: "PartsDeleteFIG",
			title: "Delete " + (itemData.items == undefined ? "Folder" : "Item-Group"),
			submitButton: "Yes",
			cancelButton: "No",
			contents:
				mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
				`<div style="width: 100%"></div>` +
				`<h1 style="text-align: center;"> Are you sure you want to delete the ` + (itemData.items == undefined ? "folder " : "item-group ") + (itemData.title == "" ? "that is unnamed" : itemData.title) + `? <br>This Action Cannot Be Undone</h1>`
			,
			centerButtons: true
		});
		ShiftingDialog.open();
	} else alert("You Need Be A Higher Clearance");
}
ShiftingDialog.addSubmitListener("PartsDeleteFIG", function (content) {
	try {
		var tocJson = findObjectByKey(partsSnapshot.docs, "id", "TableOfContents").data();

		//Get All Docs To Delete
		var childDocs = stringUnNull(getHashParam('partsView'));
		if (childDocs != "") childDocs += '\\\\';
		var tdd = refByString(tocJson, childDocs + PartsFIG_Deleting);
		childDocs = tdd;
		childDocs = GetAllNestedKeys(childDocs); childDocs.push(PartsFIG_Deleting);

		//Start The Batch
		var batch = firebase.app().firestore().batch();

		//Delete It From The Table Of Contents
		tocJson = deleteDataFromJsonByDotnot(tocJson, stringUnNull(getHashParam('partsView')), PartsFIG_Deleting);
		batch.set(firebase.app().firestore().collection("Parts").doc("TableOfContents"), tocJson);

		childDocs.forEach(function (doc) {
			batch.delete(firebase.app().firestore().collection("Parts").doc(doc));
		});

		batch.commit()
			.then(function () {
				PartsAddToHistory(
					"delete",
					{ [PartsFIG_Deleting]: (tdd || null) },
					null,
					"fig",
					PartsFIG_Deleting
				);
				ShiftingDialog.close();
			}).catch(function (err) {
				ShiftingDialog.close();
				alert('An Error Has Occured');
				console.error(err);
			});
	} catch (err) { console.error(err); }
});
//Item
var PartsItem_Deleting = ["", null];
function PartsConfirmDeleteItem(item, parent) {
	PartsItem_Deleting = [item, parent];
	var itemData = (findObjectByKey(partsSnapshot.docs, "id", (parent ? parent : (partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView))).data()).items[item];
	ShiftingDialog.set({
		id: "PartsDeleteItem",
		title: "Delete Item",
		submitButton: "Yes",
		cancelButton: "No",
		contents:
			mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
			`<div style="width: 100%"></div>` +
			`<h1 style="text-align: center;"> Are you sure you want to delete ` + itemData.title + `?</h1>`
		, centerButtons: true
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("PartsDeleteItem", function (content) {
	try {
		var ctgN = PartsItem_Deleting[1] ? PartsItem_Deleting[1] : (partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView);
		var ctg = findObjectByKey(partsSnapshot.docs, "id", ctgN).data();
		var itemData = ctg.items[PartsItem_Deleting[0]];
		delete ctg.items[PartsItem_Deleting[0]];
		firebase.app().firestore().collection("Parts").doc(ctgN).set(ctg)
			.then(function () {
				delete itemData.desc;
				PartsAddToHistory(
					"delete",
					itemData,
					null,
					"item",
					ctgN + "\\" + PartsItem_Deleting[0]
				);
				ShiftingDialog.close();
			});
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Trash/Junk  -------------------------------------------------\\
//FIG
function PartsTrashFIG(item) {
	try {
		var itemData = findObjectByKey(partsSnapshot.docs, "id", item).data();
		itemData.trash = true;
		firebase.app().firestore().collection("Parts").doc(item).set(itemData);
	} catch (err) { }
}
function PartsRecoverFIG(item) {
	try {
		var itemData = findObjectByKey(partsSnapshot.docs, "id", item).data();
		itemData.trash = false;
		firebase.app().firestore().collection("Parts").doc(item).set(itemData);
	} catch (err) { }
}
//Items
function PartsTrashItem(item, parent) {
	try {
		var ctgN = parent ? parent : partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView;
		var ctg = findObjectByKey(partsSnapshot.docs, "id", ctgN).data();
		ctg.items[item].status = 4;
		firebase.app().firestore().collection("Parts").doc(ctgN).set(ctg);
	} catch (err) { }
}
function PartsRecoverItem(item, parent) {
	try {
		var ctgN = parent ? parent : partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView;
		var ctg = findObjectByKey(partsSnapshot.docs, "id", ctgN).data();
		ctg.items[item].status = 0;
		firebase.app().firestore().collection("Parts").doc(ctgN).set(ctg);
	} catch (err) { }
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Edit  -------------------------------------------------\\
//FIG
var PartsFIG_Editing = "";
function PartsEditFIG(item) {
	PartsFIG_Editing = item;
	var itemData = findObjectByKey(partsSnapshot.docs, "id", item).data();
	ShiftingDialog.set({
		id: "PartsEditFIG",
		title: "Edit the " + MSNC(itemData.items, "Item-Group ", "Folder ") + itemData.title,
		submitButton: "Submit",
		cancelButton: "Cancel",
		dontCloseOnExternalClick: true,
		contents:
			mainSnips.dropDown("PartsEdit_Type", "Type", "", "", ["Folder", "Folder - Contains Other Folders and Item-Groups", !itemData.items], ["Item-Group", "Item-Group - Contains Items", itemData.items]) +
			mainSnips.textField("PartsEdit_Title", "Title", "The Title of the Item", null, null, true, itemData.title) +
			mainSnips.textField("PartsEdit_Desc", "Description", "A Description of the Item", null, null, false, itemData.desc)
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("PartsEditFIG", function (content) {
	try {
		var title = content.querySelector("#PartsEdit_Title").value || "";
		var type = content.querySelector("#PartsEdit_Type").value || "";
		var desc = content.querySelector("#PartsEdit_Desc").value || "";
		var items = findObjectByKey(partsSnapshot.docs, "id", PartsFIG_Editing).data().items;

		if (type == "Folder" && items != undefined) {
			ShiftingDialog.confirm("Item-Group to Folder", "Are you sure you want to change this to a folder and remove all of it's items?", a);
		}
		else {
			a(true);
		}

		function a(c) {
			if (c) {
				var json = { title: title, desc: desc };
				if (type == "Item-Group") json["items"] = (items || {});
				var lastData = findObjectByKey(partsSnapshot.docs, "id", PartsFIG_Editing).data();
				firebase.app().firestore().collection("Parts").doc(PartsFIG_Editing).set(json)
					.then(function (doc) {
						PartsAddToHistory(
							"edit",
							lastData || null,
							json,
							"fig",
							PartsFIG_Editing
						);
						ShiftingDialog.close();
					});
			}
			else {
				ShiftingDialog.enableSubmitButton(true);
			}
		}
	} catch (err) { }
});
//Items
var PartsItems_Editing = ["", null];
var PartsEditRichText;
function PartsEditItem(item, parent) {
	PartsItems_Editing = [item, parent];
	var itemData = findObjectByKey(partsSnapshot.docs, "id", (parent ? parent : (partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView))).data().items[item];

	var ap = PartsGetAllParts();
	var pn = [];
	for (var i = 0; i < Object.keys(ap).length; i++) {
		pn.push(ap[Object.keys(ap)[i]].name);
	}

	var part = "";
	try {
		part = PartsGetPartData(itemData.part).name;
	} catch (err) { }

	ShiftingDialog.set({
		id: "PartsEditItem",
		title: "Edit " + itemData.title,
		submitButton: "Submit",
		cancelButton: "Cancel",
		dontCloseOnExternalClick: true,
		dontCloseOnEsc: true,
		contents:
			mainSnips.textField("PartsEdit_Title", "Title", "The Title of the Item", null, null, true, itemData.title) +
			mainSnips.richText("PartsEdit_Desc", "Description") +
			mainSnips.textFieldAutoComplete("PartsEdit_Part", "Part", "The Part", pn, '', true, part, "PartsEditItemInput") +
			mainSnips.textField("PartsEdit_OD", "Ordering Data", "Any Special Order Data for the Part", null, null, null, itemData.od || "") +
			mainSnips.textField("PartsEdit_Quan", "Quantity", "The Quantity of the Part", "number", null, true, (itemData.quantity || "")) +
			mainSnips.dropDown("PartsEdit_Priority", "Priority", "", "", ["1", "Low - There is Little Rush In Ordering This Item (Recommended)", (itemData.priority == 1)], ["2", "Medium - This Item is Needed Very Soon", (itemData.priority == 2)], ["3", "High - The Robot is Dependent On This Item", (itemData.priority == 3)])
	});
	PartsEditRichText = new BreakerRichText(document.querySelector('#PartsEdit_Desc'), itemData.desc, {
		textColor: false,
		fillColor: false,
		textSize: false,
		link: true,
		image: false,
		align: false,
		lists: false
	});
	ShiftingDialog.open();
	PartsEditItemInput();
}
function PartsEditItemInput() {
	try {
		var el = document.querySelector('#PartsEdit_Part');
		var u = '';
		try {
			u = PartsGetPartData(PartsGetPartByName(el.value)).unit;
		} catch (err) {  }
		document.querySelector('#PartsEdit_Quan').parentNode.querySelector('label').innerHTML = `Quantity` + ((u == "" || !u) ? ('') : (' ( ' + u + ' )'))
	} catch (err) { console.error(err) }
}
ShiftingDialog.addSubmitListener("PartsEditItem", function (c) {
	try {
		function gd(n) { return c.querySelector('#PartsEdit_' + n); }

		var title = gd("Title").value || "";
		var desc = PartsEditRichText.content || "";
		var priority = Number(gd("Priority").value || "1");
		var quan = Number(gd("Quan").value || "1");
		var part = gd("Part").value || "";
		var od = gd("OD").value || "";
		part = PartsGetPartByName(part);

		if (!part) {
			ShiftingDialog.enableSubmitButton();

			ShiftingDialog.confirm("Unregistered Part", "This Part Isn't Registered In The Database, Would You Like To Register It?", function (a) {
				if (a)
					PartsCreateNewPart((gd("Part").value || ""));
			});
		}
		else {
			var ctgN = PartsItems_Editing[1] ? PartsItems_Editing[1] : partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView;
			var ctg = findObjectByKey(partsSnapshot.docs, "id", ctgN).data();

			var lastData = ctg.items[PartsItems_Editing[0]];

			ctg.items[PartsItems_Editing[0]] = {
				title: title,
				desc: desc,
				status: ctg.items[PartsItems_Editing[0]].status || 0,
				priority: priority,
				quantity: quan,
				part: part,
				od: od,
				sd: {

				}
			};

			var newData = ctg.items[PartsItems_Editing[0]];

			firebase.app().firestore().collection("Parts").doc(ctgN).set(ctg)
				.then(function () {
					PartsAddToHistory(
						"edit",
						lastData || null,
						newData || null,
						"item",
						ctgN + "\\" + PartsItems_Editing[0]
					);
					ShiftingDialog.close();
				})
				.catch(function (a) {
					alert("An Unknown Error Has Occured, \n This May Be Because of A Bad Internet Connection, a Server Error, or because you are using an outdated browser.");
					ShiftingDialog.enableSubmitButton();
				});
		}
	} catch (err) { console.error(err); }
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Change Status  -------------------------------------------------\\
var PartsItems_CS = ["", null];
function PartsCSItem(item, parent) { //  CS (Change Status)
	PartsItems_CS = [item, parent];
	var itemData = findObjectByKey(partsSnapshot.docs, "id", (parent ? parent : (partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView))).data().items[item];
	ShiftingDialog.set({
		id: "PartsCSItem",
		title: "Change Status of " + itemData.title,
		submitButton: "Submit",
		cancelButton: "Cancel",
		contents:
			`
		<div class="radio-button-container" style="width: 90%; min-width: 250px;"  id="PartsCS_State"  >
			<div class="mdc-form-field" style="margin: 0 0 0 3px;">
				<div class="mdc-radio" data-mdc-auto-init="MDCRadio" id="PartsCS_State--rbv--0">
					<input class="mdc-radio__native-control" type="radio" name="radios" checked onclick="PartsCSSetRadioAppearance()">
					<div class="mdc-radio__background">
						<div class="mdc-radio__outer-circle"></div>
						<div class="mdc-radio__inner-circle"></div>
					</div>
				</div>
				<label onclick="this.parentNode.querySelector('div').querySelector('input').click()"><img class="noselect" src=""/> <span style="font-size: 120%;">Not Ready</span> <span style="font-size: 100%;"> (Still Being Decided)</span></label>
			</div><br />
			
			<div class="mdc-form-field" style="margin: 0 0 0 3px;">
				<div class="mdc-radio" data-mdc-auto-init="MDCRadio" id="PartsCS_State--rbv--1">
					<input class="mdc-radio__native-control" type="radio" name="radios" checked onclick="PartsCSSetRadioAppearance()">
					<div class="mdc-radio__background">
						<div class="mdc-radio__outer-circle"></div>
						<div class="mdc-radio__inner-circle"></div>
					</div>
				</div>
				<label onclick="this.parentNode.querySelector('div').querySelector('input').click()"><img class="noselect" src=""/> <span style="font-size: 120%;">Ready</span> <span style="font-size: 100%;"> (Ready To Be Ordered)</span></label>
			</div><br />
			
			<div class="mdc-form-field" style="margin: 0 0 0 3px;">
				<div class="mdc-radio mdc-radio--disabled" data-mdc-auto-init="MDCRadio" id="PartsCS_State--rbv--2">
					<input class="mdc-radio__native-control" type="radio" name="radios" checked onclick="PartsCSSetRadioAppearance()" disabled>
					<div class="mdc-radio__background">
						<div class="mdc-radio__outer-circle"></div>
						<div class="mdc-radio__inner-circle"></div>
					</div>
				</div>
				<label onclick="this.parentNode.querySelector('div').querySelector('input').click()"><img class="noselect" src=""/> <span style="font-size: 120%;">Ordered</span> <span style="font-size: 100%;"> (Has Been Ordered)</span></label>
			</div><br />
			
			<div class="mdc-form-field" style="margin: 0 0 0 3px;">
				<div class="mdc-radio mdc-radio--disabled" data-mdc-auto-init="MDCRadio" id="PartsCS_State--rbv--3">
					<input class="mdc-radio__native-control" type="radio" name="radios" checked onclick="PartsCSSetRadioAppearance()" disabled>
					<div class="mdc-radio__background">
						<div class="mdc-radio__outer-circle"></div>
						<div class="mdc-radio__inner-circle"></div>
					</div>
				</div>
				<label onclick="this.parentNode.querySelector('div').querySelector('input').click()"><img class="noselect" src=""/> <span style="font-size: 120%;">Arrived</span> <span style="font-size: 100%;"> (Verified Arrival)</span></label>
			</div><br />
		</div>
			`
	});
	ShiftingDialog.open();
	setTimeout(function () {
		var s = itemData.status || 0;
		if (s >= 4) s--;
		setRadioButtonValue(document.querySelector("#PartsCS_State"), s);
		PartsCSSetRadioAppearance(1);
	}, 10);
}
function PartsCSSetRadioAppearance(el) {
	if (el) el = document.querySelector('#' + getRadioButtonValue(document.querySelector("#PartsCS_State"), true)).querySelector("input");
	else el = event.srcElement;
}
ShiftingDialog.addSubmitListener("PartsCSItem", function (content) {
	try {
		// 0: Not Ready
		// 1: Ready
		// 2: Ordered
		// 3: Error
		// 4: Arrived
		var status = Number(getRadioButtonValue(content.querySelector("#PartsCS_State")));
		if (status >= 3) status++;

		var ctgN = PartsItems_CS[1] ? PartsItems_CS[1] : partsView.indexOf('\\') != -1 ? partsView.substring(partsView.lastIndexOf('\\') + 1) : partsView;
		var ctg = findObjectByKey(partsSnapshot.docs, "id", ctgN).data();

		ctg.items[PartsItems_CS[0]].status = status;

		firebase.app().firestore().collection("Parts").doc(ctgN).set(ctg).then(function () {
			ShiftingDialog.close();
		});
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Create Part  ----------------------------------------  \\
function PartsCreateNewPart(name) {
	var d = findObjectByKey(partsSnapshot.docs, "id", "MAN_UN").data();
	var MANU = d.MANU;
	var UNITS = d.UNITS;
	ShiftingDialog.set({
		id: "PartsCreatePart",
		title: "Create Part",
		submitButton: (users.getCurrentClearance() >= 2 ? "Submit" : "Request"),
		cancelButton: "Cancel",
		forceFullscreen: true,
		contents:
			mainSnips.textField("CreatePart_Name", "Name", "A Short Name of The Part", null, null, true, (name || "")) +
			mainSnips.textField("CreatePart_Url", "Url", "A Url to the Part", "url", null, false) +
			mainSnips.textFieldAutoComplete("CreatePart_Vendor", "Vendor", "The Vendor of the Part", MANU, '', true, '') +
			mainSnips.textField("CreatePart_PartNumber", "Part Number", "The Part Number for the Part", null, null, false) +
			mainSnips.textField("CreatePart_OD", "Ordering Data", "Any information on ordering the part", null, null, false) + 
			mainSnips.textField("CreatePart_Image", "Image", "A Url To An Image (Right-Click on Image and Press 'Copy image address')", "url", null, false) +
			mainSnips.textFieldAutoComplete("CreatePart_Unit", "Unit", "The Unit for this item (Bags, Pounds, Each, Feet...)", UNITS, '', true) +
			`<div class="form-group" style="width: 90%; min-height: 65px; max-height: 73px;" >
				<label  for="CreatePart_Price" >Price ($)</label>
				<input  id="CreatePart_Price" required  type="number" value="0.00" step="0.01" min="0" class="form-control" placeholder="The Price Per Unit of the Part" autocomplete="off">
			</div>` +
			mainSnips.textField("CreatePart_Other", "Other", "Other Important Data About the Part", null, null, false)
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("PartsCreatePart", function (c) {
	try {
		function gd(n) { return c.querySelector('#CreatePart_' + n); }

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
		var d = (users.getCurrentClearance() >= 2 ? "Parts" : "PartsUnv");

		firebase.app().firestore().collection("Parts").doc(d).get()
			.then(function (doc) {
				var data = doc.data();

				//Find a unused id
				var AIDs = guid();
				while (data[AIDs] != undefined) {
					AIDs = guid();
				}

				data[AIDs] = {
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

				firebase.app().firestore().collection("Parts").doc(d).set(data)
					.then(function (doc) {
						ShiftingDialog.close();
					})
					.catch(function (e) {
						throw e;
					})
			})
			.catch(function (e) {
				throw e;
			})
	} catch (err) { console.error(err); alert("An Unknown Error Has Occured"); ShiftingDialog.enableSubmitButton(true); return; }
});
//  ----------------------------------------    ----------------------------------------  \\




//  ----------------------------------------  Other Functions  -------------------------------------------------\\
function PartsGetItemStatus(status) {
	switch (status) {
		case 0: return '';
		case 1: return '';
		case 2: return '';
		case 3: return '';
		case 4: return '';
	}
	return '';
}

function getPartsTableStart(useTable, transi) {
	if (useTable)
		return `
		<div class="material-table ` + (transi ? 'todo-card' : '') + ` table-responsive" style="background: #fff; position: absolute;  min-height: 100%;">
			<table class="striped" style="min-width: 700px;">
				<thead>
					<tr>
						<th style="min-width: 60px; max-width: 60px; float: left;"></th>
						<th style="min-width: 300px; width: 20%; padding-left: 30px;">Title</th>
						<th style="min-width: 400px; width: 60%;">Desc</th>
						<th style="min-width: 90px; max-width: 90px;">Progress</th>
						<th style="min-width: 60px; max-width: 60px; float: right;"></th>
					</tr>
				</thead>
				<tbody>
		`;
	else {
		return `
			<div class="material-table ` + (transi ? 'todo-card' : '') + ` table-responsive" style="background: #fff; position: absolute;  min-height: 100%;">
		`;
	}
}
function getPartsTableEnd(useTable) {
	if (useTable)
		return `
				</tbody>
			</table>
		</div>
		`;
	else
		return `
		</div>
		`;
}

function PartsGetAllParts() {
	try {
		return findObjectByKey(partsSnapshot.docs, "id", "Parts").data();
	} catch (err) {
		console.error(err);
		return;
	}
}

function PartsGetPartByName(name) {
	var ap = PartsGetAllParts();
	for (var i = 0; i < Object.keys(ap).length; i++) {
		if (ap[Object.keys(ap)[i]].name == name) return Object.keys(ap)[i];
	}
	return;
}

function PartsGetPartData(uid) {
	try {
		return findObjectByKey(partsSnapshot.docs, "id", "Parts").data()[uid];
	} catch (err) {
		console.error(err);
		return;
	}
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Get Folder and Item-Group Status  -------------------------------------------------\\
function PartsItemGroupStatus(id) {
	try {
		var ret = { N: 0, R: 0, OR: 0, OV: 0, A: 0 };
		var items = findObjectByKey(partsSnapshot.docs, "id", id).data().items;
		for (var i = 0; i < Object.keys(items).length; i++) {
			ret[Object.keys(ret)[items[Object.keys(items)[i]].status]]++;
		}
		return ret;
	} catch (err) {
		return { N: 0, R: 0, OR: 0, OV: 0, A: 0 };
	}
}

function PartsFolderStatus(id) {
	try {
		var toc = findObjectByKey(partsSnapshot.docs, "id", "TableOfContents").data();
		var doc = findNestedKey(toc, id);
		return PartsProcessNestedStatus(doc);
	} catch (err) {
		return { N: 0, R: 0, OR: 0, OV: 0, A: 0 };
	}
}

function PartsProcessNestedStatus(obj) {
	try {
		var ret = { N: 0, R: 0, OR: 0, OV: 0, A: 0 };
		//Filter Through Children
		for (var i = 0; i < Object.keys(obj).length; i++) {
			//If Folder => Call
			if (findObjectByKey(partsSnapshot.docs, "id", Object.keys(obj)[i]).data().items == undefined)
				ret = PartsCombineStatus(ret, PartsProcessNestedStatus(obj[Object.keys(obj)[i]]));
			//Else if Item-Group => Get
			else
				ret = PartsCombineStatus(ret, PartsItemGroupStatus(Object.keys(obj)[i]));
		}
		return ret;
	} catch (err) {
		return { N: 0, R: 0, OR: 0, OV: 0, A: 0 };
	}
}

function PartsCombineStatus(s1, s2) {
	try {
		return {
			N:  s1.N  + s2.N,
			R:  s1.R  + s2.R,
			OR: s1.OR + s2.OR,
			OV: s1.OV + s2.OV,
			A:  s1.A  + s2.A
		};
	} catch (err) {
		return { N: 0, R: 0, OR: 0, OV: 0, A: 0 }
	}
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Searching  -------------------------------------------------\\
//Get Search Data
var PartsAllFIGT = [];
var PartsSearchEngine;
function getPartsTabSearchData() {
	try {
		var allData = [];
		var data;
		var td;
		for (var i = 0; i < partsSnapshot.docs.length; i++) {
			if (partsSnapshot.docs[i].id != "TableOfContents") {
				data = partsSnapshot.docs[i].data();
				data.key = partsSnapshot.docs[i].id;
				allData.push(data);
				if (data.items)
					for (var i2 = 0; i2 < Object.keys(data.items).length; i2++) {
						td = data.items[Object.keys(data.items)[i2]];
						td.key = ('item-' + Object.keys(data.items)[i2]);
						td.parent = (data.key);
						allData.push(td);
					}
			}
		}
		PartsAllFIGT = allData;
		PartsSearchEngine = new Fuse(PartsAllFIGT, {
			shouldSort: true,
			threshold: 0.6,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
				"title",
				"desc",
				"part",
				"priority",
				"status"
			]
		});
	} catch (err) { }
}
//Access Search
var PartsInSearch = false;
var PartsSearchResults = {};
function PartsInitSearch() {
	try {
		setTimeout(function () {
			addHeaderSearchInputListener('Parts', function (inp) {
				if (stringUnNull(inp) == "") {
					PartsInSearch = false;
					PartsSearchResults = {};
				}
				else {
					PartsInSearch = true;
					PartsSearchResults = PartsSearchEngine.search(inp);
				}
				drawPartsTab();
			});
		}, 10);
	} catch (err) { }
}
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  History  -------------------------------------------------\\
/**
 * Keep Everything in lowercase
 * @param {any} operation "add", "delete", "edit"
 * @param {any} from Before Change or null
 * @param {any} to After Change
 * @param {any} targetType "item", "fig"
 * @param {any} targetId UID of item or fig
 */
function PartsAddToHistory(operation, from, to, targetType, targetId) {
	try {
		firebase.app().firestore().collection("Parts").doc("History").get()
			.then(function (doc) {
				var data = doc.data();
				data.a.push({
					changer: users.getCurrentUid(),
					operation: operation,
					from: from,
					to: to,
					target: {
						type: targetType,
						id: targetId
					}
				});
				firebase.app().firestore().collection("Parts").doc("History").set(data)
					.then(function () {

					})
					.catch(function () {

					});
			})
			.catch(function () {

			});
	} catch (err) { console.error(err); }
}
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Helper Intr.  ----------------------------------------  \\
function PartsPHI_Main() {
	Helper.API.wait(function () {
		switch (Helper.API.getProgress("Item", 0)) {
			case 0:
				Helper.drawing.display("This is the Item Management System (IMS), for managing item orders.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Item", 0, 1); PartsPHI_Main(); });
				break;
			case 1:
				Helper.drawing.display("In the IMS, there are folders, item-groups, items and parts. This home page and other folders contain only folders and item-groups. Tasks can only be added to task-groups.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Item", 0, 2); PartsPHI_Main(); });
				break;
			case 2:
				Helper.drawing.display("An item is something you want to buy, while folders and item-groups are for organization. Every item in the IMS contains a name, description, status, priority, and reference to a part. Parts can then contain many fields including vendor, url, name, image, etc.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Item", 0, 3); PartsPHI_Main(); });
				break;
			case 3:
				Helper.drawing.display("Click on any folder or item-group to navigate inside it. You can press the back arrow next to the url or the home button under the header to return to this page.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Item", 0, 4); PartsPHI_Main(); });
				break;
			case 4:
				Helper.drawing.display("You are currently in the “items” part of the IMS, where you can manage items. Once this tutorial is finished, you can choose to manage parts as well under “Item MS” in the tab menu.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Item", 0, 5); PartsPHI_Main(); });
				break;
			case 5:
				Helper.drawing.display("This add button is accessible throughout the IMS, though its actions change depending on where you are. Inside folders, you can create folders and item-groups, while inside item-groups, you can create items.",
					['100vw - 92px', '100vh - 92px'], [1, 1], function () { Helper.API.setProgress("Item", 0, 6); PartsPHI_Main(); });
				break;
			case 6:
				Helper.drawing.display("To edit or trash an item, you can press the three stacked dots (⋮) at the bottom of it.",
					['50vw', '30vh'], [0.5, 0], function () { Helper.API.setProgress("Item", 0, 7); PartsPHI_Main(); });
				break;
			default:
				Helper.drawing.close();
				break;
		}
	});
}

function PartsShouldHaveTwoSections() {
	Helper.API.wait(function () {
		if (Helper.API.getProgress("Item", 0) > 3) {
			toggleNavSubMenu('#PartsSubmenu');
		}
		else {
			setHashParam('tab', 'Parts');
		}
	});
}
//  ----------------------------------------    ----------------------------------------  \\