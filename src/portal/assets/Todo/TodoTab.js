//TodoTab.js

var TodoTab = new RegisteredTab("Todo", null, todoTabInit, todoTabExit, false, "todoView");

var todoSnapshot;
var todoDrawn;
var todoView;
var todoViewingTaskGroup = false;
var todoViewCard = true;
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
	var html = '';
	var htmlB = '<div>';

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
				var fotgP = (fotg.tasks == undefined) ? TodoFolderStatus(fotgN) : TodoTaskGroupStatus(fotgN);
				//Card View
				if (todoViewCard) {
					html += `
					<div class="breaker-layout__panel">
						<div class="mdc-card todo-card" id="` + fotgN + `">
							<div class="mdc-ripple-surface mdc-ripple-upgraded bl1" style="display: flex; align-items: center;" data-mdc-auto-init="MDCRipple" onclick="setHashParam('todoView', '` + ((todoView == "" ? "" : todoView + "/") + fotgN) + `');">
								<div style="margin-left: 20px; width: 100%;">
									<div class="demo-card__primary" style="width: 90%">
										<h2 class="demo-card__title mdc-typography--headline6">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</h2>
									</div>
									<div class="mdc-typography--body2" style="width: 90%;">` + (fotg.desc) + `</div>
									<i class="noselect material-icons" style="font-size: 300%; position: absolute; right: 20px; top: 20px;"> ` + ((fotg.tasks == undefined) ? "folder" : "assignment") + ` </i>
								</div>
							</div>
							<div class="FTG-Progress-Wrapper" style="width: calc(100% - 43px); margin: 0 0 0 20px; padding: 8px 0 8px 0; height: 21px; display: flex; border-radius: 10px; overflow: hidden;" aria-label-delay="0.1s" aria-label="` +
						(fotgP.T + ' Todo / ' + fotgP.IP + ' Working / ' + fotgP.D + ' Done / ' + fotgP.B + ' Blocked') + 
						`">
								<div style="height: 100%; width: ` + (fotgP.T / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, .3);"></div>
								<div style="height: 100%; width: ` + (fotgP.IP / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, .6);"></div>
								<div style="height: 100%; width: ` + (fotgP.D / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, 1);;"></div>
								<div style="height: 100%; width: ` + (fotgP.B / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(255,0,0, 1);"></div>
							</div>
							<div class="mdc-card__action-icons">
								<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
							</div>
							<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" data-menu-offset="0 -27">
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
				//List View
				else {
					html += `
					<tr>
						<td style="min-width: 60px; max-width: 60px; float: left; overflow: visible; text-overflow: visible;">
							<i data-mdc-auto-init="MDCIconToggle" onclick="setHashParam('todoView', '` + ((todoView == "" ? "" : todoView + "/") + fotgN) + `');" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80); font-size: 200%;" role="button" aria-pressed="false">` + ((fotg.tasks == undefined) ? "folder" : "assignment") + `</i>
						</td>
						<td style="min-width: 300px; width: 20%; padding-left: 30px;">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</td>
						<td style="min-width: 400px; width: 60%;">` + (fotg.desc) + `</td>
						<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
							<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu('` + ('#ddm_' + fotgN) + `', true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
						</td>
						<td style="width: 0px; padding: 0px; margin: 0px; border: 0px; height: 0px;">
							<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" id="` + ('ddm_' + fotgN) + `">
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
						</td>
					</tr>
					`;
				}
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
				var tgtN = Object.keys(tg.tasks)[i];
				var tgt = tg.tasks[tgtN];
				html += `
				<div class="breaker-layout__panel">
					<div class="mdc-card" style="position: relative">
						<div style="margin-left: 20px">
							<div class="demo-card__primary" style="width: 90%">
								<h2 class="demo-card__title mdc-typography--headline6">` + (tgt.title) + `</h2>
							</div>
							<div class="demo-card__secondary mdc-typography--body2" style="width: 90%; font-size: .95rem; font-weight: 500; transform: translate(7px, -10px);">` + (tgt.status == 1 || tgt.status == 2 ? tgt.people : tgt.targets.join(", ")) + `</div>
							<div class="demo-card__secondary mdc-typography--body2" style="width: 90%">` + tgt.desc + `</div>
							<div class="demo-card__secondary mdc-typography--body2" style="width: 90%; background: rgba(252, 173, 37, 0.3);">` + MSN(tgt.reason) + `</div>
							<i class="noselect material-icons mdc-icon-toggle" onclick="TodoCSTask('` + tgtN + `')" data-mdc-auto-init="MDCIconToggle" style="position: absolute; right: 8px; top: 8px;"> <img style="transform: translate(-5px, -5.5px)" src="` + TodoGetTaskStatus(Number(tgt.status)) + `"/> </i>
						</div>
						<div class="mdc-card__action-icons">
							<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu('#ddm-` + tgtN + `', true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
						</div>
					</div>
				</div>
				`;
				htmlB += `
				<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" id="ddm-` + tgtN + `" data-menu-offset="0 -27">
					<li class="mdc-elevation--z10">
						<ul class="mdc-list">
							<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="TodoEditTask('` + tgtN + `')">
								<span class="noselect mdc-list-item__graphic material-icons">edit</span>
								<span class="noselect mdc-list-item__text">Edit</span>
							</li>
							<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="TodoCSTask('` + tgtN + `')">
								<span class="noselect mdc-list-item__graphic material-icons">assignment_turned_in</span>
								<span class="noselect mdc-list-item__text">Change Status</span>
							</li>
							<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Delete</span>
							</li>
						</ul>
					</li>
				</ul>
				`;
			} catch (err) { }
		}
	}

	//Add The Table
	if (!todoViewCard) {
		//Overscroll
		html += '<tr style="background-color: white;"><td><br></td></tr>'.repeat(10);
		html = getTodoTableStart(!todoViewingTaskGroup) + html + getTodoTableEnd(!todoViewingTaskGroup);
		document.querySelector("html").style.overflowY = "hidden";
	}
	//Add Card Layout
	else {
		html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>`;
		document.querySelector("html").style.overflowY = "auto";
	}
	htmlB += '</div>';
	document.querySelector("#TodoWrapper").innerHTML = htmlB + html;
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
	var desc = content.querySelector("#TodoAdd_Desc").value.replace(/\n/g, '<br>') || "";
	var targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];

	if (content.querySelector("#TodoAdd_Target").value || "" != "")
		for (var i = 0; i < targets.length; i++) {
			if (!users.isUsername(targets[i])) {
				ShiftingDialog.throwFormError(targets[i] + " is not a registered user!", content.querySelector("#TodoAdd_Target"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

	var ctgN = todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
	var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

	//Find a unused id
	var AIDs = guid();
	while (ctg.tasks[AIDs] != undefined) {
		AIDs = guid();
	}

	ctg.tasks[AIDs] = { title: title, desc: desc, targets: targets, status: 0 };

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
//FTG
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
//Tasks
var TodoTasks_Editing = "";
function TodoEditTask(item) {
	TodoTasks_Editing = item;
	var itemData = findObjectByKey(todoSnapshot.docs, "id", (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView)).data().tasks[item];
	ShiftingDialog.set("TodoEditTask", "Edit " + itemData.title, "Submit", "Cancel",
		mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Task", null, null, true, itemData.title) +
		mainSnips.textFieldUsersAutoComplete("TodoAdd_Target", "People", "People able or have to complete this task", null, itemData.targets.join(" ")) +
		mainSnips.textArea("TodoAdd_Desc", "Description", "A Desc Of the Task", null, itemData.desc.replace(/<br>/g, '\n'))
	);
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TodoEditTask", function (content) {
	var title = content.querySelector("#TodoAdd_Title").value || "";
	var desc = content.querySelector("#TodoAdd_Desc").value.replace(/\n/g, '<br>') || "";
	var targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];

	if (content.querySelector("#TodoAdd_Target").value || "" != "")
		for (var i = 0; i < targets.length; i++) {
			if (!users.isUsername(targets[i])) {
				ShiftingDialog.throwFormError(targets[i] + " is not a registered user!", content.querySelector("#TodoAdd_Target"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

	var ctgN = todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
	var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

	ctg.tasks[TodoTasks_Editing] = { title: title, desc: desc, targets: targets, status: ctg.tasks[TodoTasks_Editing].status || 0 };

	firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg).then(function () {
		ShiftingDialog.close();
	});
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Change Status  -------------------------------------------------\\
var TodoTasks_CS = "";
function TodoCSTask(item) { //  CS (Change Status)
	TodoTasks_CS = item;
	var itemData = findObjectByKey(todoSnapshot.docs, "id", (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView)).data().tasks[item];
	ShiftingDialog.set("TodoCSTask", "Change Status of " + itemData.title, "Submit", "Cancel",
		mainSnips.radioButtons("TodoCS_State", [
			'<img class="noselect" src="../assets/icons/todoNS.png"/> <span style="font-size: 120%;">Todo</span> <span style="font-size: 100%;"> (To Be Done)</span>',
			'<img class="noselect" src="../assets/icons/todoIP.png"/> <span style="font-size: 120%;">In Progress</span> <span style="font-size: 100%;"> (Being Working)</span>',
			'<img class="noselect" src="../assets/icons/todoF.png"/> <span style="font-size: 120%;">Finished</span> <span style="font-size: 100%;"> (The Task is Officially Completed)</span>',
			'<img class="noselect" src="../assets/icons/todoB.png"/> <span style="font-size: 120%;">Blocked</span> <span style="font-size: 100%;"> (Stopped Because a Holdup Preventing The Task)</span>',
			'<img class="noselect" src="../assets/icons/todoD.png"/> <span style="font-size: 120%;">Junked</span> <span style="font-size: 100%;"> (Move To Trash)</span>'
		], `TodoCSSetRadioAppearance()`) +
		mainSnips.textField("TodoCS_Reason", "Reason", "The Reason in which the task is being blocked or trashed.", null, "display: none;", null, MSN(itemData.reason, "", "", "")) +
		mainSnips.textFieldUsersAutoComplete("TodoCS_People", "People", "People Working on The Task", "display: none;", MSN(itemData.people, "", "", ""))
	);
	ShiftingDialog.open();
	setRadioButtonValue(document.querySelector("#TodoCS_State"), itemData.status || 0);
	TodoCSSetRadioAppearance(1);
}
function TodoCSSetRadioAppearance(el) {
	if (el) el = document.querySelector('#' + getRadioButtonValue(document.querySelector("#TodoCS_State"))).querySelector("input");
	else el = event.srcElement;
	//Uncheck others
	[].forEach.call(el.parentNode.parentNode.parentNode.querySelectorAll('.mdc-radio'), function (item) {
		if (item.id.split('-')[1] != el.parentNode.id.split('-')[1]) item.MDCRadio.checked = false; });

	//Find and Set which textboxes it wants visible
	var selected = ([[false, false], [false, true], [false, false], [true, false], [true, false]])[getRadioButtonValue(el.parentNode.parentNode).split('-')[1]];
	document.querySelector('#TodoCS_Reason').parentNode.style.display = selected[0] ? "block" : "none";
	document.querySelector('#TodoCS_People').parentNode.style.display = selected[1] ? "block" : "none";
}
ShiftingDialog.addSubmitListener("TodoCSTask", function (content) {
	var status = getRadioButtonValue(content.querySelector("#TodoCS_State")).split('-')[1];
	var reason = content.querySelector("#TodoCS_Reason").value;
	var people = content.querySelector("#TodoCS_People").value;

	var ctgN = todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
	var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

	ctg.tasks[TodoTasks_CS].status = Number(status);
	ctg.tasks[TodoTasks_CS].reason = reason;
	ctg.tasks[TodoTasks_CS].people = people;

	firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg).then(function () {
		ShiftingDialog.close();
	});
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Other Functions  -------------------------------------------------\\
function TodoGetTaskStatus(status) {
	switch (status) {
		case 0: return '../assets/icons/todoNS.png';
		case 1: return '../assets/icons/todoIP.png';
		case 2: return '../assets/icons/todoF.png';
		case 3: return '../assets/icons/todoB.png';
		case 4: return '../assets/icons/todoD.png';
	}
	return '../assets/icons/todoNS.png';
}

function getTodoTableStart(useTable) {
	if (useTable)
		return `
		<div class="material-table material-table--card todo-card table-responsive" style="overscroll-behavior: none; width: calc(100vw - 30px); overflow: scroll; position: fixed; height: calc(100vh - 135px); transform: translateY(20px)">
			<table class="striped" style="min-width: 700px;">
				<thead>
					<tr>
						<th style="min-width: 60px; max-width: 60px; float: left;"></th>
						<th style="min-width: 300px; width: 20%; padding-left: 30px;">Title</th>
						<th style="min-width: 400px; width: 60%;">Desc</th>
						<th style="min-width: 60px; max-width: 60px; float: right;"></th>
					</tr>
				</thead>
				<tbody>
		`;
	else
		return `
		<div class="material-table material-table--card todo-card table-responsive" style="overscroll-behavior: none; width: calc(100vw - 30px); overflow: scroll; position: fixed; height: calc(100vh - 135px); transform: translateY(20px)">
		`;
}
function getTodoTableEnd(useTable) {
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
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Get Folder and Task-Group Status  -------------------------------------------------\\
function TodoTaskGroupStatus(id) {
	var ret = { T: 0, IP: 0, D: 0, B: 0, J: 0 };
	var tasks = findObjectByKey(todoSnapshot.docs, "id", id).data().tasks;
	for (var i = 0; i < Object.keys(tasks).length; i++) {
		ret[Object.keys(ret)[tasks[Object.keys(tasks)[i]].status]]++;
	}
	return ret;
}

function TodoFolderStatus(id) {
	var toc = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();
	var doc = findNestedKey(toc, id);
	return TodoProcessNestedStatus(doc);
}

function TodoProcessNestedStatus(obj) {
	var ret = { T: 0, IP: 0, D: 0, B: 0, J: 0 };
	//Filter Through Children
	for (var i = 0; i < Object.keys(obj).length; i++) {
		//If Folder => Call
		if (findObjectByKey(todoSnapshot.docs, "id", Object.keys(obj)[i]).data().tasks == undefined)
			ret = TodoCombineStatus(ret, TodoProcessNestedStatus(obj[Object.keys(obj)[i]]));
		//Else if Task-Group => Get
		else
			ret = TodoCombineStatus(ret, TodoTaskGroupStatus(Object.keys(obj)[i]));
	}
	return ret;
}

function TodoCombineStatus(s1, s2) {
	return { T: s1.T + s2.T, IP: s1.IP + s2.IP, D: s1.D + s2.D, B: s1.B + s2.B, J: s1.J + s2.J };
}