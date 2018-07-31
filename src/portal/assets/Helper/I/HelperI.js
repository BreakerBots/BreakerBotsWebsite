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
				if (!HelperIntroductionAPILoaded) {
					HelperIntroductionAPILoaded = true;
					HelperIntroductionWaiters.forEach(function (c) {
						c();
					});
				}
			}
		});
	}
});
HelperIntroductionAPILoaded = false;
HelperIntroductionWaiters = [];

var Helper = {
	API: new class HelperIntroductionAPI {
		get data() {
			return HelperIntoductionData;
		}

		wait(callback) {
			if (HelperIntroductionAPILoaded)
				callback();
			else
				HelperIntroductionWaiters.push(callback);
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
	},
	drawing: new class HelperIntroductionDrawing {
		/**
		 * Display the Helper Introduction
		 * @param {String} text The text to display
		 * @param {String[]} anchorPoint Array of x, y. Ex) ['50px', '10px'] or ['50vw', '50vh'], you can also just use a querySelector like "#a-element-id" or the element after querySelector
		 * @param {Number[]} rAnchorPoint Array of x, y in percent (0 - 1). Ex) [0.5, 0.5] -> Center on anchor point
		 * @param {function} onNext A callback after the next arrow is pressed, leave undefined to close on next.
		 */
		display(text, anchorPoint, rAnchorPoint, onNext) {
			try {
				document.querySelector("#HelperI").setAttribute("data-active", "");
				document.querySelector("#HelperI-Content").innerHTML = text;
				document.querySelector("#HelperI-Next").onclick = (onNext || function () { Helper.drawing.close(); });

				if (typeof anchorPoint == "string") {
					anchorPoint = document.querySelector(anchorPoint);
				}

				if (anchorPoint.getBoundingClientRect) {
					anchorPoint = anchorPoint.getBoundingClientRect();
					anchorPoint = [anchorPoint.left + 'px', anchorPoint.top + 'px'];
				}

				if (Array.isArray(anchorPoint)) {
					setTimeout(function () {
						var p = document.querySelector("#HelperI-EleW");
						var pbw = 0;
						var pbh = 0;
						if (rAnchorPoint[0] != 0)
							pbw -= p.scrollWidth / ((1 - rAnchorPoint[0]) * 2 + 1);
						if (rAnchorPoint[1] != 0)
							pbh -= p.scrollHeight / ((1 - rAnchorPoint[1]) * 2 + 1);
						p.style.left = 'calc(' + anchorPoint[0] + ' + ' + pbw + 'px)';
						p.style.top = 'calc(' + anchorPoint[1] + ' + ' + pbh + 'px)';
					}, 10);
				}
				else
					throw "Invalid Anchor Point!"

				return true;
			} catch (err) { console.error(err); return false; }
		}
		close() {
			try {
				document.querySelector("#HelperI").removeAttribute("data-active");
				return true;
			} catch (err) { console.error(err); return false; }
		}
	}
};