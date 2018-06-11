//Autocomplete.js

class AutocompleteUsers {
	constructor(container) {
		var self = this;
		self.element = container.querySelector("input");
		self.container = container;
		self.wrapper = container.querySelector(".autocomplete-items");
		self.focus = -1;
		self.refreshSearch();
		self.searchKey = self.container.dataset.autocompleteUsersChar == undefined ? "@" : self.container.dataset.autocompleteUsersChar;

		/*					<-- Source -->				  */

		//Search
		function checkInp() {
			changeFocus(-1);
			clearWrapper();

			var cw = findCurrentWord(self.element.value, self.element.selectionStart);

			if (cw.word[0] == self.searchKey || self.searchKey == "") {
				var search = cw.word.substr(self.searchKey.length) == "" ? self.getAllData() : self.fuse.search(cw.word.substr(self.searchKey.length));
				setTimeout(function () { 
					for (var i = 0; i < search.length; i++) {
						self.wrapper.innerHTML += `
							<div class="autocomplete-item" onclick="
									var inp = (this.parentNode.parentNode).querySelector('input');
									inp.value = replaceCurrentWord(inp.value, inp.selectionStart, '` + self.searchKey + `' + this.querySelector('input').value);
									this.parentNode.innerHTML = '';
							">` +
							((search[i].members || search[i].name == "#Everyone") ?
							`<img src="` + (search[i].members ? '../assets/icons/jersey.png' : '../assets/icons/people.png') + `" style="width: 35px; height: auto; margin-right: 5px;" alt="Avatar"/>
							<span style="font-weight: 600;">` + search[i].name + `</span>
							<input type='hidden' value="` + search[i].name + `">`
							:
							`<img src="` + (search[i].avatar || '../assets/img/iconT.png') + `" style="border-radius: 50%; width: 35px; height: auto; margin-right: 5px;" alt="Avatar"/>
							<span style="font-weight: 600;">` + search[i].username + `</span>
							<span style="font-size: 90%;">` + search[i].name + `</span>
							<input type='hidden' value="` + search[i].username + `">`
							)
							+ `</div>
							`;
					}
				}, 10);
			}
		}

		self.element.addEventListener('click', checkInp);
		self.element.addEventListener('input', checkInp);
		self.element.addEventListener('keydown', function (e) {
			//Left or Right Arrow
			if (e.keyCode == 39 || e.keyCode == 37) {
				checkInp();
			}
			//Down Arrow
			if (e.keyCode == 40) {
				changeFocus(self.focus + 1);
			}
			//Up Arrow
			else if (e.keyCode == 38) {
				if (self.focus > 0)
					changeFocus(self.focus - 1);
				else
					changeFocus(self.wrapper.querySelectorAll(".autocomplete-item").length - 1);
			}
			//Enter
			else if (e.keyCode == 13) {
				e.preventDefault();
				if (self.focus > -1) {
					var target = self.wrapper.querySelectorAll(".autocomplete-item")[self.focus];
					if (target) target.click();
				}
			}
		});

		function changeFocus(target) {
			self.focus = target;
			[].forEach.call((self.wrapper.querySelectorAll(".autocomplete-active")), function (item) {
				item.classList.remove("autocomplete-active");
			});
			if (target != -1) {
				var targetEl = self.wrapper.querySelectorAll(".autocomplete-item")[target];
				if (targetEl) {
					targetEl.classList.add("autocomplete-active");
					scrollTarget = targetEl;
				}
				else if (target > self.wrapper.querySelectorAll(".autocomplete-item").length - 1) {
					changeFocus(0);
				}
			}
		} changeFocus(-1);

		var scrollTarget; setInterval(scrollIntoView, 10);
		function scrollIntoView() {
			if (scrollTarget) {
				if (/* Not Above */(scrollTarget.offsetTop >= self.wrapper.scrollTop) && /* Not Below */(scrollTarget.offsetTop <= self.wrapper.scrollTop + 180))
					scrollTarget = null;
				else {
					var target = (scrollTarget.offsetTop >= self.wrapper.scrollTop) ? scrollTarget.offsetTop + 180 : scrollTarget.offsetTop;
					self.wrapper.scrollTop = self.wrapper.scrollTop + ((target - self.wrapper.scrollTop) / 40);
				}
			}
		}

		document.addEventListener('click', clearWrapper);

		//Clear the autocomplete wrapper
		function clearWrapper() {
			self.wrapper.innerHTML = '';
			changeFocus(-1);
		}
	}

	refreshSearch() {
		this.fuse = new Fuse(this.getAllData(),
			{
				shouldSort: true,
				threshold: 0.6,
				location: 0,
				distance: 100,
				maxPatternLength: 50,
				keys: [
					"name",
					"clearance",
					"username",
					"teams"
				]
			});
	}

	getAllData() {
		var users = Object.values(allUsers);
		var allTeams = Object.values(teams.getAllTeamsForAutocomplete());
		var other = [{ name: "#Everyone" }];
		return users.concat(allTeams.concat(other));
	}
}

var AutocompleteUsersAutoInitList = [];
function AutocompleteUsersAutoInit() {
	[].forEach.call(document.querySelectorAll("[data-autocomplete-users-auto-init]"), function (item) {
		if (AutocompleteUsersAutoInitList.indexOf(item) == -1) {
			new AutocompleteUsers(item);
			AutocompleteUsersAutoInitList.push(item);
		}
	});
} AutocompleteUsersAutoInit();

var AutocompleteUsersValidateEngines = [];
var AutocompleteUsersValidateEnginesInit = false;
function AutocompleteUsersValidate(arr) {
	try {
		if (!AutocompleteUsersValidateEnginesInit) {
			AutocompleteUsersValidateEnginesInit = true;
			AutocompleteUsersValidateEngines = [
				new Fuse(Object.values(allUsers), {
					shouldSort: true,
					threshold: 0.6,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					minMatchCharLength: 4,
					keys: [
						"name",
						"username"
					]
				}),
				new Fuse(Object.values(teams.getAllTeams()), {
					shouldSort: true,
					threshold: 0.6,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					minMatchCharLength: 4,
					keys: [
						"name"
					]
				})
			]
		}
		var ret = true;
		for (var i = 0; i < arr.length; i++) {
			var tar = arr[i];
			//Team or Everyone
			if (tar.charAt(0) == "#") {
				if (tar != "#Everyone") {
					if (!teams.isTeam(tar.substring(1))) {
						var ser = AutocompleteUsersValidateEngines[1].search(tar);
						return tar + " is not a team!" + (ser.length > 0 ? (" Did you mean #" + ser[0].name + "?") : "");
					}
				}
			}
			//User
			else {
				if (!users.isUsername(tar)) {
					var ser = AutocompleteUsersValidateEngines[0].search(tar);
					return tar + " is not a registered user!" + (ser.length > 0 ? (" Did you mean " + ser[0].username + "?") : "");
				}
			}
		}
		return ret;
	} catch (err) { return err; }
}