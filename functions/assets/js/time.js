//Time Functions

/**
 * Converts 12 times to 24 times
 * @param {any} time 12 time to convert
 */
function to24(time) {
	time = time.toUpperCase();
	var hour = parseInt(time.substring(0, time.indexOf(':')));
	var min = parseInt(time.substring(time.indexOf(':') + 1, time.indexOf(' ')));
	if (time.substring(time.indexOf(' ') + 1) == "AM") { if (hour == 12) hour = 0; }
	else if (hour < 12) hour += 12;
	if (min < 10) min = "0" + min;
	return hour + ":" + min;
}

/**
 * Converts 24 time to 12 time
 * @param {any} time 24 time to convert
 */
function to12(time) {
	time = time.toUpperCase();
	var hour = parseInt(time.substring(0, time.indexOf(':')));
	var min = parseInt(time.substring(time.indexOf(':') + 1));
	var mer = hour > 12;
	if (hour == 0) { hour = 24; mer = !mer; }
	if (hour > 12) hour -= 12;
	if (hour == 12) mer = !mer;
	if (min < 10) min = "0" + min;
	return hour + ":" + min + " " + (mer ? "PM" : "AM");
}

/**
 * Converts 24 time into a date object
 * @param {any} time 24 time to convert
 */
function toDate(time) {
	var date = createDate();
	return new Date((date.getMonth() + 1) + "/" + (date.getDate()) + "/" + (date.getYear() - 100 + 2000) + " " + time);
}

/**
 * Converts a date object into 24 time
 * @param {any} date date to convert
 */
function toTime(date) {
	var hour = date.getHours();
	var min = date.getMinutes();
	if (min < 10) min = "0" + min;
	return hour + ":" + min;
}

/**
 * Rounds minutes in a date object by factor (ex round to nearest 15 minutes)
 * @param {any} date date to convert on
 * @param {any} fac the factor in minutes (ex 15)
 */
function roundMinutes(date, fac) {
	var fac = 1000 * 60 * fac;
	return new Date(Math.round(date.getTime() / fac) * fac);
}

/**
 * Formats 12 time to special hour format. ex) "10:51 AM" => "10am"
 * @param {any} time 12 time to convert
 */
function hourFormat(time) {
	return (time.substring(0, time.indexOf(':')) + time.substring(time.indexOf(' ') + 1)).toLowerCase();
}

/**
 * Converts a date object into a locale string (24 hour time)
 * @param {any} date
 */
function dateToString(date) {
	//return date.toString();
	return (date.getMonth() + 1) + "/" + (date.getDate()) + "/" + (date.getYear() - 100 + 2000) + ", " + toTime(date) + " (Pacific Daylight Time)";
}

/**
 * Creates a date in the LA time zone
 */
function createDate(date) {
	if (date)
		return new Date(date);
	else
		return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
}

try {
	exports.to24 = to24;
	exports.to12 = to12;
	exports.toDate = toDate;
	exports.toTime = toTime;
	exports.roundMinutes = roundMinutes;
	exports.hourFormat = hourFormat;
	exports.dateToString = dateToString;
	exports.createDate = createDate;
} catch (e) { }