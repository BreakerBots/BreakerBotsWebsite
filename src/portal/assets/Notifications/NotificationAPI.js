// NotificationAPI.js

var notifications = new class Notifications {
	send(uid, title, message, icon) {
		sendSWNToUser(uid, title, message, (icon || "../assets/img/iconT.png"));
	}
}