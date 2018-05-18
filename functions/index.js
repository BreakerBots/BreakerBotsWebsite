const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.firestore
	.document('Notifications/{userId}').onWrite((change, context) => {
		var NotificationArray = change.after.data().Notifications;
		var NewestNotification = NotificationArray[NotificationArray.length-1];

		const payload = {
			notification: {
				title: "Breakersite",
				body: NewestNotification.desc,
				icon: NewestNotification.icon
			}
		};

		var userId = context.params.userId;

		function sendPayloadToDevice(device, newData) {
			console.log(" > 0 Sending Payload To Device");
			admin.messaging().sendToDevice(device, payload)
				.then(function (response) {
					console.log(response["results"]["0"]["error"]["errorInfo"]["code"]);

					if (response["results"]["0"]["error"]["errorInfo"]["code"] == "messaging/invalid-registration-token" || response["results"]["0"]["error"]["errorInfo"]["code"] == "messaging/registration-token-not-registered") {
						console.log(" (!) Bad Device => ", device);
						console.log(" - Before Splice: ", newData);
						if (newData.devices.indexOf(device) !== -1) { newData.devices.splice(newData.devices.indexOf(device), 1); }
						console.log(" => After Splice: ", newData);
						admin.firestore().collection("users").doc(userId).set(newData);
					}
				})
				.catch(function (error) {
					console.log("Error sending message:", error);
				});
		}

		admin.firestore().collection("users").doc(userId).get().then(function (doc) {
			var newData = doc.data();
			console.log(" > 2 Sending Payload To Device");
			for (var t = 0; t < Object.keys(doc.data().devices).length; t++) {
				console.log(" > 1 Sending Payload To Device");
				sendPayloadToDevice(doc.data().devices[t], newData);
			}
		}).catch(function (err) { console.log("failed to get user data: ", err); });
	});