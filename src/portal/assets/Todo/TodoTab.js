//TodoTab.js

var TodoTab = new RegisteredTab("Todo", null, todoTabInit, null, false);

function todoTabInit() {

	firebase.app().firestore().collection("Todo")
		.onSnapshot(function (snapshot) {
			var html = "";

			//Draw in the folders and task groups
			var toc = findObjectByKey(snapshot.docs, "id", "TableOfContents");
			for (var i = 0; i < Object.keys(toc.data()).length; i++) {
				var fotg = Object.keys(toc.data())[i];
				fotg = findObjectByKey(snapshot.docs, "id", fotg).data();
				html += `
<div class="col-lg-3">
	<div class="mdc-card" style="margin-bottom: 20px;">
		<div class="mdc-card__primary-action" data-mdc-auto-init="MDCRipple">
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

			document.querySelector("#TodoWrapper").innerHTML = html;
		});

	//window.mdc.autoInit();
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