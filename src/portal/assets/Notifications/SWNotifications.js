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


	messaging.onMessage(function (payload) {
		console.log("onMessage => ", payload);
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
					console.log("Token => ");
					console.log(token);
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

function removeDevicesToAccount(tokens, uid) {
	firebase.firestore().collection("users").doc(uid).get().then(function (doc) {
		var newDeviceList = doc.data().devices;
		for (var t = 0; t < tokens.length; t++) {
			newDeviceList.remove(tokens[t]);
		}
		firebase.firestore().collection("users").doc(uid).set({ devices: newDeviceList }, { merge: true });
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

function sendSWNToUser(uid) {
	var badDevices = [];
	var deRe = 0;
	for (var d = 0; d < Object.keys(users.getCurrentUser().devices).length; d++) {
		SWNOT(users.getCurrentUser().devices[d], function (good, device) {
			++deRe;
			if (!good) badDevices.push(device);
			if (deRe == Object.keys(users.getCurrentUser().devices).length - 1) {
				removeDevicesToAccount(badDevices, uid);
			}
		});
	}
}

function SWNOT(device, callback) {
	var request = new XMLHttpRequest();
	request.open('POST', "https://fcm.googleapis.com/fcm/send", true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Authorization', "key=AAAAomzg7cg:APA91bFg19CrzrQJxHoFCTNGmF4_-t3mKy_iYtZWcjrgKPSBjzilPkPUweXTLxzVnuAA7-QN5mevqYDan-pnHlcBLt3dXw_16Nv_aRdr36TVLVC4r9bmuFVDhITjXxDmwE9zdWowAb0X");

	var notificationTemplate = 
		{
			notification: {
				title: "Portugal vs. Denmark",
				body: "5 to 1",
				click_action: "http://localhost:5000"
			},
			to: device
		};

	request.send(JSON.stringify(notificationTemplate));

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			var response = JSON.parse(request.responseText);

			if (response["results"]["0"]["error"] == "InvalidRegistration" || response["results"]["0"]["error"] == "NotRegistered") {
				callback(false, device); return;
			} else {
				callback(true, device); return;
			}
		}
	};
}