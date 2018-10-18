'use strict';

const express = require('express');
const app = express();
const fs = require("fs");
const path = require('path');
app.use(express.static('src'));
const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'breaker-site',
});
const Time = require('./src/assets/js/time.js');
const https = require('https');

//Hosting
app.get('/', (req, res) => {
	getPage('/src/index.html', function (page) {
		res.status(200).send(page);
	});
});
app.get('/blog', (req, res) => {
	getPage('/src/blog.html', function (page) {
		res.status(200).send(page);
	});
});
app.get('/regional', (req, res) => {
	getPage('/src/regional.html', function (page) {
		res.status(200).send(page);
	});
});
app.get('/ss', (req, res) => {
	const pages = {
		register: `
		<card>
			<img src="assets/img/foreverlogo.png" />
			<card-title>Register Computer</card-title>
			<input type="text" class="form-control" placeholder="Admin Password" />
			<button onclick="registerComputer(this.parentNode.querySelector('input').value)" type="button" class="btn btn-primary">Register</button>
		</card>
		<script>
			function registerComputer(p) {
				fetch("https://us-central1-breaker-site.cloudfunctions.net/registerComputer?p=" + p).then(function (v) {
					location.reload();
				});
			}
		</script>`,
		meeting: `
		<card>
			<img src="assets/img/foreverlogo.png" />
			<card-title>Start Meeting</card-title>
			<div class="form-group">
				<label for="startTime">Start Time</label>
				<input type="text" class="form-control" id="startTime" placeholder="Start Time">
			</div>
			<div class="form-group">
				<label for="endTime">End Time</label>
				<input type="text" class="form-control" id="endTime" placeholder="End Time">
			</div>
			<button onclick="createMeeting(document.querySelector('#startTime').value, document.querySelector('#endTime').value)" type="button" class="btn btn-primary">Start Meeting</button>
		</card>
		<script src="assets/js/time.js"></script>
		<script>
			//Set Default Dates
			(function setDefaultDates() {
				var date = roundMinutes(createDate(), 15);
				
				var min = date.getMinutes();
				var shour = date.getHours();
				var ehour = date.getHours() + 3; if (ehour > 24) ehour = 24;
				
				document.querySelector('#startTime').value = to12(shour + ":" + min);
				document.querySelector('#endTime').value = to12(ehour + ":" + min);
			})();

			//Start a meeting
			function createMeeting(st, et) {
				st = to24(st);
				et = to24(et);
				if (toDate(et) > toDate(st)) {
					fetch("https://us-central1-breaker-site.cloudfunctions.net/createMeeting?s=" + encodeURIComponent(st) + "&e=" + encodeURIComponent(et)).then(function () {
						location.reload();
					});
				}
				else alert("The start date must before the end date.");
			}
		</script>
		`,
		ss: `
		<card>
			<img src="assets/img/foreverlogo.png" />
			<card-title>Sign In/Out</card-title>
			<card-subtitle>(MEETING_TITLE)</card-subtitle>
			<div class="form-group">
				<label for="name">Name</label>
				<select class="form-control form-control-lg" id="name" onchange="updateSignButton(this.value)">
					<option disabled selected style="display: none"></option>
				</select>
			</div>
			<button onclick="sign(this.parentNode.querySelector('#name').value)" id="signButton" type="button" class="btn btn-primary" style="display: none;"></button>
		</card>
		<span id="ruler" style="visibility: hidden"></span>
		<script>
			function sign(name) {
				fetch("https://us-central1-breaker-site.cloudfunctions.net/sign?n=" + encodeURIComponent(name)).then(function () {
					location.reload();
				});
			}

			var users = USERS;

			(function fillInUsers() {
				var html = html;
				const select = document.querySelector('#name');
				const selectWidth = select.getBoundingClientRect().width;
				const spaceWidth = stringLength("&nbsp;");

				for (var i = 0; i < Object.keys(users).length; i++) {
					var name = Object.keys(users)[i];
					var data = users[Object.keys(users)[i]];
					data = data.hours + "h " + (data.in ? "&nbsp;&nbsp;&nbsp;In" : "Out");
					var spaces = (selectWidth - stringLength(name) - stringLength(data) - 23 - 40) / spaceWidth;

					html += "<option value='" + name + "'>" + name + "&nbsp;".repeat(spaces) + data + "</option>";
				}

				select.innerHTML = html;
				select.selectedIndex = -1;

				function stringLength(s) {
					var ruler = document.querySelector("#ruler");
					ruler.innerHTML = s;
					return ruler.getBoundingClientRect().width;
				}
			})();

			function updateSignButton(name) {
				console.log(users[name].in ? "Sign Out" : "Sign Out");
				document.querySelector('#signButton').style.display = "block";
				document.querySelector('#signButton').innerHTML = users[name].in ? "Sign Out" : "Sign In";
			}
		</script>
		`
	};
	getPage('/src/ss.html', function (page) {
		//Get Registered
		var i = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if (i.indexOf(',') != -1) i = i.substring(0, i.indexOf(','));
		datastore.get(datastore.key(['computer', req.headers['x-forwarded-for'] || req.connection.remoteAddress]))
			.then(([entity]) => {
				if (!entity) {
					//Not Registered
					res.status(200).send(page.replace('CONTENT', pages.register));
				}
				else {
					//Get In Meeting
					datastore.get(datastore.key(['meeting', 'meeting']))
						.then(([entity]) => {
							var history = entity.history;
							var minDate = Time.createDate(entity.minDate);
							if (history.length > 1) {
								var sd = Time.createDate(history[history.length - 2]);
								var ed = Time.createDate(history[history.length - 1]);
								var cd = Time.roundMinutes(Time.createDate(), 15);

								if (cd >= sd && cd <= ed) {
									//In Meeting
									page = page.replace('CONTENT', pages.ss);
									var sh = Time.hourFormat(Time.to12(Time.toTime(sd)));
									var eh = Time.hourFormat(Time.to12(Time.toTime(ed)));

									page = page.replace('MEETING_TITLE', sh + "-" + eh);

									//Get All Users
									datastore.runQuery(datastore.createQuery('member'))
										.then(results => {
											const members = results[0];
											var users = {};
											members.forEach(function (member) {
												var history = member.history;
												var name = member.name;

												users[name] = {
													in: (history.length % 2) != 0,
													hours: dateArrayToHours(history, minDate, Time.createDate())
												};
											});
											res.status(200).send(page.replace('USERS', JSON.stringify(users)));

											function dateArrayToHours(a, min, max) {
												var totalMinutes = 0;
												min.setHours(0, 0, 0, 0);
												max.setHours(0, 0, 0, 0);
												for (var i = 0; i < a.length; i += 2) {
													var d = Time.createDate(a[i + 1]);
													if (d != "Invalid Date") {
														var m = Math.round( ( d.getTime() - Time.createDate(a[i]).getTime() ) / 1000 / 60 );
														d.setHours(0, 0, 0, 0);
														if (d >= min && d <= max) {
															totalMinutes += m;
														}
													}
												}
												return Math.floor(totalMinutes / 60);
											}
										});
								}
								else {
									//Not in Meeting
									res.status(200).send(page.replace('CONTENT', pages.meeting));
								}
							}
							else {
								//Not in Meeting
								res.status(200).send(page.replace('CONTENT', pages.meeting));
							}
						})
						.catch((err) => {
							console.error(err);
							res.status(200).send(page.replace('CONTENT', pages.register));
						});
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(200).send(page.replace('CONTENT', pages.register));
			});
	});
});

//Page Functions
function getPage(dir, callback) {
	fs.readFile(path.join(__dirname, dir), 'utf8', function (err, data) {
		if (err) { console.error(err); return; }
		callback(data);
	});
}

//Local Serving
if (module === require.main) {
	const server = app.listen(process.env.PORT || 5000, () => {
		const port = server.address().port;
		console.log(`Serving at localhost:${port}`);
	});
}
module.exports = app;