//CalendarTab.js

var CalendarTab = new RegisteredTab("Calendar", null, null, null, false);

//Handle Google Loading
var GAPILoaded = false;
function HandleGoogleAPILoad() {
	gapi.load('client:auth2', function () {

		//Init The Calendar
		gapi.client.init({
			apiKey: 'AIzaSyD5uAYDd-8hqhjCzAE7N9w_AI66kGht6Xk',
			clientId: '697611382216-6defdceifojmk727urluii2eub8vgddf.apps.googleusercontent.com',
			discoveryDocs: [
				"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
			],
			scope: "https://www.googleapis.com/auth/calendar.readonly"
		}).then(function () {
			GAPILoaded = true;
		});
	});
}

class BreakerCalendar {
	constructor(el) {
		try {
			if (el) {
				this.id = guid();
				this.wrapper = el;
				this.wrapper.innerHTML = `
					<div class="BreakerCalendar-Header mdc-elevation--z2">
						<div class="BreakerCalendar-Header--Group">
							<button class="BreakerCalendar-Header--Today mdc-button mdc-ripple-surface" data-mdc-auto-init="MDCRipple">TODAY</button>
							<i role="button" class="BreakerCalendar-Header--Left mdc-icon-toggle material-icons" data-mdc-auto-init="MDCIconToggle">chevron_left</i>
							<i role="button" class="BreakerCalendar-Header--Right mdc-icon-toggle material-icons" data-mdc-auto-init="MDCIconToggle">chevron_right</i>
							<div style="width: 130px; position: relative; margin-right: 15px; height: 31px;">
								<div class="BreakerCalendar-Header--Title noselect"></div>
								<div class="BreakerCalendar-Header--Title2 noselect"></div>
							</div>
						</div>
						<button onclick="menu.toggle(this.parentNode.querySelector('.BreakerCalendar-Header--ViewPicker').innerHTML, this, 'width: 115px;')" class="BreakerCalendar-Header--View mdc-button mdc-ripple-surface" data-mdc-auto-init="MDCRipple">
						<div>MONTH</div> <i class="material-icons BreakerCalendar-Header--ViewIcon">keyboard_arrow_down</i></button>
						<div class="BreakerCalendar-Header--ViewPicker" style="display: none">
							<ul class="mdc-list">
								<li onclick="BreakerCalendar.getInstance('` + this.id + `').changeView(this.innerHTML.toUpperCase()); menu.close();" class="mdc-list-item noselect BreakerCalendar-Header--ViewPickerOption" data-mdc-auto-init="MDCRipple">Month</li>
								<li onclick="BreakerCalendar.getInstance('` + this.id + `').changeView(this.innerHTML.toUpperCase()); menu.close();" class="mdc-list-item noselect BreakerCalendar-Header--ViewPickerOption" data-mdc-auto-init="MDCRipple">Schedule</li>
							</ul>
						</div>
					</div>
					<div class="BreakerCalendar-Viewbox">
						<div class="BreakerCalendarTab BreakerCalendarTab--Active BreakerCalendarTab--MONTH">
							
						</div>
						<div class="BreakerCalendarTab BreakerCalendarTab--SCHEDULE">
							
						</div>
					</div>
				`;
				window.mdc.autoInit(this.wrapper);

				this.elements = {
					viewbox:    this.wrapper.querySelector('.BreakerCalendar-Viewbox'),
					today:      this.wrapper.querySelector('.BreakerCalendar-Header--Today'),
					back:       this.wrapper.querySelector('.BreakerCalendar-Header--Left'),
					forward:    this.wrapper.querySelector('.BreakerCalendar-Header--Right'),
					title:      this.wrapper.querySelector('.BreakerCalendar-Header--Title'),
					title2:     this.wrapper.querySelector('.BreakerCalendar-Header--Title2'),
					headergrp:  this.wrapper.querySelector('.BreakerCalendar-Header--Group'),
					viewpicker: this.wrapper.querySelector('.BreakerCalendar-Header--View'),
					swipe:      new Swipe(this.wrapper.querySelector('.BreakerCalendar-Viewbox'))
				};

				this.view = 'MONTH';

				if (BreakerCalendar.instances) BreakerCalendar.instances.push(this);
				else BreakerCalendar.instances = [this];

				var sel = this;
				function a() {
					if (GAPILoaded) {
						gapi.client.calendar.events.list({
							'calendarId': 'suiphcuq71fqpntbc2rojdun2g@group.calendar.google.com',
							'timeMin': (new Date()).toISOString(),
							'showDeleted': false,
							'singleEvents': true,
							'maxResults': 100,
							'orderBy': 'startTime'
						}).then(function (response) {
							var html = ``;
							var events = response.result.items;
							if (events.length > 0) {
								html += `
							<div class="material-table" style="min-height: 100%; background-color: white; padding-top: 10px;">
								<table style="table-layout: fixed;">
									<tbody>
							`;
								for (var i = 0; i < events.length; i++) {
									var event = events[i];
									var when = event.start.dateTime;
									if (!when) {
										when = event.start.date;
									}
									when = new Date(when);
									html += `
										<tr>
											<td>Sat <br /> Jul 7</td>
											<td>12pm - 3pm</td>
											<td>Robotics</td>
										</tr>
									`;
								}
								html += `
									</tbody>
								</table>
							</div>
							`;
							} else {
								html += `
									<h1>No Upcomming Events</h1>
								`;
							}
							sel.elements.viewbox.querySelector('.BreakerCalendarTab--SCHEDULE').innerHTML = html;
							});
						sel.elements.today.click();
					}
					else setTimeout(a, 1000);
				} a();

				this.elements.today.onclick = function () {
					sel.monthView = [new Date().getMonth(), new Date().getFullYear()];
				}

				this.elements.swipe.onLeft = function () {
					sel.elements.forward.click();
				}

				this.elements.swipe.onRight = function () {
					sel.elements.back.click();
				}

				this.elements.back.onclick = function () {
					var a = sel.monthView[0] - 1;
					var b = sel.monthView[1];
					if (a < 0) {
						a = 11;
						b--;
					}
					sel.monthView = [a, b];
				}

				this.elements.forward.onclick = function () {
					var a = sel.monthView[0] + 1;
					var b = sel.monthView[1];
					if (a > 11) {
						a = 0;
						b++;
					}
					sel.monthView = [a, b];
				}
			}
			else throw 'Element is Undefined';
		} catch (err) { console.error(err); }
	}

	changeView(view) {
		try {
			if (view != "MONTH" && view != "SCHEDULE") throw 'Invalid View!';
			if (this.view != view) {
				this.view = view;
				this.elements.viewpicker.querySelector('div').innerHTML = this.view;

				this.elements.viewbox.querySelector('.BreakerCalendarTab--Active').classList.add('BreakerCalendarTab--Closing');
				this.elements.viewbox.querySelector('.BreakerCalendarTab--Active').classList.remove('BreakerCalendarTab--Active');
				var sel = this; setTimeout(function () { sel.elements.viewbox.querySelector('.BreakerCalendarTab--Closing').classList.remove('BreakerCalendarTab--Closing'); }, 800);
				this.elements.viewbox.querySelector('.BreakerCalendarTab--' + this.view).classList.add('BreakerCalendarTab--Closing');
				setTimeout(function () {
					sel.elements.viewbox.querySelector('.BreakerCalendarTab--' + sel.view).classList.remove('BreakerCalendarTab--Closing');
					sel.elements.viewbox.querySelector('.BreakerCalendarTab--' + sel.view).classList.add('BreakerCalendarTab--Active');
				}, 10);

				if (this.view == "MONTH") {
					this.elements.headergrp.classList.remove('BreakerCalendar-Header--Group--Hidden');
				}

				else if (this.view == "SCHEDULE") {
					this.elements.headergrp.classList.add('BreakerCalendar-Header--Group--Hidden');
				}
			}
		} catch (err) { console.error(err); return false; }
	}

	get monthView() {
		return this.mv;
	}

	set monthView(a) {
		try {
			if (a != this.mv && !this.mvccb && this.view == "MONTH") {
				this.mvccb = true;

				var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

				var anim;
				if (this.mv) {
					if (a[1] != this.mv[1])
						anim = (a[1] > this.mv[1]) ? 'in' : 'out';
					else
						anim = (a[0] > this.mv[0]) ? 'in' : 'out';
				}
				else anim = 'in';
				this.mv = a;
				this.elements.title2.innerHTML = this.elements.title.innerHTML;
				this.elements.title.innerHTML = monthNames[this.mv[0]] + ' ' + this.mv[1];

				this.elements.title.classList.add(anim);
				this.elements.title2.classList.add(anim);
				var sel = this; setTimeout(function () {
					sel.elements.title.classList.remove(anim);
					sel.elements.title2.classList.remove(anim);
					setTimeout(function () {
						sel.mvccb = false;
					}, 100);
				}, 400);

				var days = new Date(this.mv[1], this.mv[0]+1, 0).getDate();
				var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
				var html = `
					<div class="BreakerCalendar-MonthView BreakerCalendar-MonthView--` + anim + `">
				`;

				for (var i = 1; i < 36; i++) {
					var a = i.overflow(1, days);
					var b = ((this.mv[0] + Math.floor(i / days)) % 12);
					html += `
						<div id="BCMW--` + b + `-` + a + `">
							<div class="BreakerCalendar-MonthView--DNW">` + 
								(i < 8 ? `<div class="BreakerCalendar-MonthView--Day">` + dayNames[i-1] + `</div>` : ``)
								+ `<div class="BreakerCalendar-MonthView--Num">` + (a == 1 ? (monthNames[b].substring(0, 3) + ' ') : '') + a + `</div>
							</div>
						</div>
					`;
				}

				html += `</div>`;
				this.elements.viewbox.querySelector('.BreakerCalendarTab--MONTH').innerHTML = html;

				var calViewMin = new Date(monthNames[this.mv[0]] + ' ' + this.mv[1]);
				var calViewMax = new Date(monthNames[this.mv[0]] + ' ' + this.mv[1]);
				calViewMax.setDate(calViewMax.getDate() + 34);

				gapi.client.calendar.events.list({
					'calendarId': 'suiphcuq71fqpntbc2rojdun2g@group.calendar.google.com',
					'timeMin': (calViewMin).toISOString(),
					'timeMax': (calViewMax).toISOString(),
					'showDeleted': false,
					'singleEvents': true,
					'maxResults': 500,
					'orderBy': 'startTime'
				}).then(function (response) {
					var events = response.result.items;
					if (events.length > 0) {
						for (var i = 0; i < events.length; i++) {
							try {
								if (events[i].start.dateTime && events[i].end.dateTime) {
									var dates = [new Date(events[i].start.dateTime), new Date(events[i].end.dateTime)];
									var days = Math.ceil(Math.abs((dates[0].getTime() - dates[1].getTime()) / (24 * 60 * 60 * 1000)));
									for (var a = 0; a < days; a++) {
										try {
											var day = new Date(dates[0].valueOf());
											day.setDate(day.getDate() + a);
											var dayEl = [day.getMonth(), day.getDate()];
											dayEl = '#BCMW--' + day[0] + '-' + day[1];
											dayEl = sel.elements.viewbox.querySelector(day);

											dayEl.innerHTML += `
										<div onclick="menu.toggle(this.querySelector('div'), this, 'width: 300px')" class="BreakerCalendar-MonthView--Event mdc-ripple-surface" data-mdc-auto-init="MDCRipple">` +
												(days == 1 ? `<span data-delete-overflow-min="1000">` + formatTime(dates[0]) + ` &nbsp;</span>` : ``) +
												`<strong>` + events[i].summary + `</strong>
												<div>
													<div style="font-size: 20px; height: 28px; width: 100%; text-align: center; padding: 4px 4px 8px 4px; border-bottom: 1px solid rgb(220, 220, 220)">` + events[i].summary + `</div>
													<div style="width: 100%; height: calc(100% - 280x); display: flex; align-items: center; align-content: center; justify-content: center;">
													<table>
														<tbody>
															<tr>
																<td><strong>3pm</strong></td>
																<td><strong>-</strong></td>
																<td><strong>5pm</strong></td>
															</tr>
															<tr>
																<td>` + monthNames[dates[0].getMonth()].substring(0, 3) + ' ' + dates[0].getDate() + `</td>
																<td></td>
																<td>` + monthNames[dates[1].getMonth()].substring(0, 3) + ' ' + dates[1].getDate() + `</td>
															</tr>
														</table>
													</tbody>
													</div>
												</div>
										</div>
										`;
										} catch (err) { }
									}
								}
							} catch (err) { console.error(err); }
						}
					}
					function formatTime(date) {
						
					}
					window.mdc.autoInit(sel.elements.viewbox.querySelector('.BreakerCalendarTab--MONTH'));
					});
			}
		} catch (err) { console.error(err); }
	}

	static getInstance(id) {
		try {
			var a;
			BreakerCalendar.instances.forEach(function (item) {
				if (item.id == id) a = item;
			});
			return a;
		} catch (err) { console.error(err); return; }
	}
}

new BreakerCalendar(document.querySelector('#Calendar'));