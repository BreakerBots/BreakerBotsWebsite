var BreakerDate = new class BreakerDateClass {
	constructor() {
		window.addEventListener('resize', this.anchor);
		window.addEventListener("scroll", this.anchor);
		document.addEventListener('click', function () {
			if (BreakerDate.anchorElement && !(BreakerDate.ignoreClick)) {
				var a = BreakerDate.element.getBoundingClientRect();
				var x = event.clientX;
				var y = event.clientY;

				if (!(x >= a.left && x <= (a.left + a.width) && y > a.top && y < (a.top + a.height))) {
					BreakerDate.close(true);
				}
			}
			BreakerDate.ignoreClick = false;
		});
		setInterval(this.anchor, 5000);
	}

	open(textbox, usetime) {
		try {
			var a = BreakerDate.isopen;
			if (a)
				BreakerDate.close();
			setTimeout(function () {
				BreakerDate.ignoreClick = true;
				BreakerDate.element.classList.add('breaker-date--open');
				BreakerDate.anchorElement = textbox;
				BreakerDate.anchor();

				try {
					BreakerDate.date = new Date((textbox.value || ""));
					BreakerDate.sdate = new Date((textbox.value || ""));
					if (BreakerDate.date == "Invalid Date")
						throw "Invalid Date!";
				} catch (err) {
					BreakerDate.date = new Date();
					BreakerDate.sdate = new Date();
				}

				BreakerDate.usetime = usetime;
				BreakerDate.view(0);
			}, (a ? 400 : 0));
		} catch (err) { console.error(err); return; }
	}

	close(sendCallback) {
		try {
			if (sendCallback)
				try {
					if (BreakerDate.anchorElement.dataset.ondateclose) {
						var a = new Function(BreakerDate.anchorElement.dataset.ondateclose || "");
						a();
					}
				} catch (err) {  }

			BreakerDate.element.classList.remove('breaker-date--open');
		} catch (err) { console.error(err); return; }
	}

	anchor() {
		try {
			if (BreakerDate.anchorElement) {
				var a = BreakerDate.anchorElement.getBoundingClientRect();
				var mw = BreakerDate.element.scrollWidth;

				var sw = window.innerWidth;

				var tx = (a.left);
				var ty = (a.top + a.height);

				//Check Overflow Right
				if (tx + mw > sw) {
					//Check If Can Flip
					if (tx - mw > 0) {
						//Flip
						tx = tx - mw + a.width;
					}
					else {
						//Adjust Overflow Right
						tx -= ((tx + mw) - sw).min(0);
					}
				}
				//Adjust Overflow Left
				tx.min(0);

				BreakerDate.element.style.left = tx + "px";
				BreakerDate.element.style.top = ty + "px";
			}
		} catch (err) { console.error(err); return; }
	}

	get element() {
		try {
			return document.querySelector('#BreakerDate');
		} catch (err) { console.error(err); return; }
	}
	get content() {
		try {
			return document.querySelector('#BreakerDateContent');
		} catch (err) { console.error(err); return; }
	}

	get isopen() {
		try {
			return BreakerDate.element.classList.contains('breaker-date--open');
		} catch (err) { console.error(err); return; }
	}

	view(v) {
		try {
			//Tab
			document.querySelector('#BreakerDate--Month').style.display = (v == 0) ? "block" : "none";
			document.querySelector('#BreakerDate--Time').style.display = (BreakerDate.usetime && v == 1) ? "block" : "none";

			//Month
			if (v == 0) {
				var sd = BreakerDate.sdate.getDate();
				var sm = BreakerDate.sdate.getMonth();
				var sy = BreakerDate.sdate.getFullYear();
				var m = BreakerDate.date.getMonth();
				var y = BreakerDate.date.getFullYear();
				var off = new Date((m + 1) + "/1/" + y).getDay() + 1;
				var mds = new Date(y, (m + 1), 0).getDate();
				var mn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

				document.querySelector('#BreakerDate--Month--Title').innerHTML = mn[m] + " " + y;

				var html = '';
				for (var i = 0; i < (6 * 7); i++) {
					if (i % 7 == 0)
						html += '<tr>';

					var d = i + 1;
					if (d < off || (d + off) > mds)
						html += '<td></td>';
					else {
						d -= off - 1;
						html += `<td onclick="BreakerDate.date = new Date('` + (m + 1) + "/" + d + "/" + y + `'); BreakerDate.view(1);" class="v ` + ((d == sd && m == sm && y == sy) ? `cd` : ``) + `">` + d + `</td>`;
					}

					if (i % 7 == 6)
						html += '</tr>';
				}
				document.querySelector('#BreakerDate--Month--Content').innerHTML = html;
			}
			//Time
			else if (BreakerDate.usetime && v == 1) {
				var m = document.querySelector('#BreakerDate--Time--Min');
				var h = document.querySelector('#BreakerDate--Time--Hour');
				var ap = document.querySelector('#BreakerDate--Time--AMPM');

				m.innerHTML = BreakerDate.sdate.getMinutes().overflow(0, 60).pad(2);
				h.innerHTML = (BreakerDate.sdate.getHours()).overflow(1, 12);
				if (BreakerDate.sdate.getHours() / 13 >= 1)
					ap.classList.add('BreakerDate--Time--PM');
				else
					ap.classList.remove('BreakerDate--Time--PM');
			}
			else {
				//Save Using Time and Date
				if (BreakerDate.usetime) {
					BreakerDate.anchorElement.value = BreakerDate.formatDate(BreakerDate.date, true);
				}

				//Save w/ Only Date
				else {
					BreakerDate.anchorElement.value = BreakerDate.formatDate(BreakerDate.date, false);
				}

				try {
					BreakerDate.anchorElement.oninput()
				} catch (err) { }
				BreakerDate.close(true);
			}
		} catch (err) { console.error(err); }
	}

	submitTime() {
		var m = Number(document.querySelector('#BreakerDate--Time--Min').innerHTML);
		var h = Number(document.querySelector('#BreakerDate--Time--Hour').innerHTML) + (document.querySelector('#BreakerDate--Time--AMPM').classList.contains('BreakerDate--Time--PM') * 12);

		BreakerDate.date.setHours(h);
		BreakerDate.date.setMinutes(m);
	}

	formatDate(date, usetime) {
		try {
			if (usetime) {
				return (date.getMonth() + 1) + '/' +
					   date.getDate() + '/' +
					   date.getFullYear() + ' ' +
					   date.getHours().overflow(1, 12) + ":" +
					   date.getMinutes().overflow(0, 60).pad(2) + " " +
					   (date.getHours() / 13 >= 1 ? "PM" : "AM")
			}
			else {
				return ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
			}
		} catch (err) { console.error(err); }
	}
}