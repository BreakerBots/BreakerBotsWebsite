const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
app.set('views', 'src');
app.engine('.html', require('ejs').__express);
app.use('/images', express.static('src/images'));
app.use('/assets', express.static('src/assets'));

//Pages
var pages = {
	"/": "index.html",
	"/robots": "robots.html",
	"/events": "events.html",
	"/sponsor": "sponsor.html",
	"/contact": "contact.html",
	"/calendar": "calendar.html",
	"/hours": "hours/auth.html",
	"/hours/view": "hours/view.html",
	"/hours/meeting": "hours/meeting.html",
	"/hours/meeting/people": "hours/people.html"
}; 

//Hosting

app.get(Object.keys(pages), (req, res) => {
	res.render('pages/' + pages[req.url], getMeta(req));
});
app.get('*', (req, res) => {
	res.render('pages/404.html', getMeta(req));
});

function getMeta(req) {
	return { mobile: req.headers['user-agent'].includes("Mobile") };
}
app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});