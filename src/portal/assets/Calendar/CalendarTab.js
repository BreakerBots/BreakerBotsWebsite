//CalendarTab.js

var CalendarTab = new RegisteredTab("Calendar", loadCalendar);

function loadCalendar() {
	$('#calendar').fullCalendar({
		googleCalendarApiKey: 'AIzaSyCA8Z_Xvhp8FkjK7KedPtVo6XO0Y7FtEtw',
		events: {
			googleCalendarId: 'suiphcuq71fqpntbc2rojdun2g@group.calendar.google.com',
		},
		header: {
			left: 'prev, next, today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		}
	});
}