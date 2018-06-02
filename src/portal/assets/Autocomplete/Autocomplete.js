//Autocomplete.js

class Autocomplete {
	constructor(container) {
		var self = this;
		self.element = container.querySelector("input");
		self.container = container;
		self.wrapper = container.querySelector(".autocomplete-items");
		getAutocompleteItems();
		self.focus = -1;
		self.refreshSearch();

		/*					<-- Source -->				  */

		//Search
		self.element.oninput = function () {
			changeFocus(-1);
			clearWrapper();

			var search = self.fuse.search(this.value);
			for (var i = 0; i < search.length; i++) {
				self.wrapper.innerHTML += `
					<div class="autocomplete-item" onclick="
							(this.parentNode.parentNode).querySelector('input').value = this.querySelector('input').value;
							this.parentNode.innerHTML = '';
					">
						<span>` + self.options[search[i]] + `</span>
						<input type='hidden' value="` + self.options[search[i]] + `">
					</div>
					`;
			}
		}

		self.element.onkeydown = function (e) {
			//Down Key
			if (e.keyCode == 40) {
				changeFocus(self.focus + 1);
			}
			//Up Key
			else if (e.keyCode == 38) {
				if (self.focus > 0)
					changeFocus(self.focus - 1);
				else
					changeFocus(self.wrapper.querySelectorAll(".autocomplete-item").length - 1);
			}
			//Enter Key
			else if (e.keyCode == 13) {
				e.preventDefault();
				if (self.focus > -1) {
					var target = self.wrapper.querySelectorAll(".autocomplete-item")[self.focus];
					if (target) target.click();
				}
			}
		}

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
			self.wrapper.innerHTML = ``;
			changeFocus(-1);
		}

		setInterval(getAutocompleteItems, 500);
		var __options = "";
		function getAutocompleteItems() {
			if (__options != JSON.stringify(self.container.querySelector(".autocomplete-options").querySelectorAll("*"))) {
				__options = JSON.stringify(self.container.querySelector(".autocomplete-options").querySelectorAll("*"));
				self.options = [];
				var __tempop = self.container.querySelector(".autocomplete-options").querySelectorAll("*");
				for (var i = 0; i < __tempop.length; i++) {
					self.options.push(__tempop[i].innerHTML);
				}
				self.refreshSearch();
			}
		}
	}

	refreshSearch() {
		this.fuse = new Fuse(this.options,
			{
				shouldSort: true,
				threshold: 0.4,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 2
			}); 
	}
}

var AutocompleteAutoInitList = [];
function AutocompleteAutoInit() {
	[].forEach.call(document.querySelectorAll("[data-autocomplete-auto-init]"), function (item) {
		if (AutocompleteAutoInitList.indexOf(item) == -1) {
			new Autocomplete(item);
			AutocompleteAutoInitList.push(item);
		}
	});
} AutocompleteAutoInit();