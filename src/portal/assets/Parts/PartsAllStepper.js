// PartsAllStepper.js

var currentPartsStepper = [];
function fillPartsStepper(partsView, snapshotDocs) {
	partsView = partsView.split('\\');
	var stepperChange = findStepperChange(currentPartsStepper, partsView);

	//(Cheap solution) draw in old data and play closing transition if applicable
	if (stepperChange.nun == -1) {
		var html = `<div class="stepperD mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple"><i class="noselect stepperH material-icons">home</i></div>`;
		for (var i = 0; i < currentPartsStepper.length; i++) {
			if (currentPartsStepper[i] != "") {
				html += '<i class="noselect stepperI material-icons' + ((i >= stepperChange.i) ? ' stepperPITransition--reverse' : '') + '">arrow_forward_ios</i>';
				html += `<div class="stepperD` + ((i >= stepperChange.i) ? ' stepperPITransition--reverse' : '') + ` mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple"><p class="stepperP">` + findObjectByKey(snapshotDocs, "id", currentPartsStepper[i]).data().title + `</p></div>`;
			}
		}
		document.querySelector('#partsStepperWrapper').innerHTML = html;
	}

	setTimeout(function () {
		//Draw in new and play transition if applicable
		var html = `<div class="stepperD mdc-ripple-surface mdc-ripple-upgraded" onclick="deleteHashParam('partsView');" data-mdc-auto-init="MDCRipple"><i class="noselect stepperH material-icons">home</i></div>`;
		for (var i = 0; i < partsView.length; i++) {
			if (partsView[i] != "") {
				html += '<i class="noselect stepperI material-icons' + ((stepperChange.nun == 1 && i >= stepperChange.i) ? ' stepperPITransition' : '') + '">arrow_forward_ios</i>';
				html += `<div class="stepperD` + ((stepperChange.nun == 1 && i >= stepperChange.i) ? ' stepperPITransition' : '') + ` mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="setHashParam('partsView', '` + drawRelativeDirectory(partsView, i).split('\\').join('\\\\') + `');"><p class="stepperP">` + findObjectByKey(snapshotDocs, "id", partsView[i]).data().title + `</p></div>`;
			}
		}
		currentPartsStepper = partsView;
		document.querySelector('#partsStepperWrapper').innerHTML = html;
		window.mdc.autoInit(document.querySelector('#partsStepperWrapper'));
	}, (stepperChange.nun == -1 ? 150 : 0));
}