/* eslint-disable no-unused-vars */

async function postPerson(button, name) {
  button.disabled = true;
  const signedIn = button.classList.contains('btn-secondary');
  button.classList.toggle('btn-primary');
  button.classList.toggle('btn-secondary');
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
      button.removeAttribute('style');
      button.textContent = signedIn ? ' Sign In ' : ' Sign Out ';
      button.disabled = false;
    }
  });
}

function idleTimer() {
  var t;
  window.onload = resetTimer;
  window.onmousemove = resetTimer; // catches mouse movements
  window.onmousedown = resetTimer; // catches mouse movements
  window.onclick = resetTimer; // catches mouse clicks
  window.onscroll = resetTimer; // catches scrolling
  window.onkeypress = resetTimer; //catches keyboard actions

  function reload() {
    window.location = self.location.href; //Reloads the current page
  }

  function resetTimer() {
    clearTimeout(t);
    t = setTimeout(reload, 800000); // time is in milliseconds (1000 is 1 second)
  }
}
idleTimer();
