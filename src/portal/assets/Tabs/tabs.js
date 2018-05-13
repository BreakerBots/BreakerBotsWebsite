function updateTabs(tab) {
	showMainLoader(true);

	//Switch To Tab To Select Tab From Url
	if (tab == undefined) { tab = getTabFromURL('tab'); if (tab == null) { tab = 'General'; } }

	var lastTab = document.querySelector('.tab.active');
	if (lastTab) {
		lastTab.classList.remove('active');
		lastTab.classList.add('exit');
		lastTab.addEventListener("animationend", function () { event.srcElement.classList.remove('exit'); });
	}

	document.getElementById(tab).classList.add('active');

	switch (tab) {
		case "PartsAll": if (startPMS) startPMS(); else setTimeout(hideML, 500); break;
		case "PartsArchived": if (startPMSArchived) startPMSArchived(); else setTimeout(hideML, 500); break;
		case "PartsOrdered": if (startPMSOrdered) startPMSOrdered(); else setTimeout(hideML, 500); break;
		case "Profile": if (startProfile) startProfile(); else setTimeout(hideML, 500); break;
		case "Teams": if (startTeams) startTeams(); else setTimeout(hideML, 500); break;
		default: setTimeout(hideML, 500); break;
	}
}
document.addEventListener('DOMContentLoaded', function () { updateTabs(); });
$(window).on('hashchange', function () { updateTabs(); });

function showMainLoader(state) {
	document.querySelector("#MainLoader").style.opacity = (state ? 1 : 0);
} function hideML() { showMainLoader(false); }

function getTabFromURL() {
	return window.location.hash == "" ? null : window.location.hash.substring(5);
}

function getUrlParameterByName(name, url) {
	if (!url) url = window.location.href; name = name.replace(/[\[\]]/g, "\\$&"); var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url); if (!results) return null; if (!results[2]) return ''; return decodeURIComponent(results[2].replace(/\+/g, " "));
}
