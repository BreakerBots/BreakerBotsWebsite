// Manuals.js

new RegisteredTab("Manuals", Manuals.firstInit, Manuals.everyInit, Manuals.exitInit, true);

var ManualsTab = new class ManualsTab {
	constructor() {
		var t = this;
		t.fab = new FabHandler(document.querySelector('#Manual-Add-Fab'));
		t.snapshot;
	}

	firstInit() {
		var t = this;
		firebase.app().firestore().collection("Manuals").onSnapshot(function (snap) {
			t.snapshot = snap;


		});
	} 

	everyInit() {
		var t = this;
		t.fab.tabSwitch();

		console.log(fab);

		showMainLoader(false);
	}

	exitInit() {
		var t = this;
		fab.tabExit();
	}
}