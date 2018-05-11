function updateTabs(tab) {
	//Switch To Tab To Select Tab From Url
	if (tab == undefined) { tab = getTabFromURL('tab'); if (tab == null) { tab = 'General'; } }

	if (document.querySelector('.tab.active')) {
		document.querySelector('.tab.active').classList.remove('active');
	}

	document.getElementById(tab).classList.add('active');

	switch (tab) {
		case "PartsAll": if (startPMS) startPMS(); break;
		case "PartsArchived": if (startPMSArchived) startPMSArchived(); break;
		case "PartsOrdered": if (startPMSOrdered) startPMSOrdered(); break;
		case "Profile": if (startProfile) startProfile(); break;
		case "Teams": if (startTeams) startTeams(); break;
	}
}
document.addEventListener('DOMContentLoaded', function () { updateTabs(); });
$(window).on('hashchange', function () { updateTabs(); });


function getTabFromURL() {
	return window.location.hash == "" ? null : window.location.hash.substring(5);
}

function getUrlParameterByName(name, url) {
	if (!url) url = window.location.href; name = name.replace(/[\[\]]/g, "\\$&"); var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url); if (!results) return null; if (!results[2]) return ''; return decodeURIComponent(results[2].replace(/\+/g, " "));
}
