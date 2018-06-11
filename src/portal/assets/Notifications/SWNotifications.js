//SWNotifications.js (Service Worker Notifications)

document.addEventListener('DOMContentLoaded', function () {
	const messaging = firebase.messaging();
	messaging.usePublicVapidKey("BMjXS8HyVh-QKjVEKpT3Scsb0RqtBrubHJ_f9BoNyFb89VGRbneV_ri-mSDDKkdyS4Oia7I2lSRS0MaDd2mUJLE");
	getNotificationPermission();

	messaging.onTokenRefresh(function () {
		messaging.getToken().then(function (refreshedToken) {
			addDeviceToAccount(token, users.getCurrentUid());
		}).catch(function (err) {

			});
	});

	//If user in app show IH Notification
	messaging.onMessage(function (payload) {
		displayInHouseNotification(payload.notification.title, payload.notification.body, payload.notification.icon);
	});
});

var hasNotificationPermission = false;
function getNotificationPermission() {
	if (!hasNotificationPermission) {
		authLoadedWait(function () {
			var notiStatus;
			const messaging = firebase.messaging();
			messaging.requestPermission()
				.then(function () {
					notiStatus = 1;
					hasNotificationPermission = true;
					NotificatioPermissionGranted();
					return messaging.getToken();
				})
				.then(function (token) {
					addDeviceToAccount(token, users.getCurrentUid());
				})
				.catch(function (err) {
					notiStatus = -1;
					NotificationPermissionDenied();
				});
		});
	}
}

function addDeviceToAccount(token, uid) {
	var rtC = false;
	firebase.firestore().runTransaction(t => {
		return t.get(firebase.firestore().collection("users").doc(uid))
			.then(doc => {
				if (!rtC) {
					rtC = true;
					var newDeviceList = doc.data().devices;
					if (!newDeviceList.includes(token)) {
						//Register the new device
						newDeviceList.push(token);
						t.update(firebase.firestore().collection("users").doc(uid), { devices: newDeviceList });
						return Promise.resolve("Updated");
					} else { Promise.reject("Already Registered"); /*The Device Has Already Been Registered*/ }
				}
			})
	}).then(result => {
		//Success
	}).catch(err => {
		//Failed
	});
}

function NotificatioPermissionGranted() {
	var mainicon = document.querySelector('#MainNotificationIcon');
	mainicon.classList.remove('mdi-notifications-off'); mainicon.classList.add('mdi-notifications-active');

	var indicator = document.querySelector('#MainNotificationIndicator');
	indicator.hidden = false;
}

function NotificationPermissionDenied() {

}

function sendSWNToUser(uid, desc, icon) {
	var userRef = firebase.firestore().collection("Notifications").doc(uid);
	userRef.get()
		.then(function (doc) {
			var newData = doc.data();
			newData["Notifications"].push({ desc: desc, icon: icon });
			userRef.set(newData);
		})
		.catch(function (err) { });
}