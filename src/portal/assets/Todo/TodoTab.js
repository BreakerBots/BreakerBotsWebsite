//TodoTab.js

var TodoTab = new RegisteredTab("Todo", null, todoTabInit, todoTabExit, false, "todoView");

var todoSnapshot;
var todoDrawn;
var todoView;
var todoViewingTaskGroup = false;
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

	window.addHashVariableListener('todoView', function () {
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

	var cv = findObjectByKey(todoSnapshot.docs, "id", (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView));
	//If Viewing Inside Folder
	if (cv ? cv.data().tasks == undefined : true) {
		todoViewingTaskGroup = false;
		for (var i = 0; i < Object.keys(tocR).length; i++) {
			try {
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
									<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoEditFTG('` + fotgN + `')">
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
			catch (err) {  }
		}
	}
	//If Viewing Inside Task-Group
	else {
		todoViewingTaskGroup = true;
		var tg = findObjectByKey(todoSnapshot.docs, "id", (todoView.lastIndexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView)).data();
		for (var i = 0; i < Object.keys(tg.tasks).length; i++) {
			try {
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
			} catch (err) { }
		}
	}

	document.querySelector("#TodoWrapper").innerHTML = html;
	window.mdc.autoInit(document.querySelector("#TodoWrapper"));
	return true;
}



//  ----------------------------------------  Add  -------------------------------------------------\\
var TodoAddFab = new FabHandler(document.querySelector('#Todo-Add-Fab'));
TodoAddFab.element.addEventListener('click', function () {
	// Folder and Task-Groups (FTG)
	if (!todoViewingTaskGroup) {
		ShiftingDialog.set("TodoAddFTG", "Add Folder or Task-Group", "Submit", "Cancel",
			mainSnips.dropDown("TodoAdd_Type", "Type", "", ["Folder", "Folder", true], ["Task-Group", "Task-Group", false]) +
			mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Item", null, null, true) +
			mainSnips.textField("TodoAdd_Desc", "Description", "A Description of the Item")
		);
		ShiftingDialog.open();
	}
	// Tasks
	else {
		ShiftingDialog.set("TodoAddTask", "Add a new Task", "Submit", "Cancel",
			mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Task", null, null, true) +
			mainSnips.textFieldUsersAutoComplete("TodoAdd_Target", "People", "People able or have to complete this task") +
			mainSnips.textArea("TodoAdd_Desc", "Description", "A Desc Of the Task")
		);
		ShiftingDialog.open();
	}
});
// Folder and Task-Groups (FTG)
ShiftingDialog.addSubmitListener("TodoAddFTG", function (content) {
	var title = content.querySelector("#TodoAdd_Title").value || "";
	var type = content.querySelector("#TodoAdd_Type").value || "";
	var desc = content.querySelector("#TodoAdd_Desc").value || "";

	var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();

	var json = { title: title, desc: desc };
	if (type == "Task-Group") json["tasks"] = { };
	firebase.app().firestore().collection("Todo").add(json)
		.then(function (doc) {
			tocJson = pushDataToJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), doc.id, { } );

			firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
				.then(function () {
					ShiftingDialog.close();
				});
		});
});
// Tasks
ShiftingDialog.addSubmitListener("TodoAddTask", function (content) {
	var title = content.querySelector("#TodoAdd_Title").value || "";
	var desc = content.querySelector("#TodoAdd_Desc").value || "";
	var ctgN = todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
	var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

	//Find a unused id
	var AIDs = guid();
	while (ctg.tasks[AIDs] != undefined) {
		AIDs = guid();
	}

	ctg.tasks[AIDs] = { title: title, desc: desc };

	firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg).then(function () {
		ShiftingDialog.close();
	});
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Delete  -------------------------------------------------\\
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
ShiftingDialog.addSubmitListener("TodoDeleteFTG", function (content) {
	var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();
	firebase.app().firestore().collection("Todo").doc(TodoFTG_Deleting).delete()
		.then(function () {
			tocJson = deleteDataFromJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), TodoFTG_Deleting);
			firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
				.then(function () {
					ShiftingDialog.close();
				});
		});
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Edit  -------------------------------------------------\\
var TodoFTG_Editing = "";
function TodoEditFTG(item) {
	TodoFTG_Editing = item;
	var itemData = findObjectByKey(todoSnapshot.docs, "id", item).data();
	ShiftingDialog.set("TodoEditFTG", "Edit the " + MSNC(itemData.tasks, "Task-Group ", "Folder ") + itemData.title, "Submit", "Cancel",
		mainSnips.dropDown("TodoEdit_Type", "Type", "", ["Folder", "Folder", itemData.tasks == undefined], ["Task-Group", "Task-Group", itemData.tasks != undefined]) +
		mainSnips.textField("TodoEdit_Title", "Title", "The Title of the Item", null, null, true, itemData.title) +
		mainSnips.textField("TodoEdit_Desc", "Description", "A Description of the Item", null, null, false, itemData.desc)
	);
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TodoEditFTG", function (content) {
	var title = content.querySelector("#TodoEdit_Title").value || "";
	var type = content.querySelector("#TodoEdit_Type").value || "";
	var desc = content.querySelector("#TodoEdit_Desc").value || "";
	var tasks = findObjectByKey(todoSnapshot.docs, "id", TodoFTG_Editing).data().tasks;

	var conf = (type == "Folder" && tasks != undefined) ? confirm("Are you sure you want to change this to a folder and remove all of it's tasks?") : true;

	if (conf) {
		var json = { title: title, desc: desc };
		if (type == "Task-Group") json["tasks"] = (tasks || {});
		firebase.app().firestore().collection("Todo").doc(TodoFTG_Editing).set(json)
			.then(function (doc) {
				ShiftingDialog.close();
			});
	}
	else {
		ShiftingDialog.enableSubmitButton(true);
	}
});
//  ----------------------------------------    -------------------------------------------------\\