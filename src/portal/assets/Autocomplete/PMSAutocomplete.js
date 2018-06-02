/*
var CreatePartNameAutofill = ["TalonSRX", "TalonSR", "DoubleSolenoid"];
var CreatePartNameAutofillData = {};
var CreatePartNameInput = document.getElementById("CreatePartInput");
var CreatePartNameInputPrice = document.getElementById("CreatePartInputP");
var CreatePartNameInputUrl = document.getElementById("CreatePartInputUrl");

//Listener for autofill
document.addEventListener('DOMContentLoaded', function () {
	firebase.app().firestore().collection("PMS-Extra").doc("Autocomplete")
		.onSnapshot(function (doc) {
			CreatePartNameAutofill = Object.keys(doc.data());
			CreatePartNameAutofillData = doc.data();
		});
});

function addPartToAutocomplete(name, price, url) {
	if (url != "" && url != "http://" && price > 0 && name != "") {
		var json1 = {};
		json1[name] = { url: url, price: price };
		firebase.app().firestore().collection("PMS-Extra").doc("Autocomplete").set(json1, { merge: true });
	}
}

var currentFocus;
CreatePartNameInput.addEventListener("input", function (e) { 
	var a, b, i, val = this.value;
	closePAllLists();
	if (!val) { return false; }
	currentFocus = -1;
	a = document.createElement("DIV");
	a.setAttribute("id", this.id + "autocomplete-list");
	a.setAttribute("class", "autocomplete-items");
	this.parentNode.appendChild(a);
	for (i = 0; i < CreatePartNameAutofill.length; i++) {
		if (CreatePartNameAutofill[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
b = document.createElement("DIV");
b.innerHTML = "<strong>" + CreatePartNameAutofill[i].substr(0, val.length) + "</strong>";
			b.innerHTML += CreatePartNameAutofill[i].substr(val.length);
			b.innerHTML += "<input type='hidden' value='" + CreatePartNameAutofill[i] + "'>";
			b.addEventListener("click", function (e) {
				CreatePartNameInput.value = this.getElementsByTagName("input")[0].value;
				CreatePartNameInputPrice.value = CreatePartNameAutofillData[this.getElementsByTagName("input")[0].value].price;
				CreatePartNameInputUrl.value = CreatePartNameAutofillData[this.getElementsByTagName("input")[0].value].url;
closePAllLists();
			});
			a.appendChild(b);
		}
	}
});
CreatePartNameInput.addEventListener("keydown", function (e) {
	var x = document.getElementById(this.id + "autocomplete-list");
	if (x) x = x.getElementsByTagName("div");
	if (e.keyCode == 40) {
	currentFocus++;
addPActive(x);
	} else if (e.keyCode == 38) {
	currentFocus--;
addPActive(x);
	} else if (e.keyCode == 13) {
	e.preventDefault();
if (currentFocus > -1) {
			if (x) x[currentFocus].click();
		}
	}
});
function addPActive(x) {
	if (!x) return false;
	for (var i = 0; i < x.length; i++) {
		x[i].classList.remove("autocomplete-active");
	}
	if (currentFocus >= x.length) currentFocus = 0;
	if (currentFocus < 0) currentFocus = (x.length - 1);
	x[currentFocus].classList.add("autocomplete-active");
}
function closePAllLists(elmnt) {
	var x = document.getElementsByClassName("autocomplete-items");
	for (var i = 0; i < x.length; i++) {
		if (elmnt != x[i] && elmnt != CreatePartNameInput) {
	x[i].parentNode.removeChild(x[i]);
}
	}
}
document.addEventListener("click", function (e) {closePAllLists(e.target); });
*/
