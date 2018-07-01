// Tooltips.js

/*
	Just Add:  
		aria-label="I Dunno"   (Text)
	Options:
		aria-label-delay="10s"    (Time)
		aria-label-z-index="1000"    (Z-Index -- Number)
 */

setInterval(updateTooltips, 2000);
window.addEventListener('resize', updateTooltips);
var tooltipList = [];
function updateTooltips() {
	[].forEach.call(document.querySelectorAll('[aria-label]'), function (tp) {
		if (tooltipList.indexOf(tp) == -1) {
			tooltipList.push(tp);
		}
	});
}
var CanShowTooltip = true;
var touchDown;
var VisibleTooltip = null;
var VisibleTooltipStartTime;
setInterval(checkTooltip, 1000);
document.addEventListener('mousemove', checkTooltip);
document.addEventListener('touchstart', function () {
	touchDown = true;
	if (event.touches[0]) {
		mouseX = event.touches[0].pageX;
		mouseY = event.touches[0].pageY;
	}
	checkTooltip();
});
document.addEventListener('touchend', function () {
	touchDown = false;
	if (event.touches[0]) {
		mouseX = event.touches[0].pageX;
		mouseY = event.touches[0].pageY;
	}
	checkTooltip();
});
document.addEventListener('resize', checkTooltip);
function checkTooltip() {
	if (CanShowTooltip) {
		var el;
		for (var i = 0; i < tooltipList.length; i++) {
			var ELB = tooltipList[i].getBoundingClientRect();
			if (ELB.width > 0 && ELB.height > 0) {
				if (mouseX >= ELB.left && mouseX <= ELB.left + ELB.width && mouseY >= ELB.top && mouseY <= ELB.top + ELB.height && (is_touch_device() ? touchDown : true))
					el = tooltipList[i];
			}
		}
		if (el && (VisibleTooltip ? el == VisibleTooltip : true)) {
			if ((VisibleTooltip ? el != VisibleTooltip : true)) {
				VisibleTooltip = el;
				VisibleTooltipStartTime = new Date();
				document.querySelector(".bstooltip").classList.add("bstooltip--active");
				document.querySelector(".bstooltip").innerHTML = el.getAttribute('aria-label');
				document.querySelector('.bstooltip').style.transitionDelay = el.getAttribute('aria-label-delay') || '0.5s';
				document.querySelector(".bstooltip-container").style.zIndex = el.getAttribute('aria-label-z-index') || 500;
			}
			else {
				if ((new Date().getTime() - VisibleTooltipStartTime.getTime()) > 3000) {
					CanShowTooltip = false;
					document.querySelector('.bstooltip').style.transitionDelay = '0s';
					document.querySelector(".bstooltip").classList.remove("bstooltip--active");
					setTimeout(function () {
						CanShowTooltip = true;
						checkTooltip();
					}, 450);
				}
			}
			var ELB = el.getBoundingClientRect();
			var elWi = document.querySelector(".bstooltip").innerHTML.length * 3.78 + 18;
			var outsideWindowAdjust = (window.innerWidth - (((ELB.left + (ELB.width / 2)) + elWi))).max(0);
			document.querySelector(".bstooltip-container").style.left = ((ELB.left + (ELB.width / 2)) + outsideWindowAdjust) + "px";
			document.querySelector(".bstooltip-container").style.top = (ELB.top + ELB.height) + "px";
		} else {
			if (VisibleTooltip) {
				VisibleTooltip = null;
				CanShowTooltip = false;
				document.querySelector('.bstooltip').style.transitionDelay = '0s';
				document.querySelector(".bstooltip").classList.remove("bstooltip--active");
				setTimeout(function () {
					CanShowTooltip = true;
					checkTooltip();
				}, 450);
			}
		}
	}
}

//Moue Pos
var mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', function () { mouseX = event.clientX, mouseY = event.clientY; });

