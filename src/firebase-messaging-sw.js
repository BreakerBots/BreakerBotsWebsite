importScripts('/__/firebase/4.12.1/firebase-app.js');
importScripts('/__/firebase/4.12.1/firebase-messaging.js');

var config = {
	apiKey: "AIzaSyCA8Z_Xvhp8FkjK7KedPtVo6XO0Y7FtEtw",
	authDomain: "breakers-orderbot.firebaseapp.com",
	databaseURL: "https://breakers-orderbot.firebaseio.com",
	projectId: "breakers-orderbot",
	storageBucket: "breakers-orderbot.appspot.com",
	messagingSenderId: "697611382216"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);
	// Customize notification here
	var notificationTitle = 'Background Message Title';
	var notificationOptions = {
		body: 'Background Message body.',
		icon: '/firebase-logo.png'
	};

	return self.registration.showNotification(notificationTitle,
		notificationOptions);
});



/* Generic Test Message (Run On Gitbash Anywhere)


curl -X POST -H "Authorization: key=AAAAomzg7cg:APA91bFg19CrzrQJxHoFCTNGmF4_-t3mKy_iYtZWcjrgKPSBjzilPkPUweXTLxzVnuAA7-QN5mevqYDan-pnHlcBLt3dXw_16Nv_aRdr36TVLVC4r9bmuFVDhITjXxDmwE9zdWowAb0X" -H "Content-Type: application/json" -d '{
  "notification": {
    "title": "Portugal vs. Denmark",
    "body": "5 to 1",
    "icon": "firebase-logo.png",
    "click_action": "http://localhost:5000"
  },
  "to": "eSm7kkW4WWU:APA91bERGcamz_uxFfBxjAp-60-4QD8RtYlDatXpPVCfin6EmtmoWHvJzlEkfxQINOGhupy5w2Iu15vLmuPjFXC29wD0wWvYjnDhOl3fsuAsV3W24W3di_IWIUKGSlfTbJ4woXGhSqtA"
}' "https://fcm.googleapis.com/fcm/send"


curl -X POST -H "Authorization: key=AAAAomzg7cg:APA91bFg19CrzrQJxHoFCTNGmF4_-t3mKy_iYtZWcjrgKPSBjzilPkPUweXTLxzVnuAA7-QN5mevqYDan-pnHlcBLt3dXw_16Nv_aRdr36TVLVC4r9bmuFVDhITjXxDmwE9zdWowAb0X" -H "Content-Type: application/json" -d '{ "to": "eSm7kkW4WWU:APA91bERGcamz_uxFfBxjAp-60-4QD8RtYlDatXpPVCfin6EmtmoWHvJzlEkfxQINOGhupy5w2Iu15vLmuPjFXC29wD0wWvYjnDhOl3fsuAsV3W24W3di_IWIUKGSlfTbJ4woXGhSqtA"}' "https://fcm.googleapis.com/fcm/send"

*/