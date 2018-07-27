// Helper Introduction -- Account.js

var HelperIntoductionData;
document.addEventListener("DOMContentLoaded", function () {
	// Wait until firebase auth has loaded
	function a() {
		if (firebase.auth().currentUser)
			main();
		else
			setTimeout(a, 1000);
	} a();
	function main() {
		// Get Updates On Users Tutorial Document
		firebase.app().firestore().collection('Helper').doc(firebase.auth().currentUser.uid).onSnapshot(function (doc) {
			// Create Tutorial File If Not Created
			if (!doc.exists) {
				/* Tutorial Files are Saved With A List Of Sections (Todo, Manuals...)
				 * Each Section Looks like so:
						SECTION: ARRAY
				 * Each Int in the array represents the progress through a subsection
				 * A Subsection would be something like "adding a folder in todo"
				*/
				firebase.app().firestore().collection('Helper').doc(firebase.auth().currentUser.uid).set({
					General: [0],
					Todo:    [0, 0, 0, 0, 0, 0, 0, 0],
					Item:    [0, 0, 0, 0, 0, 0, 0, 0],
					Manuals: [0, 0, 0, 0, 0],
					Teams:   [0, 0, 0, 0],
					Profile: [0, 0, 0, 0]
				});
			}
			//Save Data
			else {
				HelperIntoductionData = doc.data();
			}
		});
	}
});

var Helper = new class HelperIntroduction {
	get data() {
		return HelperIntoductionData;
	}

	/**
	 * Gets the array of subsections of a section :)
	 * @param {any} name The Name of the Section (like "Manuals")
	 */
	getSection(name) {
		try {
			if (HelperIntoductionData) {
				return HelperIntoductionData[name];
			}
			else throw "Hasent Loaded Helper Data";
		} catch (err) { console.error(err); return; }
	}

	/**
	 * Gets The Progress of a subsection (like "adding a folder in todo")
	 * @param {String} sec The Name of the section (like "Todo")
	 * @param {Int} subsec The Index of the Subsection in the section
	 */
	getProgress(sec, subsec) {
		try {
			if (HelperIntoductionData) {
				return HelperIntoductionData[sec][subsec];
			}
			else throw "Hasent Loaded Helper Data";
		} catch (err) { console.error(err); return 0; }
	}

	setSection(name, data) {
		try {
			if (HelperIntoductionData) {
				HelperIntoductionData[name] = data;
				firebase.app().firestore().collection('Helper').doc(firebase.auth().currentUser.uid).set(HelperIntoductionData);
			}
			else throw "Hasent Loaded Helper Data";
		} catch (err) { console.error(err); return; }
	}

	setProgress(sec, subsec, data) {
		try {
			if (HelperIntoductionData) {
				HelperIntoductionData[sec][subsec] = data;
				firebase.app().firestore().collection('Helper').doc(firebase.auth().currentUser.uid).set(HelperIntoductionData);
			}
			else throw "Hasent Loaded Helper Data";
		} catch (err) { console.error(err); return 0; }
	}
}