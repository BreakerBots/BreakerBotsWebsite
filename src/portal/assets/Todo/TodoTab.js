//TodoTab.js

var TodoTab = new RegisteredTab("Todo", null, todoTabInit, null, false, "todoView");

var todoSnapshot;
var todoDrawn;
var todoView;
function todoTabInit() {
	firebase.app().firestore().collection("Todo")
		.onSnapshot(function (snapshot) {
			todoSnapshot = snapshot;

			todoView = stringUnNull(getHashParam('todoView'));
			if ((getCurrentTab() == "Todo") && (todoSnapshot) && (todoDrawn != todoView)) {
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

	//window.mdc.autoInit();
}

function drawTodoTab() {
	var html = "";

	//Find the dir to show
	todoView = stringUnNull(getHashParam('todoView'));

	//Get the table of contents and then find the directory
	var toc = findObjectByKey(todoSnapshot.docs, "id", "TableOfContents");
	var tocR = (todoView == "") ? toc.data() : refByString(toc.data(), todoView);

	//Fill in the stepper with new data
	fillTodoStepper(todoView, todoSnapshot.docs);

	headerUseBackArrow(todoView != "");

	//If Folder
	if (typeof tocR == "object") {
		for (var i = 0; i < Object.keys(tocR).length; i++) {
			var fotgN = Object.keys(tocR)[i];
			var fotg = findObjectByKey(todoSnapshot.docs, "id", fotgN).data();
			html += `
			<div class="col-lg-3">
				<div class="mdc-card todo-card" style="margin-bottom: 20px;">
					<div class="mdc-card__primary-action" data-mdc-auto-init="MDCRipple" onclick="setHashParam('todoView', '` + ((todoView == "" ? "" : todoView + "/") + fotgN) + `');">
						<div style="margin-left: 20px">
							<div class="demo-card__primary">
								<h2 class="demo-card__title mdc-typography--headline6">` + (fotg.title) + `</h2>
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
							  <li class="mdc-list-item">Edit</li>
							  <li class="mdc-list-item"><span style="color: red">Delete</span></li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
			`;
		}
	}
	//If Task-Group
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
							  <li class="mdc-list-item">Edit</li>
							  <li class="mdc-list-item"><span style="color: red">Delete</span></li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
			`;
		}
	}

	document.querySelector("#TodoWrapper").innerHTML = html;
}

/*
for (var i = 0; i < 10; i++) {
	var isFolder = (Math.random() > 0.5);
	document.querySelector("#TodoWrapper").innerHTML += `
<div class="col-lg-3">
	<div class="mdc-card" style="margin-bottom: 20px;">
		<div class="mdc-card__primary-action" data-mdc-auto-init="MDCRipple">
			<div style="margin-left: 20px">
				<div class="demo-card__primary">
					<h2 class="demo-card__title mdc-typography--headline6">` + (isFolder ? "A Folder Title" : "A Task-Group Title") + `</h2>
				</div>
				<div class="demo-card__secondary mdc-typography--body2">An very not interesting description, and possible an image/icon... ASDJKFASDNVASDVC AISDVN ASDKLV NSADKL NASVL NASDLKV NASLDK VN</div>
				<i class="material-icons" style="font-size: 300%; position: absolute; right: 20px; top: 20px;"> ` + (isFolder ? "folder" : "assignment") + ` </i>
			</div>
		</div>
		<div class="mdc-card__action-icons">
			<i data-mdc-auto-init="MDCIconToggle" onclick="toggleMenu(null, true)" class="mdc-icon-toggle material-icons" style="color: rgb(80, 80, 80);" role="button" aria-pressed="false">more_vert</i>
		</div>
		<ul class="dropdown-menu-c dropdown-menu be-connections" style="padding: 0;">
			<li class="mdc-elevation--z10">
				<ul class="mdc-list">
				  <li class="mdc-list-item">Edit</li>
				  <li class="mdc-list-item"><span style="color: red">Delete</span></li>
				</ul>
			</li>
		</ul>
	</div>
</div>
		`;
}
*/