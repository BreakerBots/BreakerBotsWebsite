//TodoTab.js

//  ----------------------------------------  Initialization  -------------------------------------------------\\
var TodoTab = new RegisteredTab("Todo", null, todoTabInit, todoTabExit, false, "todoView");
var todoSnapshot;
var todoDrawn;
var todoView;
var todoViewingTaskGroup = false;
var todoViewCard = true;
function todoTabInit() {
	TodoAddFab.tabSwitch();
	setTimeout(function () { headerUseSearch(true); }, 10);
}

window.addEventListener('DOMContentLoaded', todoTabFirstInit);
function todoTabFirstInit() {
	firebase.app().firestore().collection("Todo")
		.onSnapshot(function (snapshot) {
			todoSnapshot = snapshot;
			getTodoTabSearchData();

			todoView = stringUnNull(getHashParam('todoView'));
			if ((getCurrentTab() == "Todo") && (todoSnapshot)) {
				todoDrawn = todoView;
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
	todoDrawTransition = todoDrawTransition || false;

	//Find the dir to show
	todoView = stringUnNull(getHashParam('todoView'));

	//Get the table of contents and then find the directory
	var toc = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents");
	var tocR = (todoView == "") ? toc.data() : refByString(toc.data(), todoView);

	//Stop if path is invalid
	if (tocR == undefined) {
		setHashParam('todoView', todoView.substring(0, todoView.lastIndexOf('\\')));
		return false;
	}

	//Fill in the stepper with new data
	fillTodoStepper(todoView, todoSnapshot.docs);

	var cv = findObjectByKey(todoSnapshot.docs, "id", (todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView));

	// Not In Search
	if (!TodoInSearch) {
		var view = (cv ? (cv.data().tasks ? "Task-Group" : (cv.data().filter ? "Item-View" : "Folder")) : "Folder") || "Folder";

		// Viewing Inside Task-Group
		if (view == "Task-Group") {
			todoViewingTaskGroup = true;
			var tg = findObjectByKey(todoSnapshot.docs, "id", (todoView.lastIndexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView)).data();
			var htmlTrash = '';
			for (var i = 0; i < Object.keys(tg.tasks).length; i++) {
				try {
					var tgtN = Object.keys(tg.tasks)[i];
					var tgt = tg.tasks[tgtN];
					var toDraw = TodoGetTaskHtml(tgt, tgtN, todoDrawTransition);
					if (tgt.status == 4) htmlTrash += toDraw;
					else html += toDraw;
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
						if (data.status == 4) htmlTrash += toDraw;
						else html += toDraw;
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
					if (data.status == 4) htmlTrash += toDraw;
					else html += toDraw;
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
		html = `<div class="breaker-layout" style="position: absolute; top: 60px; left: 10px; right: 15px; min-height: 100%;">` + html + `</div>` + '<br>'.repeat(10);
		document.querySelector("html").style.overflowY = "auto";
	}
	document.querySelector("#TodoWrapper").innerHTML = html;
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
			<div class="mdc-card ` + (transi ? 'todo-card' : '') + `" id="` + fotgN + `" style="min-height: 65px; background-color: rgba(` + (fotg.trash ? '190, 190, 190, 1' : '255, 255, 255, 1') +  `)">
				<div class="mdc-ripple-surface mdc-ripple-upgraded bl1" style="cursor: pointer; display: flex; min-height: 65px; align-items: center;" data-mdc-auto-init="MDCRipple" onclick="setHashParam('todoView', '` + (todoView.split('\\').join("\\\\") + (todoView == "" ? "" : "\\\\") + fotgN) + `');">
					<div style="margin-left: 20px; width: 100%;">
						<div class="demo-card__primary" style="width: 70%">
							<h2 class="demo-card__title mdc-typography--headline6" style="overflow-wrap: break-word;">` + (fotg.title == "" ? "&nbsp;" : fotg.title) + `</h2>
						</div>
						<div class="mdc-typography--body2" style="width: 70%; overflow-wrap: break-word;">` + (fotg.desc) + `</div>
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
					<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.TodoCardDropdownMenu').innerHTML, this, 'width: 150px;')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
				</div>
				<div style="display: none" class="TodoCardDropdownMenu">
					<ul class="mdc-list">
						<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoEditFTG('` + fotgN + `'); menu.close();">
							<span class="noselect mdc-list-item__graphic material-icons">edit</span>
							<span class="noselect mdc-list-item__text">Edit</span>
						</li>` +
						(fotg.trash ?
						`<li class="mdc-list-item" data - mdc - auto - init="MDCRipple" onclick = "TodoRecoverFTG('` + fotgN + `'); menu.close();" >
							<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
							<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
						</li >` +
						(users.getCurrentClearance() > 1 ? `<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteFTG('` + fotgN + `'); menu.close();">
							<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
							<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
						</li>` : ``) :
						`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoTrashFTG('` + fotgN + `'); menu.close();">
							<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
							<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
						</li>`) +
					`</ul>
				</div>
			</div>
		</div>
		`);}
	//List View
	else {
		return (`
		<tr style="` + (fotg.trash ? 'background-color: rgba(190, 190, 190, 1)' : '') + `">
			<td style="min-width: 60px; max-width: 60px; float: left; overflow: visible; text-overflow: visible;">
				<i data-mdc-auto-init="MDCIconToggle" onclick="setHashParam('todoView', '` + (todoView.split('\\').join("\\\\") + (todoView == "" ? "" : "\\\\") + fotgN) + `');" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80); font-size: 200%;" role="button" aria-pressed="false">` + ((fotg.tasks == undefined) ? "folder" : "assignment") + `</i>
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
				<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.TodoCardDropdownMenu').innerHTML, this, 'width: 150px;')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
			</td>
			<td style="width: 0px; padding: 0px; margin: 0px; border: 0px; height: 0px;">
				<div style="display: none" class="TodoCardDropdownMenu">
					<ul class="mdc-list">
						<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoEditFTG('` + fotgN + `'); menu.close();">
							<span class="noselect mdc-list-item__graphic material-icons">edit</span>
							<span class="noselect mdc-list-item__text">Edit</span>
						</li>` +
						(fotg.trash ?
						`<li class="mdc-list-item" data - mdc - auto - init="MDCRipple" onclick = "TodoRecoverFTG('` + fotgN + `'); menu.close();" >
							<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
							<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
						</li >` +
						(users.getCurrentClearance() > 1 ? `<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteFTG('` + fotgN + `'); menu.close();">
							<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
							<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
						</li>` : ``) :
						`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoTrashFTG('` + fotgN + `'); menu.close();">
							<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete</span>
							<span class="noselect mdc-list-item__text" style="color: red">Trash</span>
						</li>`) +
					`</ul>
				</div>
			</td>
		</tr>
		`);
	}
}
//Tasks
function TodoGetTaskHtml(tgt, tgtN, transi) {
	//The Card
	return  `
	<div class="breaker-layout__panel">
		<div class="mdc-card ` + (transi ? 'todo-card' : '') + `" style="min-height: 65px; position: relative; background-color: rgba(` + (tgt.status == 4 ? '190, 190, 190' : '255, 255, 255') + `, 1)">
			<div style="margin-left: 20px; min-height: 65px;">
				<div class="demo-card__primary" style="width: 70%">
					<h2 class="demo-card__title mdc-typography--headline6" style="overflow-wrap: break-word;">` + (tgt.title) + `</h2>
				</div>
				<div class="demo-card__secondary mdc-typography--body2" style="overflow-wrap: break-word; width: 85%; font-size: .95rem; font-weight: 500; transform: translate(7px, -10px);">` + AutocompleteUidsToUsersProfileLinks((tgt.status == 1 || tgt.status == 2) ? tgt.people : tgt.targets).join(', ') + `</div>
				<div class="demo-card__secondary mdc-typography--body2" style="overflow-wrap: break-word; width: 85%">` + tgt.desc + `</div>
				<div class="demo-card__secondary mdc-typography--body2" style="overflow-wrap: break-word; width: 85%; background: rgba(252, 173, 37, 0.3);">` + MSN(tgt.reason) + `</div>
				<i class="noselect material-icons mdc-icon-toggle" onclick="TodoCSTask('` + tgtN + `')" aria-label-delay="0.15s" aria-label="Change Status" data-mdc-auto-init="MDCIconToggle" style="position: absolute; right: 8px; top: 8px;"> <img style="transform: translate(-5px, -5.5px)" src="` + TodoGetTaskStatus(Number(tgt.status)) + `"/> </i>
			</div>
			<div class="mdc-card__action-icons">
				<i data-mdc-auto-init="MDCIconToggle" onclick="menu.toggle(this.parentNode.parentNode.querySelector('.TodoTaskDropdownMenu').innerHTML, this, 'width: 180px;')" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
			</div>
			<div style="display: none" class="TodoTaskDropdownMenu">
				<ul class="mdc-list">
					<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="TodoEditTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons">edit</span>
						<span class="noselect mdc-list-item__text">Edit</span>
					</li>
					<li class="mdc-list-item mdc-ripple-surface" data-mdc-auto-init="MDCRipple" onclick="TodoCSTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons">assignment_turned_in</span>
						<span class="noselect mdc-list-item__text">Change Status</span>
					</li>` +
					(tgt.status == 4 ?
					`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoRecoverTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: green">restore_from_trash</span>
						<span class="noselect mdc-list-item__text" style="color: green">Recover</span>
					</li >
					<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoConfirmDeleteTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
						<span class="noselect mdc-list-item__graphic material-icons" style="color: red">delete_forever</span>
						<span class="noselect mdc-list-item__text" style="color: red">Delete Forever</span>
					</li>` :
					`<li class="mdc-list-item" data-mdc-auto-init="MDCRipple" onclick="TodoTrashTask('` + tgtN + `'` + MSN(tgt.parent, ", '", "'", "") + `); menu.close();">
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
var TodoAddFab = new FabHandler(document.querySelector('#Todo-Add-Fab'));
var TodoAddRichText;
TodoAddFab.element.addEventListener('click', function () {
	// Folder and Task-Groups (FTG)
	if (!todoViewingTaskGroup) {
		ShiftingDialog.set({
			id: "TodoAddFTG",
			title: "Add Folder or Task-Group",
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnExternalClick: true,
			contents:
				mainSnips.dropDown("TodoAdd_Type", "Type", "", "TodoAddFTGDropdownUpdate()", ["Folder", "Folder - Contains Other Folders and Task-Groups", true], ["Task-Group", "Task-Group - Contains Tasks", false], ["Item-View", "Item-View - Contains Anything Matching It's Filter", false]) +
				mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Item", null, null, true) +
				mainSnips.textArea("TodoAdd_Desc", "Description", "A Desc Of the Item") +
				mainSnips.textField("TodoAdd_Filter", "Filter", `A Pattern To Display Children`, null, "display: none;", null, null, "Examples: <br> Programming => Search Results For Programming <br> target: @Anyone => Every Task With A Target Anyone <br> target: LiamSnow => Every Task Assigned To Liam <br> target: @Scout-Team @Programming => Every Task Assigned To The Scout Team or Programming Team")
		});
		ShiftingDialog.open();
	}
	// Tasks
	else {
		ShiftingDialog.set({
			id: "TodoAddTask",
			title: "Add a new Task",
			submitButton: "Submit",
			cancelButton: "Cancel",
			dontCloseOnExternalClick: true,
			contents:
				mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Task", null, null, true) +
				mainSnips.richText("TodoAdd_Desc", "Description") +
				mainSnips.textFieldUsersAutoComplete("TodoAdd_Target", "People", "People able or have to complete this task") +
				mainSnips.checkbox("TodoAdd_Notify", "Notify Users?")
		});
		TodoAddRichText = new BreakerRichText(document.querySelector('#TodoAdd_Desc'), "", {
			textColor: false,
			fillColor: false,
			textSize: false,
			link: true,
			image: true,
			align: false,
			lists: true
		});
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
				tocJson = pushDataToJsonByDotnot(findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data(), stringUnNull(getHashParam('todoView')), doc.id, { } );

				firebase.app().firestore().collection("Todo").doc("TableOfContents").set(tocJson)
					.then(function () {
						TodoAddToHistory(
							"add",
							null,
							json,
							"ftg",
							doc.id
						);
						ShiftingDialog.close();
					});
			});
	} catch (err) { }
});
// Tasks
ShiftingDialog.addSubmitListener("TodoAddTask", function (content) {
	try {
		var title = content.querySelector("#TodoAdd_Title").value || "";
		var desc = TodoAddRichText.content || "";
		var targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];
		var notifyUsers = document.querySelector("#TodoAdd_Notify").checked;

		content.querySelector("#TodoAdd_Target").value = AutocompleteUsersFix(targets).join(" ");
		targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];
		if (content.querySelector("#TodoAdd_Target").value || "" != "") {
			var _targetsValid = AutocompleteUsersValidate(targets);
			if (_targetsValid != true) {
				ShiftingDialog.throwFormError(_targetsValid, content.querySelector("#TodoAdd_Target"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

		targets = AutocompleteUsersToUids(targets);

		if (notifyUsers) {
			for (var i = 0; i < targets.length; i++) {
				if (targets[i].charAt(0) != "#" && targets[i].charAt(0) != "@")
					notifications.send(users.getUid(targets[i]), "Added To Task", users.getCurrentUsername() + " has created the task " + title + " and added you as a target", users.getCurrentUser().avatar);
			}
		}

		var ctgN = todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

		//Find a unused id
		var AIDs = guid();
		while (ctg.tasks[AIDs] != undefined) {
			AIDs = guid();
		}

		ctg.tasks[AIDs] = { title: title, desc: desc, targets: targets, status: 0 };

		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg)
			.then(function () {
				var newData = ctg.tasks[AIDs];
				newData.desc.replace(/<img.*>/, 'IMAGE');
				TodoAddToHistory(
					"add",
					null,
					newData || null,
					"task",
					ctgN + "\\" + AIDs
				);
				ShiftingDialog.close();
			})
			.catch(function (a) {
				if (a.toString().indexOf('bytes') != -1) {
					alert('It Seems There Are Two Many Images In This Task-Group, \n Dont Worry, This is a bug in datebase that will be fixed soon.');
				}
				else {
					alert("An Unknown Error Has Occured, \n This May Be Because of A Bad Internet Connection, or a Server Error.");
				}
				ShiftingDialog.enableSubmitButton();
			});
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Delete  -------------------------------------------------\\
//FTG
var TodoFTG_Deleting = "";
function TodoConfirmDeleteFTG(item) {
	if (users.getCurrentClearance() > 1) {
		TodoFTG_Deleting = item;
		var itemData = findObjectByKey(todoSnapshot.docs, "id", item).data();
		ShiftingDialog.set({
			id: "TodoDeleteFTG",
			title: "Delete Item",
			submitButton: "Yes",
			cancelButton: "No",
			contents:
				mainSnips.icon(null, "delete", "font-size: 160px; color: red;") +
				`<div style="width: 100%"></div>` +
				`<h1 style="text-align: center;"> Are you sure you want to delete the ` + (itemData.tasks == undefined ? "folder " : "task-group ") + (itemData.title == "" ? "that is unnamed" : itemData.title) + `? <br>This Action Cannot Be Undone</h1>`
			, centerButtons: true
		});
		ShiftingDialog.open();
	} else alert("You Need Be A Higher Clearance");
}
ShiftingDialog.addSubmitListener("TodoDeleteFTG", function (content) {
	try {
		var tocJson = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents").data();

		//Get All Docs To Delete
		var childDocs = stringUnNull(getHashParam('todoView'));
		if (childDocs != "") childDocs += '\\\\';
		var tdd = refByString(tocJson, childDocs + TodoFTG_Deleting);
		childDocs = tdd;
		childDocs = GetAllNestedKeys(childDocs); childDocs.push(TodoFTG_Deleting);

		//Start The Batch
		var batch = firebase.app().firestore().batch();

		//Delete It From The Table Of Contents
		tocJson = deleteDataFromJsonByDotnot(tocJson, stringUnNull(getHashParam('todoView')), TodoFTG_Deleting);
		batch.set(firebase.app().firestore().collection("Todo").doc("TableOfContents"), tocJson);

		childDocs.forEach(function (doc) {
			batch.delete(firebase.app().firestore().collection("Todo").doc(doc));
		});

		batch.commit()
			.then(function () {
				TodoAddToHistory(
					"delete",
					{ [TodoFTG_Deleting]: (tdd || null) },
					null,
					"ftg",
					TodoFTG_Deleting
				);
				ShiftingDialog.close();
			}).catch(function (err) {
				ShiftingDialog.close();
				alert('An Error Has Occured');
				console.error(err);
			});
	} catch (err) { console.log(203, err); }
});
//Tasks
var TodoTask_Deleting = ["", null];
function TodoConfirmDeleteTask(item, parent) {
	TodoTask_Deleting = [item, parent];
	var itemData = (findObjectByKey(todoSnapshot.docs, "id", (parent ? parent : (todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView))).data()).tasks[item];
	ShiftingDialog.set({
		id: "TodoDeleteTask",
		title: "Delete Task",
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
ShiftingDialog.addSubmitListener("TodoDeleteTask", function (content) {
	try {
		var ctgN = TodoTask_Deleting[1] ? TodoTask_Deleting[1] : (todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView);
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();
		var taskData = ctg.tasks[TodoTask_Deleting[0]];
		delete ctg.tasks[TodoTask_Deleting[0]];
		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg)
			.then(function () {
				delete taskData.desc;
				TodoAddToHistory(
					"delete",
					taskData,
					null,
					"task",
					ctgN + "\\" + TodoTask_Deleting[0]
				);
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
		var ctgN = parent ? parent : todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();
		ctg.tasks[item].status = 4;
		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg);
	} catch (err) { }
}
function TodoRecoverTask(item, parent) {
	try {
		var ctgN = parent ? parent : todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView;
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
	ShiftingDialog.set({
		id: "TodoEditFTG",
		title: "Edit the " + MSNC(itemData.tasks, "Task-Group ", "Folder ") + itemData.title,
		submitButton: "Submit",
		cancelButton: "Cancel",
		dontCloseOnExternalClick: true,
		contents:
			mainSnips.dropDown("TodoEdit_Type", "Type", "", "TodoEditFTGDropdownUpdate()", ["Folder", "Folder - Contains Other Folders and Task-Groups", !itemData.tasks && !itemData.filter], ["Task-Group", "Task-Group - Contains Tasks", itemData.tasks && !itemData.filter], ["Item-View", "Item-View - Contains Anything Matching It's Filter", !itemData.tasks && itemData.filter]) +
			mainSnips.textField("TodoEdit_Title", "Title", "The Title of the Item", null, null, true, itemData.title) +
			mainSnips.textField("TodoEdit_Desc", "Description", "A Description of the Item", null, null, false, itemData.desc) +
			mainSnips.textField("TodoEdit_Filter", "Filter", `A Pattern To Display Children`, null, "display: " + ((!itemData.tasks && itemData.filter) ? "block" : "none") + ";", null, itemData.filter || "", "Examples: <br> Programming => Search Results For Programming <br> target: @Anyone => Every Task With A Target Anyone <br> target: LiamSnow => Every Task Assigned To Liam <br> target: @Scout-Team @Programming => Every Task Assigned To The Scout Team or Programming Team")
	});
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
			var lastData = findObjectByKey(todoSnapshot.docs, "id", TodoFTG_Editing).data();
			firebase.app().firestore().collection("Todo").doc(TodoFTG_Editing).set(json)
				.then(function (doc) {
					TodoAddToHistory(
						"edit",
						lastData || null,
						json,
						"ftg",
						TodoFTG_Editing
					);
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
var TodoEditRichText;
function TodoEditTask(item, parent) {
	TodoTasks_Editing = [item, parent];
	var itemData = findObjectByKey(todoSnapshot.docs, "id", (parent ? parent : (todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView))).data().tasks[item];
	ShiftingDialog.set({
		id: "TodoEditTask",
		title: "Edit " + itemData.title,
		submitButton: "Submit",
		cancelButton: "Cancel",
		dontCloseOnExternalClick: true,
		contents:
			mainSnips.textField("TodoAdd_Title", "Title", "The Title of the Task", null, null, true, itemData.title) +
			mainSnips.richText("TodoAdd_Desc", "Description") +
			mainSnips.textFieldUsersAutoComplete("TodoAdd_Target", "People", "People able or have to complete this task", null, AutocompleteUidsToUsers(itemData.targets).join(" ")) +
			mainSnips.checkbox("TodoAdd_Notify", "Notify New Users?")
	});
	TodoEditRichText = new BreakerRichText(document.querySelector('#TodoAdd_Desc'), itemData.desc, {
		textColor: false,
		fillColor: false,
		textSize: false,
		link: true,
		image: true,
		align: false,
		lists: true
	});
	ShiftingDialog.open();
}
ShiftingDialog.addSubmitListener("TodoEditTask", function (content) {
	try { 
		var title = content.querySelector("#TodoAdd_Title").value || "";
		var desc = TodoEditRichText.content || "";
		var targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];
		var notifyUsers = document.querySelector("#TodoAdd_Notify").checked;

		content.querySelector("#TodoAdd_Target").value = AutocompleteUsersFix(targets).join(" ");
		targets = content.querySelector("#TodoAdd_Target").value.split(" ") || [];
		if (content.querySelector("#TodoAdd_Target").value || "" != "") {
			var _targetsValid = AutocompleteUsersValidate(targets);
			if (_targetsValid != true) {
				ShiftingDialog.throwFormError(_targetsValid, content.querySelector("#TodoAdd_Target"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

		targets = AutocompleteUsersToUids(targets);

		var ctgN = TodoTasks_Editing[1] ? TodoTasks_Editing[1] : todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

		if (notifyUsers) {
			var newTargets = targets.diff(ctg.tasks[TodoTasks_Editing[0]].targets);
			for (var i = 0; i < newTargets.length; i++) {
				if (newTargets[i].charAt(0) != "#" && newTargets[i].charAt(0) != "@")
					notifications.send(users.getUid(newTargets[i]), "Added To Task", users.getCurrentUsername() + " has changed the task " + title + " and added you as a new target");
			}
		}

		var lastData = ctg.tasks[TodoTasks_Editing[0]];

		ctg.tasks[TodoTasks_Editing[0]] = { title: title, desc: desc, targets: targets, status: ctg.tasks[TodoTasks_Editing[0]].status || 0 };

		var newData = ctg.tasks[TodoTasks_Editing[0]];

		firebase.app().firestore().collection("Todo").doc(ctgN).set(ctg)
			.then(function () {
				lastData.desc.replace(/<img.*>/, 'IMAGE');
				newData.desc.replace(/<img.*>/, 'IMAGE');
				TodoAddToHistory(
					"edit",
					lastData || null,
					newData || null,
					"task",
					ctgN + "\\" + TodoTasks_Editing[0]
				);
				ShiftingDialog.close();
			})
			.catch (function (a) {
				if (a.toString().indexOf('bytes') != -1) {
					alert('It Seems There Are Two Many Images In This Task-Group, \n Dont Worry, This is a bug in datebase that will be fixed soon.');
				}
				else {
					alert("An Unknown Error Has Occured, \n This May Be Because of A Bad Internet Connection, or a Server Error.");
				}
				ShiftingDialog.enableSubmitButton();
			});
	} catch (err) { }
});
//  ----------------------------------------    -------------------------------------------------\\




//  ----------------------------------------  Change Status  -------------------------------------------------\\
var TodoTasks_CS = ["", null];
function TodoCSTask(item, parent) { //  CS (Change Status)
	TodoTasks_CS = [item, parent];
	var itemData = findObjectByKey(todoSnapshot.docs, "id", (parent ? parent : (todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView))).data().tasks[item];
	ShiftingDialog.set({
		id: "TodoCSTask",
		title: "Change Status of " + itemData.title,
		submitButton: "Submit",
		cancelButton: "Cancel",
		contents: 
			mainSnips.radioButtons("TodoCS_State", [
				'<img class="noselect" src="../assets/icons/todoNS.png"/> <span style="font-size: 120%;">Todo</span> <span style="font-size: 100%;"> (To Be Done)</span>',
				'<img class="noselect" src="../assets/icons/todoIP.png"/> <span style="font-size: 120%;">In Progress</span> <span style="font-size: 100%;"> (Being Working)</span>',
				'<img class="noselect" src="../assets/icons/todoF.png"/> <span style="font-size: 120%;">Finished</span> <span style="font-size: 100%;"> (The Task is Officially Completed)</span>',
				'<img class="noselect" src="../assets/icons/todoB.png"/> <span style="font-size: 120%;">Blocked</span> <span style="font-size: 100%;"> (Stopped Because a Holdup Preventing The Task)</span>',
				'<img class="noselect" src="../assets/icons/todoD.png"/> <span style="font-size: 120%;">Junked</span> <span style="font-size: 100%;"> (Move To Trash)</span>'
			], `TodoCSSetRadioAppearance()`) +
			mainSnips.textField("TodoCS_Reason", "Reason", "The Reason in which the task is being blocked or trashed.", null, "display: none;", null, MSN(itemData.reason, "", "", "")) +
			mainSnips.textFieldUsersAutoComplete("TodoCS_People", "People", "People Working on The Task", "display: none;", AutocompleteUidsToUsers(itemData.people || []).join(' '))
	});
	ShiftingDialog.open();
	setTimeout(function () {
		setRadioButtonValue(document.querySelector("#TodoCS_State"), itemData.status || 0);
		TodoCSSetRadioAppearance(1);
	}, 10);
}
function TodoCSSetRadioAppearance(el) {
	if (el) el = document.querySelector('#' + getRadioButtonValue(document.querySelector("#TodoCS_State"), true)).querySelector("input");
	else el = event.srcElement;

	//Find and Set which textboxes it wants visible
	var selected = ([[false, false], [false, true], [false, false], [true, false], [true, false]])[getRadioButtonValue(el.parentNode.parentNode)];
	document.querySelector('#TodoCS_Reason').parentNode.style.display = selected[0] ? "block" : "none";
	document.querySelector('#TodoCS_People').parentNode.style.display = selected[1] ? "block" : "none";
}
ShiftingDialog.addSubmitListener("TodoCSTask", function (content) {
	try {
		var status = getRadioButtonValue(content.querySelector("#TodoCS_State"));
		var reason = content.querySelector("#TodoCS_Reason").value;
		var people = content.querySelector("#TodoCS_People").value;

		var ctgN = TodoTasks_CS[1] ? TodoTasks_CS[1] : todoView.indexOf('\\') != -1 ? todoView.substring(todoView.lastIndexOf('\\') + 1) : todoView;
		var ctg = findObjectByKey(todoSnapshot.docs, "id", ctgN).data();

		if ((people || "") != "") {
			people = people.split(' ');
			var _targetsValid = AutocompleteUsersValidate(people);
			if (_targetsValid != true) {
				ShiftingDialog.throwFormError(_targetsValid, content.querySelector("#TodoCS_People"));
				ShiftingDialog.enableSubmitButton(true);
				return;
			}
		}

		people = AutocompleteUsersToUids(people);

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
	else
		return `
			<div class="material-table ` + (transi ? 'todo-card' : '') + ` table-responsive" style="background: #fff; position: absolute;  min-height: 100%;">
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

			return [("target:" + filter), invTars];
		}
		else return [filter, ""];
	} catch (err) { return [filter, ""]; }
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
var TodoWorkerSearchEngine;
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
		TodoWorkerSearchEngine = new Fuse(TodoAllFTGT, {
			shouldSort: true,
			threshold: 0.6,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 4,
			keys: [
				"people"
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




//  ----------------------------------------  History  -------------------------------------------------\\
/**
 * Keep Everything in lowercase
 * @param {any} operation "add", "delete", "edit"
 * @param {any} from Before Change or null
 * @param {any} to After Change
 * @param {any} targetType "task", "ftg"
 * @param {any} targetId UID of task or ftg
 */
function TodoAddToHistory(operation, from, to, targetType, targetId) {
	try {
		firebase.app().firestore().collection("Todo").doc("History").get()
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
				firebase.app().firestore().collection("Todo").doc("History").set(data)
					.then(function () {

					})
					.catch(function () {

					});
			})
			.catch(function () {

			});
	} catch (err) { }
}
//  ----------------------------------------    -------------------------------------------------\\