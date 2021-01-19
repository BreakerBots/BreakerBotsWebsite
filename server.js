const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
app.set('view engine', 'pug');
app.set('views', 'src');
app.use('/images', express.static('src/images'));

//Pages
var pages = {
	"/": "index",
	"/robots": "robots",
	"/events": "events",
	"/sponsor": "sponsor",
	"/contact": "contact",
	"/calendar": "calendar"
};

//Hosting
app.get(Object.keys(pages), (req, res) => {
	res.render('pages/' + pages[req.url], getMeta(req));
});
if (port === 8080) {
	var config = require('./webpack.config.js')[0];
	config.mode = 'development';
	app.use('/dist', require('webpack-dev-middleware')(require('webpack')(config)));
}
else {
	app.use('/dist', express.static('dist/'));
}
app.get('*', (req, res) => {
	res.render('pages/404', getMeta(req));
});
function getMeta(req) {
	return { mobile: req.headers['user-agent'].includes("Mobile") };
}
app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});