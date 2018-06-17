//EnterTabs.js

function updateTabs(tab) {
	//Switch To Tab To Select Tab From Url
	if (tab == undefined) { tab = getTabFromURL('tab'); if (tab == null) { tab = 'RegisterComputer'; } }

	
	//Transition
	cardRippleTransition(
		function adjustHeights() {
			sendTabAdjustHeight(tab);
		},
		function closeOldTab() {
			var lastTab = document.querySelector('.tab.active');
			if (lastTab) {
				//Send Exit Callback to tab handlers
				sendTabExitCallback(lastTab.id);

				//Exit the last tab
				lastTab.classList.remove('active');
			}
		},
		function openNewTab() {
			//Send Open Callback to tab handlers
			sendTabOpenCallback(tab);

			//Open the new tab and play animation
			document.querySelector('#' + tab).classList.add('active');
		}
	);
}

function clearTabs() {

}

//Update the tab on refresh
document.addEventListener('DOMContentLoaded', function () { updateTabs(); });
//Update the tabs on "#" change in url
window.addEventListener('hashchange', function () { updateTabs(); });

function getTabFromURL() {
	return window.location.hash == "" ? null : window.location.hash.substring(1);
}