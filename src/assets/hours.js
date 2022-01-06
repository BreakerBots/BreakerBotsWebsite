//put password into the query for express to handle
async function signIn(password) {
  window.location.search = "password=" + password;
}

async function postMeeting(startTimeElement, endTimeElement) {
  const startTime = startTimeElement.value;
  const endTime = endTimeElement.value;
  const startDate = new Date((new Date()).toLocaleDateString() + " " + startTime);
  const endDate = new Date((new Date()).toLocaleDateString() + " " + endTime);

  if (!startTimeElement.checkValidity() || !endTimeElement.checkValidity() ||
    startTime.length < 1 || endTime.length < 1) {
    alert("Please enter a valid start and end time.");
    return;
  }

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
    body: JSON.stringify({ startDate, endDate })
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