//IHNotifications.js (In House Notifications)





//  ----------------------------------------  Notification Menu  -------------------------------------------------\\
var NotificationData;
document.addEventListener('DOMContentLoaded', function () {
	authLoadedWait(function () {
		firebase.app().firestore().collection("Notifications").doc(users.getCurrentUid()).get()
			.then(docSnapshot => {
				if (!docSnapshot.exists) {
					firebase.app().firestore().collection("Notifications").doc(users.getCurrentUid()).set({ Notifications: [] }).then(function () {
						InitNotificationMenu();
					});
				}
				else
					InitNotificationMenu();
			});
	});
}); 

function InitNotificationMenu() {
	firebase.app().firestore().collection("Notifications").doc(users.getCurrentUid())
		.onSnapshot(function (snapshot) {
			if (snapshot) {
				try {
					NotificationData = snapshot.data();
					drawNotificationMenu(NotificationData.Notifications);
				} catch (err) { }
			}
		});
}

function drawNotificationMenu(nots) {
	try {
		var html = '';
		for (var i = nots.length - 1; i >= 0; i--) {
			if (!nots[i].read)
				html += (`
					<div class="Notification-Menu-Notification">
						<div class="Notification-Menu-Notification-Image-Container">
							<img src="` + (nots[i].icon || '../assets/icons/iconT.png') + `" style="background-image: url('../assets/icons/iconT.png')" alt="" class="Notification-Menu-Notification-Image">
						</div>
						<div class="Notification-Menu-Notification-Content">
							<i onclick="MarkNotificationAsRead(` + i + `)" class="Notification-Menu-Notification-Close mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle" role="button">
								<i class="material-icons" style="transform: translate(-9px, -9px)">close</i>
							</i>
							<span class="Notification-Menu-Notification-Title">` + (nots[i].title || "Title") + `</span>
							<p>` + (nots[i].desc || "Description") + `</p>
						</div>
					</div>
				`);
		}
		document.querySelector('.Notification-Menu-Content').innerHTML = html;
		mdc.autoInit(document.querySelector('.Notification-Menu-Content'));
	} catch (err) { }
}
function MarkNotificationAsRead(index) {
	try {
		var sel = event.srcElement.parentNode.parentNode;
		if (sel.classList.contains('Notification-Menu-Notification-Content')) sel = sel.parentNode;
		sel.classList.add('Notification-Menu-Notification--Close');

		setTimeout(function () {
			try {
				var mua = sel.nextElementSibling;
				if (sel) sel.remove();
				if (mua) mua.classList.add('Notification-Menu-Notification--Slideup');
				setTimeout(function () {
					if (mua) mua.classList.remove('Notification-Menu-Notification--Slideup');
					NotificationData.Notifications[index].read = true;
					firebase.app().firestore().collection("Notifications").doc(users.getCurrentUid()).set(NotificationData);
				}, 200);
			} catch (err) { }
		}, 200);
	} catch (err) { }
}

function ViewAllNotifications() {
	try {
		var html = '';
		var nots = NotificationData.Notifications;
		for (var i = nots.length - 1; i >= 0; i--) {
			html += `
				<div style="background: #efefef; height: 90px; width: 45%; margin-bottom: 10px; margin-right: 10px; position: relative;">
					<div>
						<img src="` + (nots[i].icon || "../assets/img/iconT.png") + `" style="height: 70px; margin-top: 10px; margin-left: 10px; border-radius: 50%;"/>
					</div>
					<div>
						<h3 style="margin: 0; position: absolute; left: 85px; top: 12px;">` + (nots[i].title || "Title") + `</h4>	
						<p style="margin: 0; position: absolute; left: 90px; top: 35px;">` + (nots[i].desc || "Description") + `</p>
					</div>
				</div>
				`;
		}
		ShiftingDialog.set("ViewAllNotifications", "View All Notifications", "Okay", null, html, true, true);
		ShiftingDialog.open();
	} catch (err) {  }
}
ShiftingDialog.addSubmitListener("ViewAllNotifications", function () { ShiftingDialog.close(); });
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Notification Alert  -------------------------------------------------\\
function displayInHouseNotification(title, desc, icon) {
	try {
		var id = ("Notification-Alert--" + guid());
		document.querySelector("#Notification-Alert-Wrapper").innerHTML += `
			<div class="Notification-Alert" id="` + id + `">
				<img style="display: none;" src="../assets/img/freeload.png" onload="InHouseNotificationAutoCloseHandler('` + id + `')">
				<div class="Notification-Alert-Image-Container">
					<img src="` + icon + `" style="background-image: url('../assets/icons/iconT.png')" alt="" class="Notification-Alert-Image">
				</div>
				<div class="Notification-Alert-Content">
					<i onclick="InHouseNotificationCloseHandler('` + id + `')" class="Notification-Alert-Close mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle" role="button">
						<i class="material-icons" style="transform: translate(-9px, -9px)">close</i>
					</i>
					<span class="Notification-Alert-Title">` + title + `</span>
					<p>` + desc + `</p>
				</div>
			</div>
		`;
		mdc.autoInit(document.querySelector("#Notification-Alert-Wrapper"));
	} catch (err) { }
}

function InHouseNotificationAutoCloseHandler(id) {
	try {
		setTimeout(function () {
			document.querySelector("#" + id).classList.add('Notification-Alert--Open')
		}, 50);
		setTimeout(function () {
			try {
				if (document.querySelector("#" + id)) {
					document.querySelector("#" + id).classList.add('Notification-Alert--Closing');
					setTimeout(function () {
						try {
							if (document.querySelector("#" + id)) {
								var mua = document.querySelector("#" + id).nextElementSibling;
								if (mua) mua.classList.add('Notification-Alert--Moveup');
								document.querySelector("#" + id).remove();
								setTimeout(function () {
									if (mua) mua.classList.remove('Notification-Alert--Moveup');
								}, 600);
							}
						} catch (err) { return; }
					}, 400);
				}
			} catch (err) { return; }
		}, 3000);
	} catch (err) { return; }
}
function InHouseNotificationCloseHandler(id) {
	try {
		document.querySelector("#" + id).classList.add('Notification-Alert--Closing');
		setTimeout(function () {
			try {
				if (document.querySelector("#" + id)) {
					var mua = document.querySelector("#" + id).nextElementSibling;
					if (mua) mua.classList.add('Notification-Alert--Moveup');
					document.querySelector("#" + id).remove();
					setTimeout(function () {
						if (mua) mua.classList.remove('Notification-Alert--Moveup');
					}, 600);
				}
			} catch (err) { return; }
		}, 400)
	} catch (err) { return; }
}
//  ----------------------------------------    -------------------------------------------------\\