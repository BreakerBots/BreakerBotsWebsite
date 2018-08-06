// Load WOW.js on non-touch devices
try {
	var isPhoneDevice = "ontouchstart" in document.documentElement;
	$(document).ready(function () {
		if (isPhoneDevice) {
			//mobile
		} else {
			//desktop
			// Initialize WOW.js
			wow = new WOW({
				offset: 50
			})
			wow.init();
		}
	});
} catch (err) { console.error(err); }

(function ($) {
	"use strict"; // Start of use strict

	// Smooth scrolling using jQuery easing
	try {
		$('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
			if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
				if (target.length) {
					$('html, body').animate({
						scrollTop: (target.offset().top - 69)
					}, 1000, "easeInOutExpo");
					return false;
				}
			}
		});
	} catch (err) { console.error(err); }

	// Closes responsive menu when a scroll trigger link is clicked
	try {
		$('.js-scroll-trigger').click(function () {
			$('.navbar-collapse').collapse('hide');
		});
	} catch (err) { console.error(err); }

	// Activate scrollspy to add active class to navbar items on scroll
	try {
		$('body').scrollspy({
			target: '#mainNav',
			offset: 70
		});
	} catch (err) { console.error(err); }


  // Activates floating label headings for the contact form
	try {
  $("body").on("input propertychange", ".floating-label-form-group", function(e) {
    $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
  }).on("focus", ".floating-label-form-group", function() {
    $(this).addClass("floating-label-form-group-with-focus");
  }).on("blur", ".floating-label-form-group", function() {
    $(this).removeClass("floating-label-form-group-with-focus");
			});
	} catch (err) { console.error(err); }


  // Owl Carousel Settings
	try {
		$(".team-carousel").owlCarousel({
			items: 3,
			navigation: true,
			pagination: false,
			navigationText: [
				"<i class='fa fa-angle-left'></i>",
				"<i class='fa fa-angle-right'></i>"
			],
		});
	} catch (err) { console.error(err); }

	
	try {
		$(".portfolio-carousel").owlCarousel({
			singleItem: true,
			navigation: true,
			pagination: false,
			navigationText: [
				"<i class='fa fa-angle-left'></i>",
				"<i class='fa fa-angle-right'></i>"
			],
			autoHeight: true,
			mouseDrag: false,
			touchDrag: false,
			transitionStyle: "fadeUp"
		});
	} catch (err) { console.error(err); }

	try {
		$(".testimonials-carousel, .mockup-carousel").owlCarousel({
			singleItem: true,
			navigation: true,
			pagination: true,
			autoHeight: true,
			navigationText: [
			  "<i class='fa fa-angle-left'></i>",
			  "<i class='fa fa-angle-right'></i>"
			],
			transitionStyle: "backSlide"
		});

		$(".portfolio-gallery").owlCarousel({
			items: 3,
		});
	} catch (err) { console.error(err); }


})(jQuery); // End of use strict

// Collapse Navbar
function getScroll() {
	return (document.documentElement.scrollTop || document.body.scrollTop);
}
setInterval(function () {
	if (getScroll() > 0)
		$("#mainNav").addClass("navbar-shrink");
	else
		$("#mainNav").removeClass("navbar-shrink");
}, 100);