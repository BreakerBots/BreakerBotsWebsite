const express = require('express');
const app = express();
const compression = require('compression');
const port = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cookieSecret = crypto.createHash('sha256').update('51O4').digest('hex');
const savedHash = '9fb9297d179a9e2341c9562f94e88b76d6a3c45fdb3a0cbaca832a22aa99b7b2';
const Datastore = require('@google-cloud/datastore').Datastore;
const datastore = this.datastore = new Datastore({
  projectId: 'breaker-site',
  keyFilename: './keys/datastore.json'
});

app.set('view engine', 'html');
app.set('views', 'src');
// @ts-ignore
app.engine('.html', require('ejs').__express);
app.use(compression());
app.disable('x-powered-by');
app.use(express.json());
app.use('/images', express.static('src/images'));
app.use('/assets', express.static('src/assets'));

//Pages
var pages = {
  "/": ["index.html"],
  "/robots": ["robots.html"],
  "/events": ["events.html"],
  "/sponsor": ["sponsor.html"],
  "/contact": ["contact.html"],
  "/calendar": ["calendar.html"],
  "/hours": ["hours/auth.html"],
  "/hours/home": ["hours/home.html", getPeopleInjection],
  "/hours/people": ["hours/people.html", getPeopleInjection]
};

//Hours Auth Middleware
app.use('/hours**', cookieParser(cookieSecret), (req, res, next) => {
  //first time auth with query
  if (Object.keys(req.query).length > 0) {
    if (req.query.hash && req.query.hash === savedHash) {
      //save hash in cookie
      res.cookie('hash', req.query.hash, {
        signed: true
      });

      //go home timmy
      res.redirect('/hours/home');
    } else {
      //clear invalid query
      res.redirect('/hours');
    }
  }

  //cashed auth with cookie
  else if (req?.signedCookies?.hash === savedHash) {
    if (req.baseUrl === '/hours') {
      //go home timmy
      res.redirect('/hours/home');
    } else {
      //let the king pass
      next();
    }
  }

  //invalid auth
  else {
    //remove invalid cookie
    res.clearCookie('hash', {
      signed: true
    });

    if (req.baseUrl === '/hours') {
      //let the peasant pass
      next();
    } else {
      //send to get auth
      res.redirect('/hours');
    }
  }
});

//Hours Date Functions
function isValidDate(date) {
  return !isNaN(date.getTime());
}
function roundDateTo15Min(date) {
  if (isValidDate) {
    date.setMilliseconds(Math.round(date.getMilliseconds() / 1000) * 1000);
    date.setSeconds(Math.round(date.getSeconds() / 60) * 60);
    date.setMinutes(Math.round(date.getMinutes() / 15) * 15);
  }
  return date;
}
function toLocaleTimeStringSimple(date) {
  const str = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  return str.charAt(0) == 0 ? str.slice(1) : str;
}

//Hours Redirected
app.use('/hours/home', async (req, res, next) => {
  if (await inMeeting()) {
    //meeting is happening --> redirect
    res.redirect('/hours/people');
  }
  else {
    next();
  }
});
app.use('/hours/people', async (req, res, next) => {
  if (await inMeeting()) {
    next();
  }
  else {
    //meeting is over --> redirect
    res.redirect('/hours/home');
  }
});
async function inMeeting() {
  const taskKey = datastore.key(['person', 'Meeting']);
  const [entity] = await datastore.get(taskKey);
  const history = entity.history;

  if (history.length > 1) {
    const startOfLastMeetingDate = new Date(history[history.length - 2]);
    const endOfLastMeetingDate = new Date(history[history.length - 1]);
    const currentDate = roundDateTo15Min(new Date());
    return currentDate >= startOfLastMeetingDate && currentDate <= endOfLastMeetingDate;
  }
  else {
    return false;
  }
}

//Hours People Injection
async function getPeopleInjection() {
  try {
    // const query = datastore.createQuery('person').select('__key__');
    // const result = (await datastore.runQuery(query))[0];
    const query = datastore.createQuery('person');
    const [result] = await datastore.runQuery(query);

    const people = [];
    let meeting;

    //convert list of object array with name + history into name + hours
    for (const person of result) {
      const history = person.history;
      const name = person[datastore.KEY].name;

      //calculate hours
      let totalMs = 0;
      for (let i = 0; i < history.length - 2; i++) {
        const startDate = new Date(history[i]);
        const endDate = new Date(history[i + 1]);
        const diffMs = endDate.getTime() - startDate.getTime();
        if (diffMs > 24 * 3600000) {
          console.log(name, "potential error @", i, i + 1);
        }
        totalMs += diffMs;
      }
      const hours = totalMs / 3600000;
      
      if (name === "Meeting") {
        //meeting object
        const startOfLastMeetingDate = new Date(history[history.length - 2]);
        const endOfLastMeetingDate = new Date(history[history.length - 1]);
        const startOfLastMeetingTime = toLocaleTimeStringSimple(startOfLastMeetingDate);
        const endOfLastMeetingTime = toLocaleTimeStringSimple(endOfLastMeetingDate);
        meeting = { name, hours, title: startOfLastMeetingTime + ' - ' + endOfLastMeetingTime };
      }
      else {
        //person object
        people.push({ name, hours, signedIn: history.length > 0 && history[history.length - 1] === null });
      }
    }

    return { people, meeting };
  }
  catch (err) {
    console.error(err);
    return { people: [], meeting: { name: "error", hours: -1 } };
  }
}

//Hours Post Requests
app.post('/hours/person', async (req, res) => {
  try {
    if (req.body.name) {
      const taskKey = datastore.key(['person', req.body.name]);
      const [entity] = await datastore.get(taskKey);
  
      //if signed in
      if (entity.history.length > 0 && entity.history[entity.history.length - 1] === null) {
        console.log(req.body.name, "signed out");
        //then signing out
        entity.history[entity.history.length - 1] = roundDateTo15Min(new Date());
      }
      else {
        console.log(req.body.name, "signed in");
        //else signing in
        entity.history.push(roundDateTo15Min(new Date()));
        entity.history.push(null);
      }
  
      await datastore.update({ key: taskKey, data: entity });
  
      res.status(200).json({ success: true });
      return;
    }
    else {
      res.status(400).json({ success: false, error: "missing name" });
      return;
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
});
app.post('/hours/meeting', async (req, res) => {
  try {
    const startDate = roundDateTo15Min(new Date(req.body.startDate));
    const endDate = roundDateTo15Min(new Date(req.body.endDate));

    if (isValidDate(startDate) && isValidDate(endDate) && startDate < endDate) {
      const taskKey = datastore.key(['person', 'Meeting']);
      const [entity] = await datastore.get(taskKey);

      entity.history.push(startDate);
      entity.history.push(endDate);

      console.log("created new meeting from ", toLocaleTimeStringSimple(startDate), " to ", toLocaleTimeStringSimple(endDate));
  
      await datastore.update({ key: taskKey, data: entity });
  
      res.status(200).json({ success: true });;
      return;
    }
    else {
      res.status(400).json({ success: false, error: "invalid dates" });
      return;
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
});


//Serve Page
app.get(Object.keys(pages), async (req, res) => {
  const page = pages[req.path];
  const injection = page[1] ? await page[1]() : {};
  res.render('pages/' + page[0], injection);
});
app.get('/_ah/warmup', (req, res) => {
  res.json({ok: true});
});
app.get('*', (req, res) => {
  res.render('pages/404.html');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});