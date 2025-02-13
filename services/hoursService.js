import dayjs from 'dayjs';

import { getPeople, updatePerson } from './datastoreService.js';
import {
  getMeetingsToday,
  getMeetingsLastTwoWeeks,
} from './calendarService.js';

export async function postPerson(req, res) {
  // Check if name is provided
  if (!req.body?.name) {
    res.status(400).json({ success: false, error: 'Missing name' });
    return;
  }

  // Get all person entities from Datastore
  let people;
  try {
    people = await getPeople();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
    return;
  }

  // Check if name is one of the keys in people
  const name = req.body.name;
  if (!Object.keys(people).includes(name)) {
    res.status(400).json({ success: false, error: 'Invalid name' });
    return;
  }

  // Update the person entity for sign in/out
  const person = people[name];
  if (
    person.history.length > 0 &&
    person.history[person.history.length - 1] === null
  ) {
    // If person is signed in, then sign out
    const outTime = dayjs().tz();
    console.log(
      req.body.name,
      'signing out at',
      outTime.format('ddd, MMM D h:mm A')
    );
    person.history[person.history.length - 1] = outTime.format();
  } else {
    // If person is signed out, then sign in
    const inTime = dayjs().tz();
    console.log(
      req.body.name,
      'signing in at',
      inTime.format('ddd, MMM D h:mm A')
    );
    person.history.push(inTime.format());
    person.history.push(null);
  }

  // Write the update to Datastore
  try {
    await updatePerson(name, person);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
    return;
  }

  res.status(200).json({ success: true });
}

export async function getHoursInjection() {
  let people, meetings;
  try {
    [people, meetings] = await Promise.all([
      getPeople(),
      getMeetingsLastTwoWeeks(),
    ]);
  } catch (err) {
    console.error(err);
    return {
      people: [],
      window: {
        start: dayjs().tz().startOf('week').subtract(2, 'week'),
        end: dayjs().tz().startOf('week').subtract(1, 'day'),
        hours: -1,
      },
    };
  }

  // Between 2025-02-14 and 2025-02-23, clamp meeting hours to 15:40-18:00.
  meetings = meetings.map((meeting) => {
    if (
      meeting.start.isAfter('2025-02-14') &&
      meeting.start.isBefore('2025-02-23')
    ) {
      meeting.start = meeting.start.hour(15).minute(40);
      meeting.end = meeting.end.hour(18).minute(0);
    }
    return meeting;
  });

  // Calculate total possible hours for all meetings in the 2 week window.
  let totalMinutes = 0;
  for (const { start, end } of meetings) {
    totalMinutes += end.diff(start, 'minutes');
  }
  let totalHours = totalMinutes / 60;

  // Convert person entities from Datastore format to display format
  const displayPeople = Object.entries(people).map(([name, person]) => {
    let minutes = 0;
    const history = validSignInOutHistory(name, person.history);
    outer: for (const [signIn, signOut] of history) {
      // TODO: make this more efficient with two pointer approach
      // TODO: make this more efficient with binary search?
      // TODO: council meetings only required for leads
      for (const { start, end } of meetings) {
        // Skip sign in/out events that predate the meeting
        if (signOut.isBefore(start)) {
          continue outer;
        }
        // Go to the next meeting if the sign in is after the meeting
        if (signIn.isAfter(end)) {
          continue;
        }
        // Here, we know the sign in/out overlaps with the meeting, so calculate the intersection and add its duration to the person's hours
        const intersection = [
          dayjs.max(signIn, start),
          dayjs.min(signOut, end),
        ];
        minutes += intersection[1].diff(intersection[0], 'minutes');
      }
    }
    // TODO: add extra hours
    const hours = Math.min(totalHours, Math.ceil(minutes / 60));
    return {
      name,
      hours,
    };
  });

  return {
    people: displayPeople,
    window: {
      start: dayjs().tz().startOf('week').subtract(2, 'week'),
      end: dayjs().tz().startOf('week').subtract(1, 'day'),
      hours: totalHours,
    },
  };
}

export async function getPeopleInjection() {
  // Get all person entities from Datastore and meeting from Calendar
  let people, meetings;
  try {
    [people, meetings] = await Promise.all([getPeople(), getMeetingsToday()]);
  } catch (err) {
    console.error(err);
    return {
      people: [],
      meeting: { title: 'Error', start: undefined, end: undefined },
    };
  }

  // Get the ongoing or next upcoming meeting today
  const meeting =
    meetings.find((meeting) => meeting.end.isAfter(dayjs().tz())) ||
    meetings.reverse().find((meeting) => meeting.start.isBefore(dayjs().tz()));

  // Convert person entities from Datastore format to display format
  const displayPeople = Object.entries(people).map(([name, person]) => ({
    name,
    signedIn:
      person.history.length > 0 &&
      person.history[person.history.length - 1] === null,
  }));

  const displayMeeting = { ...meeting };
  if (!displayMeeting.title) {
    displayMeeting.title = 'No Meeting Today';
  }
  if (!displayMeeting.start) {
    displayMeeting.start = undefined;
  } else {
    displayMeeting.start = meeting.start.format('ddd, MMM D h:mm A');
  }
  if (!displayMeeting.end) {
    displayMeeting.end = undefined;
  } else {
    displayMeeting.end = meeting.end.format(
      meeting.start.isSame(meeting.end, 'day') ? 'h:mm A' : 'ddd, MMM D h:mm A'
    );
  }

  return { people: displayPeople, meeting: displayMeeting };
}

function* validSignInOutHistory(name, history) {
  for (let i = 0; i < history.length - 1; i += 2) {
    // Discard current sign in event without a sign out event
    if (history[i + 1] === null) {
      return;
    }

    // Discard signed in overnight (sign out is on a different day from sign in)
    const signIn = dayjs(history[i]).tz();
    const signOut = dayjs(history[i + 1]).tz();
    if (!signIn.isSame(signOut, 'day')) {
      console.log(
        name,
        'was signed in overnight from',
        signIn.format('ddd, MMM D h:mm A'),
        'to',
        signOut.format('ddd, MMM D h:mm A')
      );
      continue;
    }

    yield [signIn, signOut];
  }
}
