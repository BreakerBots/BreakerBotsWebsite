//TodoTab.js

var TodoTab = new RegisteredTab("Todo", null, todoTabInit, todoTabExit, false, "todoView");

var todoSnapshot;
var todoDrawn;
var todoView;
function todoTabInit() {
	firebase.app().firestore().collection("Todo")
		.onSnapshot(function (snapshot) {
			todoSnapshot = snapshot;

			todoView = stringUnNull(getHashParam('todoView'));
			if ((getCurrentTab() == "Todo") && (todoSnapshot)) {
				todoDrawn = todoView;
				drawTodoTab();
			}
		});

	window.addEventListener('hashchange', function () {
		todoView = stringUnNull(getHashParam('todoView'));
		if ((getCurrentTab() == "Todo") && (todoSnapshot) && (todoDrawn != todoView)) {
			todoDrawn = todoView;
			drawTodoTab();
		}
	});

	TodoAddFab.tabSwitch();
}

function todoTabExit() {
	TodoAddFab.tabExit();
}

function drawTodoTab() {
	var html = "";

	//Find the dir to show
	todoView = stringUnNull(getHashParam('todoView'));

	//Get the table of contents and then find the directory
	var toc = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents");
	var tocR = (todoView == "") ? toc.data() : refByString(toc.data(), todoView);

	//Stop if path is invalid
	if (tocR == undefined) {
		setHashParam('todoView', todoView.substring(0, todoView.lastIndexOf('/')));
		return false;
	}

	//Fill in the stepper with new data
	fillTodoStepper(todoView, todoSnapshot.docs);

	headerUseBackArrow(todoView != "");

	//If Viewing Inside Folder
	if (typeof tocR == "object") {
		for (var i = 0; i < Object.keys(tocR).length; i++) {
			var fotgN = Object.keys(tocR)[i];
			var fotg = findObjectByKey(todoSnapshot.docs, "id", fotgN).data();
			html += `
			<div class="col-lg-3">
				<div class="mdc-card todo-card" style="margin-bottom: 20px;" id="` + fotgN + `">
					<div class="mdc-card__primary-action" data-mdc-auto-init="MDCRipple" onclick="setHashParam('todoView', '` + ((todoView == "" ? "" : todoView + "/") + fotgN) + `');">
						<div style="margin-left: 20px">
							<div class="demo-card__primary">
								<h2 class="demo-card__title mdc-typography--headline6">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</h2>
							</div>
							<div class="demo-card__secondary mdc-typography--body2">` + (fotg.desc) + `</div>
							<i class="material-icons" style="font-size: 300%; position: absolute; right: 20px; top: 20px;"> ` + ((fotg.tasks == undefined) ? "folder" : "assignment") + ` </i>
						</div>
					</div>
					<div class="mdc-card__action-icons">
						<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
					</div>
					<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;">
						<li class="mdc-elevation--z10">
							<ul class="mdc-list">
								<li class="mdc-list-item" data-mdc-auto-init="MDCRipple">
									<span class="mdc-list-item__graphic material-icons">edit</span>
									<span class="mdc-list-item__text">Edit</span>
								</li>
								<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteFTG('` + fotgN + `')">
									<span class="mdc-list-item__graphic material-icons" style="color: red">delete</span>
									<span class="mdc-list-item__text" style="color: red">Delete</span>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
			`;
		}
	}
	//If Viewing Inside Task-Group
	else if (tocR == 42) {
		var tg = findObjectByKey(todoSnapshot.docs, "id", (todoView.substring(todoView.lastIndexOf('/') + 1))).data();
		for (var i = 0; i < Object.keys(tg.tasks).length; i++) {
			var tgt = tg.tasks[Object.keys(tg.tasks)[i]];
			html += `
			<div class="col-lg-3">
				<div class="mdc-card" style="margin-bottom: 20px;">
					<div class="mdc-card__primary-action" data-mdc-auto-init="MDCRipple">
						<div style="margin-left: 20px">
							<div class="demo-card__primary">
								<h2 class="demo-card__title mdc-typography--headline6">` + (tgt.title) + `</h2>
							</div>
							<div class="demo-card__secondary mdc-typography--body2">` + (tgt.desc) + `</div>
							<i class="material-icons" style="font-size: 300%; position: absolute; right: 20px; top: 20px;"> ` + "assignment_ind" + ` </i>
						</div>
					</div>
					<div class="mdc-card__action-icons">
						<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
					</div>
					<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;">
						<li class="mdc-elevation--z10">
							<ul class="mdc-list">
								<li class="mdc-list-item" data-mdc-auto-init="MDCRipple">
									<span class="mdc-list-item__graphic material-icons">edit</span>
									<span class="mdc-list-item__text">Edit</span>
								</li>
								<li class="mdc-list-item" data-mdc-auto-init="MDCRipple">
									<span class="mdc-list-item__graphic material-icons" style="color: red">delete</span>
									<span class="mdc-list-item__text" style="color: red">Delete</span>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
			`;
		}
	}

	document.querySelector("#TodoWrapper").innerHTML = html;
	window.mdc.autoInit(document.querySelector("#TodoWrapper"));
	return true;
}

//Open the add folder or task-group dialog
var TodoAddFab = new FabHandler(document.querySelector('#Todo-Add-Fab'));
TodoAddFab.element.addEventListener('click', function () {
	ShiftingDialog.set("TodoAddFTG", "Add Folder or Task-Group", "Submit", "Cancel",
		mainSnips.dropDown("TodoAdd_Type", "Type", "", ["Folder", "Folder", true], ["Task-Group", "Task-Group", false]) +
		mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Item", null, null, true) + 
		mainSnips.textField("TodoAdd_Desc", "Description", "A Description of the Item")
	);
	ShiftingDialog.open();
});

//Process the submition of new folder or task-group
ShiftingDialog.addSubmitListener("TodoAddFTG", function (content) {
	var title = content.querySelector("#TodoAdd_Title").value || "";
	var type = content.querySelector("#TodoAdd_Type").value || "";
	var desc = content.querySelector("#TodoAdd_Desc").value || "";

	var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();

	var json = { title: title, desc: desc };
	if (type == "Task-Group") json["tasks"] = { };
	firebase.app().firestore().collection("Todo").add(json)
		.then(function (doc) {
			tocJson = pushDataToJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), doc.id, (type == "Task-Group") ? 42: { } );

			firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
				.then(function () {
					ShiftingDialog.close();
				});
		});
});

//Open the delete folder or task-group dialog
var TodoFTG_Deleting = "";
function TodoConfirmDeleteFTG(item) {
	TodoFTG_Deleting = item;
	var itemData = findObjectByKey(todoSnapshot.docs, "id", item).data();
	ShiftingDialog.set("TodoDeleteFTG", "Delete Item", "Yes", "No",
		mainSnips.icon(null, "delete", "font-size: 160px; color: red;") + 
		`<div style="width: 100%"></div>` +
		`<h1 style="text-align: center;"> Are you sure you want to delete the ` + (itemData.tasks == undefined ? "folder " : "task-group ") + (itemData.title == "" ? "that is unnamed" : itemData.title) + `?</h1>`
	, true, true);
	ShiftingDialog.open();
}

//Process the submition of deleting folder or task-group
ShiftingDialog.addSubmitListener("TodoDeleteFTG", function (content) {
	var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();
	firebase.app().firestore().collection("Todo").delete(TodoFTG_Deleting)
		.then(function () {
			tocJson = deleteDataFromJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), TodoFTG_Deleting);

			firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
				.then(function () {
					ShiftingDialog.close();
				});
		});
});