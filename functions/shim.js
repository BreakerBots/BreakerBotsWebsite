//const httpShim = () => {
const gcfCode = require('./index.js');
const express = require('express');

const app = express();
const server = require(`http`).createServer(app);
server.on('connection', socket => socket.unref());
server.listen(3000);

console.log("hosting at localhost:3000");

Object.keys(gcfCode).forEach(gcfFn => {
	const handler = (req, res) => {
		gcfCode[gcfFn](req, res);
		server.close();
	};

	app.get(`/${gcfFn}`, handler);
	app.post(`/${gcfFn}`, handler);
});
//};