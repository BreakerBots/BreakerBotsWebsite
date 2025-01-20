/* eslint-disable no-unused-vars */

function signIn(password) {
  window.location.search = 'password=' + password;
}

async function postPerson(button, name) {
  button.disabled = true;
  button.classList.toggle('btn-primary');
  button.classList.toggle('btn-secondary');
  const signedIn = button.textContent === ' Sign Out ';
  button.style.color = signedIn ? '#fff' : '#212529';
  const color = signedIn ? '#00af17' : '#b01dfa';
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
      button.style.backgroundColor = '#000';
      button.style.borderColor = '#000';
      button.style.color = '#fff';
      button.textContent = ' Error ';
    } else {
      const color = signedIn ? '#af1700' : '#fab01d';
      button.style.backgroundColor = color;
      button.style.borderColor = color;
      button.textContent = signedIn ? ' Sign In ' : ' Sign Out ';
      button.disabled = false;
    }
  });
}
