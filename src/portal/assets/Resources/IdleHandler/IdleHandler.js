// IdleHandler.js

var IdleTimer = 0;

document.addEventListener('mousemove', ResetIdleTimer);
document.addEventListener('keypress', ResetIdleTimer);
document.addEventListener('DOMContentLoaded', ResetIdleTimer);
document.addEventListener('mousedown', ResetIdleTimer);
document.addEventListener('touchstart', ResetIdleTimer);
document.addEventListener('click', ResetIdleTimer);
document.addEventListener('scroll', ResetIdleTimer);

function ResetIdleTimer() {
	IdleTimer = 0;
}

setInterval(function () {
	IdleTimer += 2000;
}, 2000);