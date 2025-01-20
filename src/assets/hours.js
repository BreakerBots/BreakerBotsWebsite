/* eslint-disable no-unused-vars */

function signIn(password) {
  window.location.search = 'password=' + password;
}

async function postPerson(name, signedIn) {
  fetch('/hours/person', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    //date handling will occur server-side
    body: JSON.stringify({ name, signIn: !signedIn }),
  }).then((res) => {
    const data = res.json();
    if (!data.success) {
      alert('An error has occured. ' + data.error);
    }
  });
  window.location.reload();
}
