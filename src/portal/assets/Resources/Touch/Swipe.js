// Swipe.js

class Swipe {
	constructor(element) {
		this.xDown = null;
		this.yDown = null;
		this.element = typeof element == 'string' ? document.querySelector(element) : element;

		var sel = this;
		this.element.addEventListener('touchstart', function () {
			sel.xDown = event.touches[0].clientX;
			sel.yDown = event.touches[0].clientY;
		}, { passive: true });

		this.element.addEventListener('touchmove', function () {
			sel.handleTouchMove(event);
		}, { passive: true });
	}

	set onLeft(callback) {
		try {
			this.ol = callback;
			return true;
		} catch (err) { return false; }
	}

	set onRight(callback) {
		try {
			this.or = callback;
			return true;
		} catch (err) { return false; }
	}

	set onUp(callback) {
		try {
			this.ou = callback;
			return true;
		} catch (err) { return false; }
	}

	set onDown(callback) {
		try {
			this.od = callback;
			return true;
		} catch (err) { return false; }
	}

	handleTouchMove(evt) {
		try {
			if (!this.xDown || !this.yDown) {
				return;
			}

			var xUp = evt.touches[0].clientX;
			var yUp = evt.touches[0].clientY;

			this.xDiff = this.xDown - xUp;
			this.yDiff = this.yDown - yUp;

			if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) {
				if (this.xDiff > 0) {
					if (this.ol) this.ol();
				} else {
					if (this.or) this.or();
				}
			} else {
				if (this.yDiff > 0) {
					if (this.ou) this.ou();
				} else {
					if (this.od) this.od();
				}
			}

			this.xDown = null;
			this.yDown = null;
		} catch (err) { console.error(err); }
	}
}
