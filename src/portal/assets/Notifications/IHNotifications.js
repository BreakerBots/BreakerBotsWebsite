//IHNotifications.js (In House Notifications)





//  ----------------------------------------  Notification Menu  -------------------------------------------------\\
document.addEventListener('DOMContentLoaded', function () {
	authLoadedWait(function () {
		firebase.app().firestore().collection("Notifications").doc(users.getCurrentUid())
			.onSnapshot(function (snapshot) {
				var data = snapshot.data().Notifications;
				//console.log("not ", data);
			});
	});
}); 

function drawInHouseNotifications() {
	
}
//  ----------------------------------------    -------------------------------------------------\\





//  ----------------------------------------  Notification Alert  -------------------------------------------------\\
function displayInHouseNotification(title, desc, icon) {
	var id = ("Notification-Alert--" + guid());
	document.querySelector("#Notification-Alert-Wrapper").innerHTML += `
		<div class="Notification-Alert" id="` + id + `">
			<img style="display: none;" src="../assets/img/freeload.png" onload="InHouseNotificationAutoCloseHandler('` + id + `')">
			<div class="Notification-Alert-Image-Container">
				<img src="` + icon + `" alt="" class="Notification-Alert-Image">
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