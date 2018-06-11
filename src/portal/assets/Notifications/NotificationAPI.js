// NotificationAPI.js

var notifications = new class Notifications {
	send(uid, message, icon) {
		sendSWNToUser(uid, message, icon);
	}
}