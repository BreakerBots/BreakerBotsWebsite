//TodoTab.js

//  ----------------------------------------  Initialization  -------------------------------------------------\\
var TodoTab = new RegisteredTab("Todo", todoTabFirstInit, todoTabInit, todoTabExit, false, "todoView");
var todoSnapshot;
var todoDrawn;
var todoView;
var todoViewingTaskGroup = false;
var todoViewCard = true;
function todoTabInit() {
	TodoAddFab.tabSwitch();
	setTimeout(function () { headerUseSearch(true); }, 10);
}

function todoTabFirstInit() {
	firebase.app().firestore().collection("Todo")
		.onSnapshot(function (snapshot) {
			todoSnapshot = snapshot;

			todoView = stringUnNull(getHashParam('todoView'));
			if ((getCurrentTab() == "Todo") && (todoSnapshot)) {
				todoDrawn = todoView;
				getTodoTabSearchData();
				drawTodoTab(false);
			}
		});

	window.addHashVariableListener('todoView', function () {
		todoView = stringUnNull(getHashParam('todoView'));
		if ((getCurrentTab() == "Todo") && (todoSnapshot) && (todoDrawn != todoView)) {
			todoDrawn = todoView;
			drawTodoTab(true);
		}
	});

	TodoInitSearch();
}

function todoTabExit() {
	TodoAddFab.tabExit();
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Draw Todo Tab  -------------------------------------------------\\
function drawTodoTab(todoDrawTransition) {
	var html = '';
	var htmlB = '<div>';
	todoDrawTransition = todoDrawTransition || false;

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

	// Not In Search
	if (!TodoInSearch) {
		var view = (cv ? (cv.data().tasks ? "Task-Group" : (cv.data().filter ? "Item-View" : "Folder")) : "Folder") || "Folder";

		// Viewing Inside Task-Group
		if (view == "Task-Group") {
			todoViewingTaskGroup = true;
			var tg = findObjectByKey(todoSnapshot.docs, "id", (todoView.lastIndexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView)).data();
			var htmlTrash = '';
			for (var i = 0; i < Object.keys(tg.tasks).length; i++) {
				try {
					var tgtN = Object.keys(tg.tasks)[i];
					var tgt = tg.tasks[tgtN];
					var toDraw = TodoGetTaskHtml(tgt, tgtN, todoDrawTransition);
					htmlB += toDraw[1];
					if (tgt.status == 4) htmlTrash += toDraw[0];
					else html += toDraw[0];
				} catch (err) { }
			}
			html += htmlTrash;
		}

		// Viewing Inside Item-View
		else if (view == "Item-View") {
			todoViewingTaskGroup = false;
			var htmlTrash = '';
			var data = cv.data();
			var searchRes;

			// Target Search
			if (data.filter.indexOf("target:") != -1) {
				console.log(data.filter.substring(7));
				searchRes = TodoPeopleSearchEngine.search( data.filter.substring(7) );
			}
			else {
				searchRes = TodoSearchEngine.search(data.filter);
			}
			
			for (var i = 0; i < searchRes.length; i++) {
				var name = searchRes[i].key;
				var data = searchRes[i];
				try {
					//If Task
					if (name.substring(0, 5) == 'task-') {
						name = name.substr(5);
						var toDraw = TodoGetTaskHtml(data, name, todoDrawTransition);
						htmlB += toDraw[1];
						if (data.status == 4) htmlTrash += toDraw[0];
						else html += toDraw[0];
					}
					//If Folder Or Task Group
					else {
						var toDraw = TodoGetFTGHtml(data, name, ((data.tasks == undefined) ? TodoFolderStatus(name) : TodoTaskGroupStatus(name)), todoDrawTransition);
						if (data.trash) htmlTrash += toDraw;
						else html += toDraw;
					}
				} catch (err) { }
			}

			html += htmlTrash;
		}

		// Viewing Inside Folder or Home
		else {
			todoViewingTaskGroup = false;
			var htmlTrash = '';
			for (var i = 0; i < Object.keys(tocR).length; i++) {
				try {
					var fotgN = Object.keys(tocR)[i];
					var fotg = findObjectByKey(todoSnapshot.docs, "id", fotgN).data();
					var fotgP = (fotg.tasks == undefined) ? TodoFolderStatus(fotgN) : TodoTaskGroupStatus(fotgN);
					var toDraw = TodoGetFTGHtml(fotg, fotgN, fotgP, todoDrawTransition);
					if (fotg.trash) htmlTrash += toDraw;
					else html += toDraw;
				}
				catch (err) { }
			}
			html += htmlTrash;
		}
	}
	// In Search
	else {
		var htmlTrash = '';
		for (var i = 0; i < Object.keys(TodoSearchResults).length; i++) {
			var name = TodoSearchResults[Object.keys(TodoSearchResults)[i]].key;
			var data = TodoSearchResults[Object.keys(TodoSearchResults)[i]];

			try {
				//If Task
				if (name.substring(0, 5) == 'task-') {
					name = name.substr(5);
					var toDraw = TodoGetTaskHtml(data, name, todoDrawTransition);
					htmlB += toDraw[1];
					if (data.status == 4) htmlTrash += toDraw[0];
					else html += toDraw[0];
				}
				//If Folder Or Task Group
				else {
					var toDraw = TodoGetFTGHtml(data, name, ((data.tasks == undefined) ? TodoFolderStatus(name) : TodoTaskGroupStatus(name)), todoDrawTransition);
					if (data.trash) htmlTrash += toDraw;
					else html += toDraw;
				}
			} catch (err) { }
		}
	}
	
	//Add The Table Layout
	if (!todoViewCard) {
		//Overscroll
		html += '<tr style="background-color: white;"><td><br></td></tr>'.repeat(10);
		html = getTodoTableStart(!todoViewingTaskGroup, todoDrawTransition) + html + getTodoTableEnd(!todoViewingTaskGroup);
		document.querySelector("html").style.overflowY = "hidden";
	}
	//Or The Card Layout
	else {
		html = `<div class="breaker-layout" style="width: 100%;">` + html + `</div>`;
		document.querySelector("html").style.overflowY = "auto";
	}
	htmlB += '</div>';
	document.querySelector("#TodoWrapper").innerHTML = htmlB + html;
	window.mdc.autoInit(document.querySelector("#TodoWrapper"));
	return true;
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Get HTML  -------------------------------------------------\\
//FTG
function TodoGetFTGHtml(fotg, fotgN, fotgP, transi) {
	//Card View
	if (todoViewCard) {
		return (`
		<div class="breaker-layout__panel">
			<div class="mdc-card ` + (transi ? 'todo-card' : '') + `" id="` + fotgN + `" style="background-color: rgba(` + (fotg.trash ? '190, 190, 190, 1' : '255, 255, 255, 1') +  `)">
				<div class="mdc-ripple-surface mdc-ripple-upgraded bl1" style="display: flex; align-items: center;" data-mdc-auto-init="MDCRipple" onclick="setHashParam('todoView', '` + ((todoView == "" ? "" : todoView + "/") + fotgN) + `');">
					<div style="margin-left: 20px; width: 100%;">
						<div class="demo-card__primary" style="width: 70%">
							<h2 class="demo-card__title mdc-typography--headline6">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</h2>
						</div>
						<div class="mdc-typography--body2" style="width: 70%;">` + (fotg.desc) + `</div>
						<i class="noselect material-icons" style="font-size: 300%; position: absolute; right: 20px; top: 20px;"> ` + ((fotg.tasks == undefined) ? (fotg.filter ? ('<img style="width: 45px; transform: translateY(-12px); filter: opacity(70%);" src="../assets/icons/todoItemView.png">') : "folder") : "assignment") + ` </i>
					</div>
				</div>` +
				((fotgP.T > 0 || fotgP.IP > 0 ||fotgP.D > 0 ||fotgP.B > 0) ? `<div class="FTG-Progress-Wrapper" style="width: calc(100% - 43px); margin: 0 0 0 20px; padding: 8px 0 8px 0; height: 21px; display: flex; border-radius: 10px; overflow: hidden;" aria-label-delay="0.1s" aria-label="` +
				(fotgP.T + ' Todo / ' + fotgP.IP + ' Working / ' + fotgP.D + ' Done / ' + fotgP.B + ' Blocked') +
				`">
					<div style="height: 100%; width: ` + (fotgP.T / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, .3);"></div>
					<div style="height: 100%; width: ` + (fotgP.IP / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, .6);"></div>
					<div style="height: 100%; width: ` + (fotgP.D / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, 1);;"></div>
					<div style="height: 100%; width: ` + (fotgP.B / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(255,0,0, 1);"></div>
				</div>` : ``) +
				`<div class="mdc-card__action-icons">
					<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
				</div>
				<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" data-menu-offset="0 -27">
					<li class="mdc-elevation--z10">
						<ul class="mdc-list">
							<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoEditFTG('` + fotgN + `')">
								<span class="noselect mdc-list-item__graphic material-icons">edit</span>
								<span class="noselect mdc-list-item__text">Edit</span>
							</li>` +
							(fotg.trash ?
							`<li class="mdc-list-item" data - mdc - auto - init="MDCRipple" onclick = "TodoRecoverFTG('` + fotgN + `')" >
								<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
								<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
							</li >
							<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteFTG('` + fotgN + `')">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
								<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
							</li>` :
							`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoTrashFTG('` + fotgN + `')">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
							</li>` ) +
						`</ul>
					</li>
				</ul>
			</div>
		</div>
		`);}
	//List View
	else {
		return (`
		<tr style="` + (fotg.trash ? 'background-color: rgba(190, 190, 190, 1)' : '') + `">
			<td style="min-width: 60px; max-width: 60px; float: left; overflow: visible; text-overflow: visible;">
				<i data-mdc-auto-init="MDCIconToggle" onclick="setHashParam('todoView', '` + ((todoView == "" ? "" : todoView + "/") + fotgN) + `');" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80); font-size: 200%;" role="button" aria-pressed="false">` + ((fotg.tasks == undefined) ? "folder" : "assignment") + `</i>
			</td>
			<td style="min-width: 300px; width: 20%; padding-left: 30px;">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</td>
			<td style="min-width: 400px; width: 60%;">` + (fotg.desc) + `</td>
			<td style="min-width: 90px; max-width: 90px; padding: 0;">
				<div class="FTG-Progress-Wrapper" style="overflow: visible !important; width: 60px; margin: 0 0 0 0; padding: 0 0 0 0; height: 5px; display: flex; border-radius: 1px;" aria-label-delay="0.1s" aria-label="` +
				(fotgP.T + ' Todo / ' + fotgP.IP + ' Working / ' + fotgP.D + ' Done / ' + fotgP.B + ' Blocked') +
				`">
					<div style="overflow: visible; height: 100%; width: ` + (fotgP.T / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, .3);"></div>
					<div style="overflow: visible; height: 100%; width: ` + (fotgP.IP / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, .6);"></div>
					<div style="overflow: visible; height: 100%; width: ` + (fotgP.D / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(0,0,0, 1);;"></div>
					<div style="overflow: visible; height: 100%; width: ` + (fotgP.B / (fotgP.T + fotgP.IP + fotgP.D + fotgP.B) * 100) + `%; background-color: rgba(255,0,0, 1);"></div>
				</div>
			</td>
			<td style="min-width: 60px; max-width: 60px; float: right; z-index: 300; overflow: visible; text-overflow: visible; display: block;">
				<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu('` + ('#ddm_' + fotgN) + `', true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
			</td>
			<td style="width: 0px; padding: 0px; margin: 0px; border: 0px; height: 0px;">
				<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" id="` + ('ddm_' + fotgN) + `">
					<li class="mdc-elevation--z10">
						<ul class="mdc-list">
							<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoEditFTG('` + fotgN + `')">
								<span class="noselect mdc-list-item__graphic material-icons">edit</span>
								<span class="noselect mdc-list-item__text">Edit</span>
							</li>` +
							(fotg.trash ?
							`<li class="mdc-list-item" data - mdc - auto - init="MDCRipple" onclick = "TodoRecoverFTG('` + fotgN + `')" >
								<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
								<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
							</li >
							<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteFTG('` + fotgN + `')">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
								<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
							</li>` :
							`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoTrashFTG('` + fotgN + `')">
								<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
								<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
							</li>` ) +
						`</ul>
					</li>
				</ul>
			</td>
		</tr>
		`);
	}
}
//Tasks
function TodoGetTaskHtml(tgt, tgtN, transi) {
	//The Card
	var r1 =  `
	<div class="breaker-layout__panel">
		<div class="mdc-card ` + (transi ? 'todo-card' : '') + `" style="position: relative; background-color: rgba(` + (tgt.status == 4 ? '190, 190, 190' : '255, 255, 255') + `, 1)">
			<div style="margin-left: 20px">
				<div class="demo-card__primary" style="width: 70%">
					<h2 class="demo-card__title mdc-typography--headline6">` + (tgt.title) + `</h2>
				</div>
				<div class="demo-card__secondary mdc-typography--body2" style="width: 85%; font-size: .95rem; font-weight: 500; transform: translate(7px, -10px);">` + (tgt.status == 1 || tgt.status == 2 ? tgt.people : tgt.targets.join(", ")) + `</div>
				<div class="demo-card__secondary mdc-typography--body2" style="width: 85%">` + tgt.desc + `</div>
				<div class="demo-card__secondary mdc-typography--body2" style="width: 85%; background: rgba(252, 173, 37, 0.3);">` + MSN(tgt.reason) + `</div>
				<i class="noselect material-icons mdc-icon-toggle" onclick="TodoCSTask('` + tgtN + `')" data-mdc-auto-init="MDCIconToggle" style="position: absolute; right: 8px; top: 8px;"> <img style="transform: translate(-5px, -5.5px)" src="` + TodoGetTaskStatus(Number(tgt.status)) + `"/> </i>
			</div>
			<div class="mdc-card__action-icons">
				<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu('#ddm-` + tgtN + `', true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
			</div>
		</div>
	</div>
	`;
	//The Dropdown Menu
	var r2 = `
	<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;" id="ddm-` + tgtN + `" data-menu-offset="0 -27">
		<li class="mdc-elevation--z10">
			<ul class="mdc-list">
				<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="TodoEditTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `)">
					<span class="noselect mdc-list-item__graphic material-icons">edit</span>
					<span class="noselect mdc-list-item__text">Edit</span>
				</li>
				<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="TodoCSTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `)">
					<span class="noselect mdc-list-item__graphic material-icons">assignment_turned_in</span>
					<span class="noselect mdc-list-item__text">Change Status</span>
				</li>` +
				(tgt.status == 4 ?
				`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoRecoverTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `)">
					<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
					<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
				</li >
				<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `)">
					<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
					<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
				</li>` :
				`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoTrashTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `)">
					<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
					<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
				</li>` ) +
			`</ul>
		</li>
	</ul>
	`;
	return [r1, r2];
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Add  -------------------------------------------------\\
var TodoAddFab = new FabHandler(document.querySelector('#Todo-Add-Fab'));
TodoAddFab.element.addEventListener('click', function () {
	// Folder and Task-Groups (FTG)
	if (!todoViewingTaskGroup) {
		ShiftingDialog.set("TodoAddFTG", "Add Folder or Task-Group", "Submit", "Cancel",
			mainSnips.dropDown("TodoAdd_Type", "Type", "", "TodoAddFTGDropdownUpdate()", ["Folder", "Folder - Contains Other Folders and Task-Groups", true], ["Task-Group", "Task-Group - Contains Tasks", false], ["Item-View", "Item-View - Contains Anything Matching It's Filter", false]) +
			mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Item", null, null, true) +
			mainSnips.textArea("TodoAdd_Desc", "Description", "A Desc Of the Item") +
			mainSnips.textField("TodoAdd_Filter", "Filter", `A Pattern To Display Children`, null, "display: none;", null, null, "Examples: <br> Programming => Search Results For Programming <br> target: @Anyone => Every Task With A Target Anyone <br> target: LiamSnow => Every Task Assigned To Liam <br> target: @Scout-Team @Programming => Every Task Assigned To The Scout Team or Programming Team")
		);
		ShiftingDialog.open();
	}
	// Tasks
	else {
		ShiftingDialog.set("TodoAddTask", "Add a new Task", "Submit", "Cancel",
			mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Task", null, null, true) +
			mainSnips.textFieldUsersAutoComplete("TodoAdd_Target", "People", "People able or have to complete this task") +
			mainSnips.checkbox("TodoAdd_Notify", "Notify Users?") + 
			mainSnips.textArea("TodoAdd_Desc", "Description", "A Desc Of the Task")
		);
		ShiftingDialog.open();
	}
});
function TodoAddFTGDropdownUpdate() {
	document.querySelector('#TodoAdd_Filter').parentNode.style.display = (document.querySelector("#TodoAdd_Type").value == "Item-View") ? "block" : "none";
}
// Folder and Task-Groups (FTG)
ShiftingDialog.addSubmitListener("TodoAddFTG", function (content) {
	try {
		var title = content.querySelector("#TodoAdd_Title").value || "";
		var type = content.querySelector("#TodoAdd_Type").value || "";
		var desc = content.querySelector("#TodoAdd_Desc").value || "";
		var filter = content.querySelector("#TodoAdd_Filter").value || "";

		var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();

		var json = { title: title, desc: desc };
		if (type == "Task-Group") json.tasks = {};
		else if (type == "Item-View") {
			if (stringUnNull(filter) == "") {
				ShiftingDialog.throwFormError("Please Enter A Valid Filter", content.querySelector("#TodoAdd_Filter"))
				ShiftingDialog.enableSubmitButton(true);
				return false;
			}
			else if (TodoValidateFixFilter(filter)[1].length > 0) {
				ShiftingDialog.throwFormError(TodoValidateFixFilter(filter)[1], content.querySelector("#TodoAdd_Filter"))
				ShiftingDialog.enableSubmitButton(true);
				return false;
			}
			filter = TodoValidateFixFilter(filter)[0];
			json.filter = filter;
		}
		firebase.app().firestore().collection("Todo").add(json)
			.then(function (doc) {
				tocJson = pushDataToJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), doc.id, { } );

				firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
					.then(function () {
						ShiftingDialog.close();
					});
			});
	} catch (err) { }
});
// Tasks
ShiftingDialog.addSubmitListener("TodoAddTask", function (content) {
	try {
		var title = content.querySelector("#TodoAdd_Title").value || "";
		var desc = content.querySelector("#TodoAdd_Desc").value.replace(/\n/g, '<br>') || "";
		var targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];
		var notifyUsers = document.querySelector("#TodoAdd_Notify").checked;

		if (content.querySelector("#TodoAdd_Target").value || "" != "") {
			var _targetsValid = AutocompleteUsersValidate(targets);
			if (_targetsValid != true) {
				ShiftingDialog.throwFormError(_targetsValid, content.querySelector("#TodoAdd_Target"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

		if (notifyUsers) {
			for (var i = 0; i < targets.length; i++) {
				if (targets[i].charAt(0) != "#" && targets[i].charAt(0) != "@")
					notifications.send(users.getUid(targets[i]), "Added To Task", users.getCurrentUsername() + " has created the task " + title + " and added you as a target", users.getCurrentUser().avatar);
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
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Delete  -------------------------------------------------\\
//FTG
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
	try {
		var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();
		firebase.app().firestore().collection("Todo").doc(TodoFTG_Deleting).delete()
			.then(function () {
				tocJson = deleteDataFromJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), TodoFTG_Deleting);
				firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
					.then(function () {
						ShiftingDialog.close();
					});
			});
	} catch (err) { }
});
//Tasks
var TodoTask_Deleting = ["", null];
function TodoConfirmDeleteTask(item, parent) {
	TodoTask_Deleting = [item, parent];
	var itemData = (findObjectByKey(todoSnapshot.docs, "id", (parent ? parent : (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView))).data()).tasks[item];
	ShiftingDialog.set("TodoDeleteTask", "Delete Task", "Yes", "No",
		mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
		`<div style="width: 100%"></div>` +
		`<h1 style="text-align: center;"> Are you sure you want to delete ` + itemData.title + `?</h1>`
		, true, true);
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TodoDeleteTask", function (content) {
	try {
		var ctgN = TodoTask_Deleting[1] ? TodoTask_Deleting[1] : (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView);
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();
		delete ctg.tasks[TodoTask_Deleting[0]];
		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg)
			.then(function () {
				ShiftingDialog.close();
			});
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Trash/Junk  -------------------------------------------------\\
//FTG
function TodoTrashFTG(item) {
	try {
		var itemData = findObjectByKey(todoSnapshot.docs, "id", item).data();
		itemData.trash = true;
		firebase.app().firestore().collection("Todo").doc(item).set(itemData);
	} catch (err) { }
}
function TodoRecoverFTG(item) {
	try {
		var itemData = findObjectByKey(todoSnapshot.docs, "id", item).data();
		itemData.trash = false;
		firebase.app().firestore().collection("Todo").doc(item).set(itemData);
	} catch (err) { }
}
//Tasks
function TodoTrashTask(item, parent) {
	try {
		var ctgN = parent ? parent : todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();
		ctg.tasks[item].status = 4;
		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg);
	} catch (err) { }
}
function TodoRecoverTask(item, parent) {
	try {
		var ctgN = parent ? parent : todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();
		ctg.tasks[item].status = 0;
		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg);
	} catch (err) { }
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Edit  -------------------------------------------------\\
//FTG
var TodoFTG_Editing = "";
function TodoEditFTG(item) {
	TodoFTG_Editing = item;
	var itemData = findObjectByKey(todoSnapshot.docs, "id", item).data();
	ShiftingDialog.set("TodoEditFTG", "Edit the " + MSNC(itemData.tasks, "Task-Group ", "Folder ") + itemData.title, "Submit", "Cancel",
		mainSnips.dropDown("TodoEdit_Type", "Type", "", "TodoEditFTGDropdownUpdate()", ["Folder", "Folder - Contains Other Folders and Task-Groups", !itemData.tasks && !itemData.filter], ["Task-Group", "Task-Group - Contains Tasks", itemData.tasks && !itemData.filter], ["Item-View", "Item-View - Contains Anything Matching It's Filter", !itemData.tasks && itemData.filter]) +
		mainSnips.textField("TodoEdit_Title", "Title", "The Title of the Item", null, null, true, itemData.title) +
		mainSnips.textField("TodoEdit_Desc", "Description", "A Description of the Item", null, null, false, itemData.desc) +
		mainSnips.textField("TodoEdit_Filter", "Filter", `A Pattern To Display Children`, null, "display: " + ((!itemData.tasks && itemData.filter) ? "block" : "none") + ";", null, itemData.filter || "", "Examples: <br> Programming => Search Results For Programming <br> target: @Anyone => Every Task With A Target Anyone <br> target: LiamSnow => Every Task Assigned To Liam <br> target: @Scout-Team @Programming => Every Task Assigned To The Scout Team or Programming Team")
	);
	ShiftingDialog.open();
}
function TodoEditFTGDropdownUpdate() {
	document.querySelector('#TodoEdit_Filter').parentNode.style.display = (document.querySelector("#TodoEdit_Type").value == "Item-View") ? "block" : "none";
}
ShiftingDialog.addSubmitListener("TodoEditFTG", function (content) {
	try {
		var title = content.querySelector("#TodoEdit_Title").value || "";
		var type = content.querySelector("#TodoEdit_Type").value || "";
		var desc = content.querySelector("#TodoEdit_Desc").value || "";
		var filter = content.querySelector("#TodoEdit_Filter").value || "";
		var tasks = findObjectByKey(todoSnapshot.docs, "id", TodoFTG_Editing).data().tasks;

		var conf = (type == "Folder" && tasks != undefined) ? confirm("Are you sure you want to change this to a folder and remove all of it's tasks?") : true;

		if (conf) {
			var json = { title: title, desc: desc };
			if (type == "Task-Group") json["tasks"] = (tasks || {});
			else if (type == "Item-View") {
				if (stringUnNull(filter) == "") {
					ShiftingDialog.throwFormError("Please Enter A Valid Filter", content.querySelector("#TodoEdit_Filter"))
					ShiftingDialog.enableSubmitButton(true);
					return false;
				}
				else if (TodoValidateFixFilter(filter)[1].length > 0) {
					ShiftingDialog.throwFormError(TodoValidateFixFilter(filter)[1], content.querySelector("#TodoEdit_Filter"))
					ShiftingDialog.enableSubmitButton(true);
					return false;
				}
				filter = TodoValidateFixFilter(filter)[0];
				json.filter = filter;
			}
			firebase.app().firestore().collection("Todo").doc(TodoFTG_Editing).set(json)
				.then(function (doc) {
					ShiftingDialog.close();
				});
		}
		else {
			ShiftingDialog.enableSubmitButton(true);
			}
	} catch (err) { }
});
//Tasks
var TodoTasks_Editing = ["", null];
function TodoEditTask(item, parent) {
	TodoTasks_Editing = [item, parent];
	var itemData = findObjectByKey(todoSnapshot.docs, "id", (parent ? parent : (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView))).data().tasks[item];
	ShiftingDialog.set("TodoEditTask", "Edit " + itemData.title, "Submit", "Cancel",
		mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Task", null, null, true, itemData.title) +
		mainSnips.textFieldUsersAutoComplete("TodoAdd_Target", "People", "People able or have to complete this task", null, itemData.targets.join(" ")) +
		mainSnips.checkbox("TodoAdd_Notify", "Notify New Users?") + 
		mainSnips.textArea("TodoAdd_Desc", "Description", "A Desc Of the Task", null, itemData.desc.replace(/<br>/g, '\n'))
	);
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TodoEditTask", function (content) {
	try {
		var title = content.querySelector("#TodoAdd_Title").value || "";
		var desc = content.querySelector("#TodoAdd_Desc").value.replace(/\n/g, '<br>') || "";
		var targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];
		var notifyUsers = document.querySelector("#TodoAdd_Notify").checked;

		if (content.querySelector("#TodoAdd_Target").value || "" != "") {
			var _targetsValid = AutocompleteUsersValidate(targets);
			if (_targetsValid != true) {
				ShiftingDialog.throwFormError(_targetsValid, content.querySelector("#TodoAdd_Target"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

		var ctgN = TodoTasks_Editing[1] ? TodoTasks_Editing[1] : todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

		if (notifyUsers) {
			var newTargets = targets.diff(ctg.tasks[TodoTasks_Editing[0]].targets);
			for (var i = 0; i < newTargets.length; i++) {
				if (newTargets[i].charAt(0) != "#" && newTargets[i].charAt(0) != "@")
					notifications.send(users.getUid(newTargets[i]), "Added To Task", users.getCurrentUsername() + " has changed the task " + title + " and added you as a new target");
			}
		}

		ctg.tasks[TodoTasks_Editing[0]] = { title: title, desc: desc, targets: targets, status: ctg.tasks[TodoTasks_Editing[0]].status || 0 };

		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg).then(function () {
			ShiftingDialog.close();
		});
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Change Status  -------------------------------------------------\\
var TodoTasks_CS = ["", null];
function TodoCSTask(item, parent) { //  CS (Change Status)
	TodoTasks_CS = [item, parent];
	var itemData = findObjectByKey(todoSnapshot.docs, "id", (parent ? parent : (todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView))).data().tasks[item];
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
	try {
		var status = getRadioButtonValue(content.querySelector("#TodoCS_State")).split('-')[1];
		var reason = content.querySelector("#TodoCS_Reason").value;
		var people = content.querySelector("#TodoCS_People").value;

		var ctgN = TodoTasks_CS[1] ? TodoTasks_CS[1] : todoView.indexOf('/') != -1 ? todoView.substring(todoView.lastIndexOf('/') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

		ctg.tasks[TodoTasks_CS[0]].status = Number(status);
		ctg.tasks[TodoTasks_CS[0]].reason = reason;
		ctg.tasks[TodoTasks_CS[0]].people = people;

		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg).then(function () {
			ShiftingDialog.close();
		});
	} catch (err) { }
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

function getTodoTableStart(useTable, transi) {
	if (useTable)
		return `
		<div class="material-table material-table--card ` + (transi ? 'todo-card' : '') + ` table-responsive" style="overscroll-behavior: none; width: calc(100vw - 30px); overflow: scroll; position: fixed; height: calc(100vh - 135px); transform: translateY(20px)">
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

function TodoValidateFixFilter(filter) {
	try {
		// "targets:" => "target:"
		while (filter.toLowerCase().indexOf('targets:') != -1) { filter = filter.substr(0, filter.toLowerCase().indexOf('targets:') + 6) + filter.substr(filter.toLowerCase().indexOf('targets:') + 7); }

		// "Target:" => "target:"
		while (filter.indexOf('Target:') != -1) {
			filter = filter.substr(0, filter.indexOf('Target:')) + 't' + filter.substr(filter.indexOf('Target:') + 1);
		}

		// Remove all other targets
		if (filter.indexOf('target:') != -1) {
			filter = filter.split('target:').join("");

			// Check Names
			var invTars = "";
			var tars = filter.split(' ');
			tars.shift();
			tars = AutocompleteUsersValidate(tars);
			if (tars != true)
				invTars = tars;

			return [("target: " + filter), invTars];
		}
		else return [filter, ""];
	} catch (err) { console.error(err); return [filter, ""]; }
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Get Folder and Task-Group Status  -------------------------------------------------\\
function TodoTaskGroupStatus(id) {
	try {
		var ret = { T: 0, IP: 0, D: 0, B: 0, J: 0 };
		var tasks = findObjectByKey(todoSnapshot.docs, "id", id).data().tasks;
		for (var i = 0; i < Object.keys(tasks).length; i++) {
			ret[Object.keys(ret)[tasks[Object.keys(tasks)[i]].status]]++;
		}
		return ret;
	} catch (err) {
		return { T: 0, IP: 0, D: 0, B: 0, J: 0 }; }
}

function TodoFolderStatus(id) {
	try {
		var toc = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();
		var doc = findNestedKey(toc, id);
		return TodoProcessNestedStatus(doc);
	} catch (err) {
		return { T: 0, IP: 0, D: 0, B: 0, J: 0 }; }
}

function TodoProcessNestedStatus(obj) {
	try {
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
	} catch (err) {
		return { T: 0, IP: 0, D: 0, B: 0, J: 0 };
	}
}

function TodoCombineStatus(s1, s2) {
	try {
		return { T: s1.T + s2.T, IP: s1.IP + s2.IP, D: s1.D + s2.D, B: s1.B + s2.B, J: s1.J + s2.J };
	} catch (err) {
		return { T: 0, IP: 0, D: 0, B: 0, J: 0 } }
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Searching  -------------------------------------------------\\
//Get Search Data
var TodoAllFTGT = [];
var TodoSearchEngine;
var TodoPeopleSearchEngine;
function getTodoTabSearchData() {
	try {
		var allData = [];
		var data;
		var td;
		for (var i = 0; i < todoSnapshot.docs.length; i++) {
			if (todoSnapshot.docs[i].id != "TableOfContents") {
				data = todoSnapshot.docs[i].data();
				data.key = todoSnapshot.docs[i].id;
				allData.push(data);
				if (data.tasks)
					for (var i2 = 0; i2 < Object.keys(data.tasks).length; i2++) {
						td = data.tasks[Object.keys(data.tasks)[i2]];
						td.key = ('task-' + Object.keys(data.tasks)[i2]);
						td.parent = (data.key);
						allData.push(td);
					}
			}
		}
		TodoAllFTGT = allData;
		TodoSearchEngine = new Fuse(TodoAllFTGT, {
			shouldSort: true,
			threshold: 0.6,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
				"title",
				"desc",
				"targets"
			]
		});
		TodoPeopleSearchEngine = new Fuse(TodoAllFTGT, {
			shouldSort: true,
			threshold: 0.6,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 4,
			keys: [
				"targets"
			]
		});
	} catch (err) { }
}
//Access Search
var TodoInSearch = false;
var TodoSearchResults = {};
function TodoInitSearch() {
	try {
		setTimeout(function () {
			addHeaderSearchInputListener('Todo', function (inp) {
				if (stringUnNull(inp) == "") {
					TodoInSearch = false;
					TodoSearchResults = {};
				}
				else {
					TodoInSearch = true;
					TodoSearchResults = TodoSearchEngine.search(inp);
				}
				drawTodoTab();
			});
		}, 10);
	} catch (err) { }
}
//  ----------------------------------------    -------------------------------------------------\\
