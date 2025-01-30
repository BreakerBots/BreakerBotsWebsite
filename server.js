import express from 'express';
import ejs from 'ejs';
import compression from 'compression';

import { PORT } from './config/constants.js';

import dayjs from 'dayjs';
import minMaxPlugin from 'dayjs/plugin/minMax.js';
import timezonePlugin from 'dayjs/plugin/timezone.js';
import utcPlugin from 'dayjs/plugin/utc.js';
import hoursAuthMiddleware from './middleware/auth.js';

import {
  getHoursInjection,
  getPeopleInjection,
  postPerson,
} from './services/hoursService.js';
import { getHoursXlsx } from './services/xlsxService.js';

dayjs.extend(minMaxPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(utcPlugin);
dayjs.tz.setDefault('America/Los_Angeles');

//Express Config
const app = express();
app.set('view engine', 'html');
app.set('views', 'src');
app.engine('.html', ejs.renderFile);
app.use(compression());
app.disable('x-powered-by');
app.use(express.json());
app.use('/images', express.static('src/images'));
app.use('/assets', express.static('src/assets'));

//Pages
const pages = {
  '/': ['index.html'],
  '/robots': ['robots.html'],
  '/events': ['events.html'],
  '/sponsor': ['sponsor.html'],
  '/contact': ['contact.html'],
  '/calendar': ['calendar.html'],
  '/hours': ['hours/auth.html'],
  '/hours/home': ['hours/home.html', getHoursInjection],
  '/hours/people': ['hours/people.html', getPeopleInjection],
  '/thankyou': ['thankyou.html'],
  '/dashboard': ['dashboard2.html'],
  //'/store': ['store.html'],
  // '/breakerlib': ['breakerlib.html'],
  '/weeklyupdates': ['weeklyupdates.html'],
  // '/joinus': ['joinus.html']
};

//Hours Auth Middleware
app.use('/hours**', hoursAuthMiddleware);

app.get('/hours/download', async (req, res) => {
  try {
    const { filename, buffer } = await getHoursXlsx();
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });
    res.end(Buffer.from(buffer, 'binary'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
});

//Hours Post Requests
app.post('/hours/person', postPerson);

//Serve Page
app.get(Object.keys(pages), async (req, res) => {
  const page = pages[req.path];
  if (!page) {
    return res.render('pages/404.html');
  }
  const injection = page[1] ? await page[1]() : {};
  injection.date = dayjs().tz().format('M/D/YYYY');
  res.render('pages/' + page[0], injection);
});

//
app.get('/_ah/warmup', (req, res) => {
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  res.render('pages/404.html');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
