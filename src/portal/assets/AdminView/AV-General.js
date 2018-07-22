// Admin View General


function AVSC() {
	document.addEventListener('DOMContentLoaded', function () {
		a();
		function a() {
			if (firebase.auth().currentUser)
				firebase.app().firestore().collection("Clearance").doc(firebase.auth().currentUser.uid).onSnapshot(function (doc) {
					AVCC = doc.data();
					AdminViewCheck();
				});
			else
				setTimeout(a, 500);
		}
	});
	addHashVariableListener('tab', AdminViewCheck);
	setInterval(AdminViewCheck, 5000);
	var AVCC;
	function AdminViewCheck() {
		if (AVCC) {
			try {
				if (Number(AVCC.a) >= 2) {
					var AVE = document.querySelector('#AdminViewEnter');
					if (AVE.innerHTML.indexOf('<i') < 0) {
						AVE.innerHTML = `<i onclick="toggleMenu('#AdminConsoleMenu', true)" style="color: white" class="noselect material-icons mdc-icon-toggle" data-mdc-auto-init="MDCIconToggle" aria-label="Admin Console">group</i>`;
						window.mdc.autoInit(AVE);
					}
					//If In Admin View
					if ((getHashParam('tab') || "").indexOf("AV") != -1) {
						
					}
					//Close If In Another Tab
					else if ((ShiftingDialog.currentId || "").indexOf("AdminView") != -1) {
						//console.log('c ot');
						ShiftingDialog.close();
					}
				}
				else {
					document.querySelector("#AdminViewScripts").innerHTML = '';
					if (getHashParam('tab').indexOf("AV") != -1) {
						setHashParam('tab', 'General');
					}
					else
						document.querySelector('#AdminViewEnter').innerHTML = ``;
				}
				return true;
			}
			catch (err) {
				console.log("cauyge", err);
				if (getHashParam('tab').indexOf("AV") != -1) {
					setHashParam('tab', 'General');
				}
				else
					document.querySelector('#AdminViewEnter').innerHTML = ``;
				return true;
			}
		}
		return false;
	}

	function TabEnterCheck() {
		function a() {
			if (firebase.auth().currentUser) {
				if (new Date().getTime() - new Date(Date.parse(firebase.auth().currentUser.metadata.lastSignInTime)).getTime() > (40 * 60 * 1000)) {
					if (getHashParam('tab').indexOf("AV") != -1)
						DisplaySignin();
				}
			}
			else
				setTimeout(a, 1000);
		} a();
	}
	AVSC.TabEnterCheck = TabEnterCheck;

	setInterval(function () {
		if (firebase.auth().currentUser && (getHashParam('tab').indexOf("AV") != -1)) {
			if (new Date().getTime() - new Date(Date.parse(firebase.auth().currentUser.metadata.lastSignInTime)).getTime() > (40 * 60 * 1000)) {
				DisplaySignin();
			}
		}
	}, 1000);

	function DisplaySignin() {
		if (((ShiftingDialog.currentId || "").indexOf("AdminView") == -1) || !ShiftingDialog.isOpen()) {
			ShiftingDialog.set({
				id: "AdminViewSignin",
				contents: `
											<div class="card card-border-color card-border-color-primary mdc-elevation--z10" style="min-height: 300px; height: calc(15vw + 10px); transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1); width: 25vw; min-width: 300px;">
												<div class="card-header" style="margin-bottom: 0;">
													<img src="../assets/img/logosheet.png" alt="logo" style="width: 35%; margin-left: 32.5%;" class="logo-img">
													<span class="splash-description">Please Confirm Your Password.</span>
												</div>
												<div class="card-body">
													<form>
														<div class="form-group">
															<div class="SHP">
																<input id="AVRAPass" style="border: none; display: inline; width: 80%;" type="password" required placeholder="Password" autocomplete="off" class="form-control">
																<div style="position: absolute; right: 0; float: right; top: 10px; transform: scale(1); transition: all 0.15s cubic-bezier(.2, 0, .2, 1);">
																	<i style="display: inline; font-size: 27px;" class="material-icons mdc-icon-toggle" role="button" data-mdc-auto-init="MDCIconToggle" onclick="SHP(this.parentNode.parentNode.querySelector('input'));">visibility_off</i>
																</div>
															</div>
														</div>
														<div class="form-group login-submit">
															<button onclick="firebase.auth().currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential( firebase.auth().currentUser.email, document.querySelector('#AVRAPass').value )).then(function () {  ShiftingDialog.close(); }).catch(function (err) {  document.querySelector('#AVRAPass').setCustomValidity('Wrong Password'); document.querySelector('#AVRAPass').reportValidity(); });" type="submit" style="width: 90%; display: block; margin: auto;" data-mdc-auto-init="MDCRipple" class="mdc-button mdc-button--raised mdc-ripple-upgraded">Confirm</button>
														</div>
													</form>
												</div>
												<div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: -5; background-color: rgba(0,0,0,0.5); opacity: 0; transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);" id="mainLoader">
													<div style="transform: scale(2); position: absolute; left: 50%; top: 30%;">
														<svg width="50px" height="50px" class="material-loader">
															<circle cx="25" cy="25" r="20" class="material-loader__circle" />
														</svg>
													</div>
												</div>
											</div>
										`,
				dontCloseOnExternalClick: true,
				dontCloseOnEsc: true,
				forceFullscreen: true,
				hideFooter: true,
				hideHeader: true
			}); ShiftingDialog.open();
		}
	}
	AVSC.signin = DisplaySignin;
} AVSC();