function signIn(password) {
  window.location.search = "password=" + password;
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