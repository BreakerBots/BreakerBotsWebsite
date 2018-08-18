// ManualsStepper.js

var CurrentManualsStepper = [];
function ManualsFillStepper(view, docs) {
	try {
		view = view.split('\\');
		var stepperChange = findStepperChange(CurrentManualsStepper, view);

		//(Cheap solution) draw in old data and play closing transition if applicable
		if (stepperChange.nun == -1) {
			try {
				var html = `<div class="stepperD mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple"><i class="noselect stepperH material-icons">home</i></div>`;
				for (var i = 0; i < CurrentManualsStepper.length; i++) {
					if (CurrentManualsStepper[i] != "") {
						html += '<i class="noselect stepperI material-icons' + ((i >= stepperChange.i) ? ' stepperPITransition--reverse' : '') + '">arrow_forward_ios</i>';
						html += `<div class="stepperD` + ((i >= stepperChange.i) ? ' stepperPITransition--reverse' : '') + ` mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple"><p class="stepperP">` + findObjectByKey(docs, "id", currentTodoStepper[i]).data().title + `</p></div>`;
					}
				}
				document.querySelector('#ManualStepperWrapper').innerHTML = html;
			} catch (err) { }
		}

		setTimeout(function () {
			//Draw in new and play transition if applicable
			var html = `<div class="stepperD mdc-ripple-surface mdc-ripple-upgraded" onclick="deleteHashParam('manualsView');" data-mdc-auto-init="MDCRipple"><i class="noselect stepperH material-icons">home</i></div>`;
			for (var i = 0; i < view.length; i++) {
				if (view[i] != "") {
					html += '<i class="noselect stepperI material-icons' + ((stepperChange.nun == 1 && i >= stepperChange.i) ? ' stepperPITransition' : '') + '">arrow_forward_ios</i>';
					html += `<div class="stepperD` + ((stepperChange.nun == 1 && i >= stepperChange.i) ? ' stepperPITransition' : '') + ` mdc-ripple-surface mdc-ripple-upgraded" data-mdc-auto-init="MDCRipple" onclick="setHashParam('manualsView', '` + drawRelativeDirectory(view, i).split('\\').join('\\\\') + `');"><p class="stepperP">` + findObjectByKey(docs, "id", view[i]).data().title + `</p></div>`;
				}
			}
			CurrentManualsStepper = view;
			document.querySelector('#ManualStepperWrapper').innerHTML = html;
			window.mdc.autoInit(document.querySelector('#ManualStepperWrapper'));
		}, (stepperChange.nun == -1 ? 150 : 0));
	} catch (err) { console.error(err) }
}