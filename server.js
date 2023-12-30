const express = require('express');
const app = express();
const compression = require('compression');
const port = process.env.PORT || 5104;
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cookieSecret = crypto.createHash('sha256').update('51O4').digest('hex');
const isRunningOnGoogle = !!process.env.GOOGLE_CLOUD_PROJECT;
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const secretClient = new SecretManagerServiceClient();
const Datastore = require('@google-cloud/datastore').Datastore;
const datastore = isRunningOnGoogle ? new Datastore() : new Datastore({
  projectId: 'breakerbots-website',
  keyFilename: './datastore.json'
});
const hoursPasswordHash = '9fb9297d179a9e2341c9562f94e88b76d6a3c45fdb3a0cbaca832a22aa99b7b2';
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.tz.setDefault("America/Los_Angeles");

//Express Config
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
  "/hours/people": ["hours/people.html", getPeopleInjection],
  "/thankyou": ["thankyou.html"],
  "/dashboard": ["dashboard.html"]
  // "/breakerlib": ["breakerlib.html"],
  // "/weeklyupdates": ["weeklyupdates.html"],
  // "/joinus": ["joinus.html"]
};

//Hours Auth Middleware
app.use('/hours**', cookieParser(cookieSecret), (req, res, next) => {
  //first time auth with query
  if (Object.keys(req.query).length > 0 && req.query.password) {
    // @ts-ignore
    if (crypto.createHash('sha256').update(req.query.password).digest('hex') === hoursPasswordHash) {
      //save password in signed cookie
      res.cookie('password', req.query.password, {
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
  else if (req.signedCookies && req.signedCookies.password &&
    crypto.createHash('sha256').update(req.signedCookies.password).digest('hex') === hoursPasswordHash) {
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
    res.clearCookie('password', {
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
function roundToNearest15Minutes(date) {
  return date.minute(Math.round(date.minute()  / 15) * 15).second(0).millisecond(0);
}
async function inMeeting() {
  const taskKey = datastore.key(['person', 'Meeting']);
  const [entity] = await datastore.get(taskKey);
  const history = entity.history;

  if (history.length > 1) {
    const startOfLastMeetingDate = dayjs.tz(dayjs(history[history.length - 2]));
    const endOfLastMeetingDate = dayjs.tz(dayjs(history[history.length - 1]));
    const currentDate = dayjs.tz(roundToNearest15Minutes(dayjs()));

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
      for (let i = 0; i < history.length - 1; i += 2) {
        if (history[i] !== null && history[i + 1] !== null) {
          const startDate = dayjs.tz(dayjs(history[i]));
          const endDate = dayjs.tz(dayjs(history[i + 1]));
          const diffMs = endDate.valueOf() - startDate.valueOf();
          if (diffMs > 24 * 3600000) {
            console.log(name, "potential error @", i, i + 1);
          }
          totalMs += diffMs;
        }
      }
      const hours = totalMs / 3600000;
      
      if (name === "Meeting") {
        //meeting object
        const startOfLastMeetingDate = dayjs.tz(dayjs(history[history.length - 2]));
        const endOfLastMeetingDate = dayjs.tz(dayjs(history[history.length - 1]));
        meeting = { name, hours, 
          title: startOfLastMeetingDate.format('h:mm A') + ' - ' + endOfLastMeetingDate.format('h:mm A') };
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

        //get last meeting info
        const taskKey = datastore.key(['person', 'Meeting']);
        const [meetingEntity] = await datastore.get(taskKey);
        const endOfLastMeetingDate = dayjs.tz(dayjs(meetingEntity.history[meetingEntity.history - 1]));
        const startOfLastMeetingDate = dayjs.tz(dayjs(meetingEntity.history[meetingEntity.history - 2]));
        const startOfPersonShift = dayjs.tz(dayjs(entity.history[entity.history - 2]));
        const currentDate = dayjs.tz(dayjs());


        console.log("CurDate: " + currentDate.unix());
        console.log("endLM: " + endOfLastMeetingDate.unix());
        console.log("startLM: " + startOfLastMeetingDate.unix());
        console.log("startPS: " + startOfPersonShift.unix());
        if (((currentDate.unix - endOfLastMeetingDate.unix) < 15*60) && (startOfLastMeetingDate.unix <= startOfPersonShift.unix)) {
          entity.history[entity.history.length - 1] = dayjs.tz(roundToNearest15Minutes(dayjs())).format();
        } else {
          entity.history[entity.history.length - 1] = entity.history[entity.history.length - 2];
        }
        
      }
      else {
        console.log(req.body.name, "signed in");
        //else signing in
        entity.history.push(dayjs.tz(roundToNearest15Minutes(dayjs())).format());
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
    const startDate = roundToNearest15Minutes(dayjs(req.body.startDate));
    const endDate = roundToNearest15Minutes(dayjs(req.body.endDate));

    if (startDate.isValid() && endDate.isValid() && startDate < endDate) {
      const taskKey = datastore.key(['person', 'Meeting']);
      const [entity] = await datastore.get(taskKey);

      entity.history.push(startDate.format());
      entity.history.push(endDate.format());

      console.log("created new meeting from ", startDate.format("h:m A"), " to ", endDate.format("h:m A"));
  
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
  injection.date = dayjs.tz(dayjs()).format("M/D/YYYY");
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