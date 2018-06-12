const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.firestore
	.document('Notifications/{userId}').onWrite((change, context) => {
		var NotificationArray = change.after.data().Notifications;
		//Only do this if an addition
		if (NotificationArray.length <= change.before.data().Notifications.length) {
			return;
		}
		var NewestNotification = NotificationArray[NotificationArray.length-1];

		const payload = {
			notification: {
				title: NewestNotification.title || "Breakersite",
				body: NewestNotification.desc || "",
				icon: NewestNotification.icon || "../assets/img/iconT.png"
			}
		};

		var userId = context.params.userId;

		function sendPayloadToDevice(device, newData) {
			try {
				//console.log(" > Sending Payload To Device  [--- ]");
				admin.messaging().sendToDevice(device, payload)
					.then(function (response) {
						try {
							//console.log(response["results"]["0"]["error"]["errorInfo"]["code"]);

							if (response["results"]["0"]["error"]["errorInfo"]["code"] == "messaging/invalid-registration-token" || response["results"]["0"]["error"]["errorInfo"]["code"] == "messaging/registration-token-not-registered") {
								//console.log(" (!) Bad Device => ", device);
								//console.log(" - Before Splice: ", newData);
								if (newData.devices.indexOf(device) !== -1) { newData.devices.splice(newData.devices.indexOf(device), 1); }
								//console.log(" => After Splice: ", newData);
								admin.firestore().collection("users").doc(userId).set(newData);
							}
						} catch (err) { console.log("Caught ", err); }
						//console.log(" > Sending Payload To Device  [----]");
						//console.log(" > Payload Sent!");
					})
					.catch(function (error) {
						//console.log("Error sending message:", error);
					});
			} catch (err) { console.log("Caught ", err); }
		}

		admin.firestore().collection("users").doc(userId).get().then(function (doc) {
			try {
				var newData = doc.data();
				//console.log(" > Sending Payload To Device [-   ]");
				for (var t = 0; t < Object.keys(doc.data().devices).length; t++) {
					//console.log(" > Sending Payload To Device  [--  ]");
					sendPayloadToDevice(doc.data().devices[t], newData);
				}
			} catch (err) { console.log("Caught ", err); }
		}).catch(function (err) { console.log("Caught ", err); });
	});