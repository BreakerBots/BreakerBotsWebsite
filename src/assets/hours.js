/* eslint-disable no-unused-vars */

function signIn(password) {
  window.location.search = 'password=' + password;
}

async function postPerson(button, name) {
  button.disabled = true;
  const signedIn = button.textContent === ' Sign Out ';
  const color = signedIn ? '#b01dfa' : '#00af17';
  button.style.backgroundColor = color;
  button.style.borderColor = color;
  button.textContent = '...';
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
      const color = signedIn ? '#af1700' : '#fab01d';
      button.style.backgroundColor = color;
      button.style.borderColor = color;
      button.style.color = signedIn ? '#fff' : '#212529';
      button.textContent = signedIn ? ' Sign In ' : ' Sign Out ';
      button.disabled = false;
    }
  });
}
