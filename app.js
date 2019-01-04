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
app.get('/hours', (req, res) => {
	getPage('/src/hours.html', function (page) {
				page = page.replace('CONTENT', `
					<br>
					<table class="member-table">
					</table>
						<script>
							//Fill In Select
							var users = USERS;
							(function fillInUsers() {
								var html = "<tr> <th>Team Member</th> <th>Time</th> </tr>";
								const select = document.querySelector('.member-table');
		
								for (var i = 0; i < Object.keys(users).length; i++) {
									var name = Object.keys(users)[i];
									var data = users[Object.keys(users)[i]];
									data = data.hours + "h";
		
									html += '<tr> <td>' + name + '</td> <td>' + data + '</td> </tr>';								}
		
								select.innerHTML = html;
							})();
						</script>
						`);
				//Get min date and total hours
				var minDate;
				var totalHours = 0;
				datastore.get(datastore.key(['meeting', 'meeting']))
				.then(([entity]) => {
					var history = entity.history;
					minDate = Time.createDate(entity.minDate);
					totalHours = dateArrayToHours(history, minDate, Time.createDate());
				});
				//Get All Users
				datastore.runQuery(datastore.createQuery('member').order('name'))
					.then(results => {
						const members = results[0];
						var users = {};
						members.forEach(function (member) {
							var history = member.history;
							var name = member.name;
		
							users[name] = {
								hours: dateArrayToHours(history, minDate, Time.createDate())
							};
						});
						users['Total Hours'] = { hours: totalHours };
						res.status(200).send(page.replace('USERS', JSON.stringify(users)));
					})
					.catch((err) => {
						console.error(err);
					});
		
					function dateArrayToHours(a, min, max) {
						var totalMinutes = 0;
						min.setHours(0, 0, 0, 0);
						max.setHours(0, 0, 0, 0);
						for (var i = 0; i < a.length; i += 2) {
							var d = Time.createDate(a[i + 1]);
							if (d != "Invalid Date") {
								var m = Math.round((d.getTime() - Time.createDate(a[i]).getTime()) / 1000 / 60);
								d.setHours(0, 0, 0, 0);
								if (d >= min && d <= max) {
									totalMinutes += m;
								}
							}
						}
						return Math.floor(totalMinutes / 60);
					}
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
				closePage();
				setTimeout(function () {
					window.location.search = "?p=" + sh(p);
				}, 400);
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
			<button onclick="window.location.href='hours';" type="button" class="btn btn-primary">View Hours</button>
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
					closePage();
					fetch("https://us-central1-breaker-site.cloudfunctions.net/createMeeting?s=" + encodeURIComponent(st) + "&e=" + encodeURIComponent(et)).then(function () {
						location.reload();
					});
				}
				else alert("The start date must before the end date.");
			}
		</script>
		`,
		ss: `
		<style>
			.form-group.select {
				position: relative;
			}

				.form-group.select select {
					display: none;
				}

			.select-selected {
				border-radius: .3rem;
				transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
				border: 1px solid #ced4da;
				padding: 8px 16px;
				cursor: pointer;
				user-select: none;
				color: #495057;
				min-height: 42px;
			}

				.select-selected.select-arrow-active {
					background-color: #fff;
					border-color: #ea778b;
					outline: 0;
					box-shadow: 0 0 0 0.2rem rgba(196,30,58,.25);
				}

			.select-items > div {
				color: #495057;
				padding: 8px 16px;
				border: 1px solid transparent;
				border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
				cursor: pointer;
				user-select: none;
				transition: background-color 0.2s ease-in-out;
			}

				.select-items > div:hover {
					background-color: rgba(0, 0, 0, 0.1);
				}

				.select-items > div.same-as-selected {
					background-color: rgba(234, 119, 139, 0.3);
				}

				.select-items > div > s1 {
					text-decoration: none;
					float: right;
				}

			.select-items {
				position: absolute;
				background-color: white;
				color: #495057;
				top: 100%;
				left: 0;
				right: 0;
				z-index: 99;
				border-radius: .3rem;
				border: 1px solid transparent;
				border-color: #ea778b #ea778b #ea778b #ea778b;
			}

			.select-hide {
				display: none;
			}
		</style>
		<card>
			<img src="assets/img/foreverlogo.png" />
			<card-title>Sign In/Out</card-title>
			<card-subtitle>(MEETING_TITLE)</card-subtitle>
			<div class="form-group select">
				<label for="name">Name</label>
				<div class="select-selected select-arrow-active"></div>
				<div class="select-items">

				</div>
			</div>
			<button onclick="sign()" id="signButton" type="button" class="btn btn-primary" style="display: none;"></button>
		</card>
		<script>
			//Fill In Select
			var users = USERS;
			(function fillInUsers() {
				var html = "";
				const select = document.querySelector('.select-items');

				for (var i = 0; i < Object.keys(users).length; i++) {
					var name = Object.keys(users)[i];
					var data = users[Object.keys(users)[i]];
					data = (data.in ? "In" : "Out") + " " + data.hours + "h";

					html += '<div> <s0>' + name + '</s0> <s1>' + data + '</s1></div>';
				}

				select.innerHTML = html;
			})();

			//Update button when new user selected
			function updateSignButton(name) {
				document.querySelector('#signButton').style.display = "block";
				document.querySelector('#signButton').innerHTML = users[name].in ? "Sign Out" : "Sign In";
			}

			//Select
			[].forEach.call(document.querySelectorAll('div.form-group > .select-items > div'), function (c) {
				c.onclick = function () { //On Choose
					var name = this.querySelector('s0').innerText;
					document.querySelector('div.form-group .select-selected').innerText = name;
					updateSignButton(name);
					if (document.querySelector('div.form-group .select-items div.same-as-selected'))
						document.querySelector('div.form-group .select-items div.same-as-selected').classList.remove('same-as-selected');
					this.classList.add('same-as-selected');
				}
			});
			document.addEventListener("click", function (el) { //Close
				var s = document.querySelector('div.form-group .select-selected');
				var i = document.querySelector('div.form-group .select-items');

				if (s.classList.contains('select-arrow-active')) {
					if (s.classList.contains('select-i1'))
						s.classList.remove('select-i1');
					else {
						s.classList.remove("select-arrow-active");
						i.classList.add("select-hide");
					}
				}
			});
			document.querySelector('div.form-group .select-selected').addEventListener("click", function () { //Open/Close
				var s = document.querySelector('div.form-group .select-selected');
				var i = document.querySelector('div.form-group .select-items');

				if (!s.classList.contains('select-arrow-active')) {
					s.classList.add("select-arrow-active");
					s.classList.add("select-i1");
					i.classList.remove("select-hide");
				}
			});

			//Sign In/Out User
			function sign() {
				var name = document.querySelector('.select-selected').innerText;
				closePage();
				fetch("https://us-central1-breaker-site.cloudfunctions.net/sign?" + "so=" + encodeURIComponent(users[name].in ? "true" : "false") + "&n=" + encodeURIComponent(name) + "&ed=" + encodeURIComponent("ENDDATE")).then(function () {
					location.reload();
				});
			}
		</script>
		`
	};
	getPage('/src/ss.html', function (page) {
		//Get Registered
		function sha256(a) {
			function b(b, h) { var a = (b & 65535) + (h & 65535); return (b >> 16) + (h >> 16) + (a >> 16) << 16 | a & 65535 } function e(b, a) { return b >>> a | b << 32 - a } a = function (b) { b = b.replace(/\r\n/g, "\n"); for (var a = "", d = 0; d < b.length; d++) { var c = b.charCodeAt(d); 128 > c ? a += String.fromCharCode(c) : (127 < c && 2048 > c ? a += String.fromCharCode(c >> 6 | 192) : (a += String.fromCharCode(c >> 12 | 224), a += String.fromCharCode(c >> 6 & 63 | 128)), a += String.fromCharCode(c & 63 | 128)) } return a }(a); return function (a) { for (var b = "", d = 0; d < 4 * a.length; d++)b += "0123456789abcdef".charAt(a[d >> 2] >> 8 * (3 - d % 4) + 4 & 15) + "0123456789abcdef".charAt(a[d >> 2] >> 8 * (3 - d % 4) & 15); return b }(function (a, h) { var d = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298], c = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], g = Array(64), u, f; a[h >> 5] |= 128 << 24 - h % 32; a[(h + 64 >> 9 << 4) + 15] = h; for (u = 0; u < a.length; u += 16) { var n = c[0], q = c[1], r = c[2], x = c[3], p = c[4], v = c[5], w = c[6], l = c[7]; for (f = 0; 64 > f; f++) { if (16 > f) g[f] = a[f + u]; else { var k = f, m = g[f - 2]; m = e(m, 17) ^ e(m, 19) ^ m >>> 10; m = b(m, g[f - 7]); var t = g[f - 15]; t = e(t, 7) ^ e(t, 18) ^ t >>> 3; g[k] = b(b(m, t), g[f - 16]) } k = p; k = e(k, 6) ^ e(k, 11) ^ e(k, 25); k = b(b(b(b(l, k), p & v ^ ~p & w), d[f]), g[f]); l = n; l = e(l, 2) ^ e(l, 13) ^ e(l, 22); m = b(l, n & q ^ n & r ^ q & r); l = w; w = v; v = p; p = b(x, k); x = r; r = q; q = n; n = b(k, m) } c[0] = b(n, c[0]); c[1] = b(q, c[1]); c[2] = b(r, c[2]); c[3] = b(x, c[3]); c[4] = b(p, c[4]); c[5] = b(v, c[5]); c[6] = b(w, c[6]); c[7] = b(l, c[7]) } return c }(function (a) { for (var b = [], d = 0; d < 8 * a.length; d += 8)b[d >> 5] |= (a.charCodeAt(d / 8) & 255) << 24 - d % 32; return b }(a), 8 * a.length))
		};
		if (req.query.p != sha256("fRCbREAKERbOTS")) {
			res.status(200).send(page.replace('CONTENT', pages.register));
		}
		else {
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
							page = page.replace('ENDDATE', Time.dateToString(ed));

							//Get All Users
							datastore.runQuery(datastore.createQuery('member').order('name'))
								.then(results => {
									const members = results[0];
									var users = {};
									members.forEach(function (member) {
										var history = member.history;
										var name = member.name;

										users[name] = {
											in: ((Time.createDate(history[history.length - 1]).valueOf() == Time.createDate(history[history.length - 2]).valueOf())
											&& (Time.createDate(history[history.length - 1]) >= sd)),
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