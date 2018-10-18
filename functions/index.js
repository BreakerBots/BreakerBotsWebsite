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

//Register a Computer
exports.registerComputer = (req, res) => {
	try {
		const pc = 'ywlkA9svAdUULsTmKbxe/cLGtBmOiTY5yOUBjcVmx6I=' == crypto.createHash('sha256').update(req.query.p).digest('base64');

		if (!pc)
			send(403, "Incorrect Password", req, res);
		else {
			var i = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			if (i.indexOf(',') != -1) i = i.substring(0, i.indexOf(','));
			const entity = {
				key: datastore.key(['computer', i]),
				data: { }
			};

			datastore.save(entity)
				.then(() => {
					return cors(req, res, () => {
						res.status(200).send("Computer Registered!");
					});
				})
				.catch((e) => {
					console.error(e);
					return cors(req, res, () => {
						res.status(500).send({ error: e.message });
					});
					return Promise.reject(e);
				});
		}
	} catch (e) {
		console.error(e);
		return cors(req, res, () => {
			res.status(500).send({ error: e.message });
		});
	}
};

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

		datastore.get(datastore.key(['member', name]))
			.then(([entity]) => {
				var data = entity;
				data.history.push(Time.dateToString(Time.roundMinutes(Time.createDate(), 15)));

				datastore.save(data)
					.then(() => {
						return cors(req, res, () => {
							res.status(200).send("Sucess!");
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