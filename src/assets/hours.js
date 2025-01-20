/* eslint-disable no-unused-vars */

function signIn(password) {
  window.location.search = 'password=' + password;
}

async function postPerson(button, name, signedIn) {
  button.disabled = true;
  const color = signedIn ? '#b01dfa' : '#00af17';
  button.style.backgroundColor = color;
  button.style.borderColor = color;
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
    body: JSON.stringify({ name, signIn: !signedIn }),
  }).then((res) => {
    if (!res.ok) {
      console.error('POST person failed:', res);
    } else {
      const color = signedIn ? '#fab01d' : '#af1700';
      button.style.backgroundColor = color;
      button.style.borderColor = color;
      button.enabled = true;
    }
  });
}
