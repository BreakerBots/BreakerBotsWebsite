'use strict';

const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'breaker-site',
});
var crypto = require('crypto');
const cors = require('cors')({
	origin: true,
});
const Time = require('./assets/js/time.js');

//Create Meeting
exports.createMeeting = (req, res) => {
	try {
		var startDate = Time.toDate(decodeURIComponent(req.query.s));
		var endDate = Time.toDate(decodeURIComponent(req.query.e));

		datastore.get(datastore.key(['meeting', 'meeting']))
			.then(([entity]) => {
				var data = entity;
				data.history.push(Time.dateToString(startDate));
				data.history.push(Time.dateToString(endDate));

				datastore.save(data)
					.then(() => {
						return cors(req, res, () => {
							res.status(200).send("Meeting Created!");
						});
					})
					.catch((e) => {
						console.error(e);
						return cors(req, res, () => {
							res.status(500).send({ error: e.message });
						});
						return Promise.reject(e);
					});
			})
			.catch((e) => {
				console.error(e);
				return cors(req, res, () => {
					res.status(500).send({ error: e.message });
				});
				return Promise.reject(e);
			});
	} catch (e) {
		console.error(e);
		return cors(req, res, () => {
			res.status(500).send({ error: e.message });
		});
	}
}

//Sign In/Out
exports.sign = (req, res) => {
	try {
		var name = decodeURIComponent(req.query.n);
		var endDate = Time.createDate(decodeURIComponent(req.query.ed));
		var signOut = decodeURIComponent(req.query.so) === "true";

		//Get Member ID
		datastore.runQuery(datastore.createQuery('member').filter('name', '=', name))
			.then(results => {
				var data = results[0][0];

				//Signing Out
				if (signOut) {
					//Replace end date with current time
					data.history[data.history.length - 1] = Time.dateToString(Time.roundMinutes(Time.createDate(), 15));
				}

				//Signing In
				else {
					//Add Begin Date
					data.history.push(Time.dateToString(Time.roundMinutes(Time.createDate(), 15)));

					//Add End Date
					data.history.push(endDate);
				}

				//Save Updated History
				datastore.save(data)
					.then(() => {
						return cors(req, res, () => {
							res.status(200).send("Success!");
						});
					})
					.catch((e) => {
						console.error(e);
						return cors(req, res, () => {
							res.status(500).send({ error: e.message });
						});
						return Promise.reject(e);
					});
			})
			.catch((e) => {
				console.error(e);
				return cors(req, res, () => {
					res.status(500).send({ error: e.message });
				});
				return Promise.reject(e);
			});
	} catch (e) {
		console.error(e);
		return cors(req, res, () => {
			res.status(500).send({ error: e.message });
		});
	}
}