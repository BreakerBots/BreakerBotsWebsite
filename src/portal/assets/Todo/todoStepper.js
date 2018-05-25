// TodoStepper.js

var currentTodoStepper = [];
function fillTodoStepper(todoView, snapshotDocs) {
	todoView = todoView.split('/');
	var stepperChange = findStepperChange(currentTodoStepper, todoView); 

	//(Cheap solution) draw in old data and play closing transition if applicable
	if (stepperChange.nun == -1) {
		var html = `<div class="stepperD mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple"><i class="stepperH material-icons">home</i></div>`;
		for (var i = 0; i < currentTodoStepper.length; i++) {
			if (currentTodoStepper[i] != "") {
				html += '<i class="stepperI material-icons' + ((i >= stepperChange.i) ? ' stepperPITransition--reverse' : '') + '">arrow_forward_ios</i>';
				html += `<div class="stepperD` + ((i >= stepperChange.i) ? ' stepperPITransition--reverse' : '') + ` mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple"><p class="stepperP">` + findObjectByKey(snapshotDocs, "id", currentTodoStepper[i]).data().title + `</p></div>`;
			}
		}
		document.querySelector('#todoStepperWrapper').innerHTML = html;
	}

	setTimeout(function () {
		//Draw in new and play transition if applicable
		var html = `<div class="stepperD mdc-ripple-surface mdc-ripple-upgraded" onclick="setHashParam('todoView', '');" data-mdc-auto-init="MDCRipple"><i class="stepperH material-icons">home</i></div>`;
		for (var i = 0; i < todoView.length; i++) {
			if (todoView[i] != "") {
				html += '<i class="stepperI material-icons' + ((stepperChange.nun == 1 && i >= stepperChange.i) ? ' stepperPITransition' : '') + '">arrow_forward_ios</i>';
				html += `<div class="stepperD` + ((stepperChange.nun == 1 && i >= stepperChange.i) ? ' stepperPITransition' : '') + ` mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="setHashParam('todoView', '` + drawRelativeDirectory(todoView, i) + `');"><p class="stepperP">` + findObjectByKey(snapshotDocs, "id", todoView[i]).data().title + `</p></div>`;
			}
		}
		currentTodoStepper = todoView;
		document.querySelector('#todoStepperWrapper').innerHTML = html;
		window.mdc.autoInit(document.querySelector('#todoStepperWrapper'));
	}, (stepperChange.nun == -1 ? 150 : 0));
}

function drawRelativeDirectory(array, arrPos) {
	var str = '';
	for (var i = 0; i <= arrPos; i++) {
		if (array[i] != "")
			str += ((i == 0 ? "" : "/") + array[i]);
	}
	return str;
}

function findStepperChange(a1, a2) {
	//Nested more or stayed the same
	if (a1.length <= a2.length) {
		for (var i = 0; i < a2.length; i++) {
			if (a1[i] != a2[i]) return { i: i, nun: 1 };
		}
	}
	//Un Nested
	else {
		for (var i = 0; i < a1.length; i++) {
			if (a1[i] != a2[i]) return { i: i, nun: -1 };
		}
	}
	return { i: -1, nun: 0 };
}