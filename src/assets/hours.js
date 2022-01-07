function signIn(password) {
  window.location.search = "password=" + password;
}

async function postMeeting(startTimeElement, endTimeElement) {
  let startTime = startTimeElement.value;
  let endTime = endTimeElement.value;

  if (!startTimeElement.checkValidity() || !endTimeElement.checkValidity() ||
    startTime.length < 1 || endTime.length < 1) {
    alert("Please enter a valid start and end time.");
    return;
  }

  startTime = startTime.split(/:| /);
  endTime = endTime.split(/:| /);
  const startTimeHours = Number(startTime[0]) + (startTime[2] === "PM" ? 12 : 0);
  const startTimeMinutes = Math.round(Number(startTime[1]) / 15) * 15;
  const endTimeHours = Number(endTime[0]) + (endTime[2] === "PM" ? 12 : 0);
  const endTimeMinutes = Math.round(Number(endTime[1]) / 15) * 15;
  // @ts-ignore
  const startDate = dayjs().hour(startTimeHours).minute(startTimeMinutes).second(0).millisecond(0);
  // @ts-ignore
  const endDate = dayjs().hour(endTimeHours).minute(endTimeMinutes).second(0).millisecond(0);

  console.log({ startTime, startTimeHours, startTimeMinutes, endTime, endTimeHours, endTimeMinutes, startDate, endDate });

  const res = await fetch('/hours/meeting', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    //date rounding occurs server-side
    body: JSON.stringify({ startDate: startDate.format(), endDate: endDate.format() })
  });
  const data = await res.json();
  if (data.success) {
    window.location.reload();
  }
  else {
    alert("An error has occured. " + data.error);
  }
}

async function postPerson(name) {
  const res = await fetch('/hours/person', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    //date handling will occur server-side
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (data.success) {
    window.location.reload();
  }
  else {
    alert("An error has occured. " + data.error);
  }
}