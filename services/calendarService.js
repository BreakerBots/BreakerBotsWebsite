import { calendar as Calendar } from '@googleapis/calendar';
import dayjs from 'dayjs';

import { CALENDAR_ID, IS_RUNNING_ON_GOOGLE } from '../config/constants.js';
import { getCalendarAuthToken } from './datastoreService.js';

const calendar = Calendar({
  version: 'v3',
  auth: IS_RUNNING_ON_GOOGLE
    ? await getCalendarAuthToken()
    : process.env.API_KEY,
});

/**
 * Retrieves a list of meetings from the calendar within a two-week window
 * ending at the start of the current week.
 *
 * The function queries the calendar API for events, within the specified
 * time range, converts them to a standard meeting format, and filters
 * them based on predefined meeting types such as 'council meeting',
 * 'team meeting', 'pre kickoff meeting', and 'kickoff'.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of meetings
 * in the specified format with title, start, and end times.
 */
export async function getMeetingsLastTwoWeeks() {
  const end = dayjs().startOf('week');
  const start = end.subtract(2, 'weeks');
  return getEventsFromCalendar(CALENDAR_ID, start, end).then(
    getMeetingsFromEvents
  );
}

/**
 * Retrieves a list of meetings from the calendar for today.
 *
 * The function queries the calendar API for events that are in progress
 * today, converts them to a standard meeting format, and filters them based
 * on predefined meeting types such as 'council meeting', 'team meeting',
 * 'pre kickoff meeting', and 'kickoff'.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of meetings
 * in the specified format with title, start, and end times.
 */
export async function getMeetingsToday() {
  const today = dayjs().startOf('day');
  const tomorrow = dayjs().add(1, 'day');
  return getEventsFromCalendar(CALENDAR_ID, today, tomorrow).then(
    getMeetingsFromEvents
  );
}

async function getEventsFromCalendar(calendarId, timeMin, timeMax) {
  return calendar.events.list({
    calendarId,
    maxResults: 2500,
    orderBy: 'startTime',
    showDeleted: false,
    singleEvents: true,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  });
}

function getMeetingsFromEvents(events) {
  return events?.data?.items
    ?.filter((event) => {
      // Regex to match events corresponding to required meetings
      //const re = /council meeting|team meeting|pre kickoff meeting|kickoff/i;
      const re = /team meeting|pre kickoff meeting|kickoff/i;
      return RegExp(re).exec(event.start?.dateTime ? event.summary ?? '' : '');
    })
    .map((event) => {
      // Convert meeting title to Title Case
      // e.g. "team meeting" -> "Team Meeting"
      const title = (event.summary ?? '').replace(/\b\w/g, (match) =>
        match.toUpperCase()
      );
      return {
        title,
        start: dayjs(event.start?.dateTime),
        end: dayjs(event.end?.dateTime),
      };
    });
}
