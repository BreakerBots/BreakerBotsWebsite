//source: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);                    
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

//hash the submitted password and put it in the query express to handle
async function signIn(password) {
  const hash = await sha256(password); //TODO VULNERABILITY
  window.location.search = "hash=" + hash;
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