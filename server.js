const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
app.set('view engine', 'pug');
app.set('views', 'src');
app.use('/images', express.static('src/images'));
app.use('/assets', express.static('src/assets'));

//Pages
var pages = {
	"/": "index",
	"/robots": "robots",
	"/events": "events",
	"/sponsor": "sponsor",
	"/contact": "contact",
	"/calendar": "calendar",
	"/hours": "hours",
	"/hours/view": "view",
	"/hours/meeting": "meeting",
	"/hours/meeting/people": "people"
}; 

//Hosting

app.get(Object.keys(pages), (req, res) => {
	res.render('pages/' + pages[req.url], getMeta(req));
});
app.get('*', (req, res) => {
	res.render('pages/404', getMeta(req));
});

function getMeta(req) {
	return { mobile: req.headers['user-agent'].includes("Mobile") };
}
app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});