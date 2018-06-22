// TeamsAPI.js


var teams = new class teams {
	getAllTeams() {
		try {
			var ret = {};
			for (var i = 0; i < teamsSnapshot.docs.length; ++i) {
				ret[teamsSnapshot.docs[i].id] = teamsSnapshot.docs[i].data();
			}
			return ret;
		} catch (err) { return undefined; }
	}

	getAllTeamsForAutocomplete() {
		try {
			var ret = {};
			var data;
			for (var i = 0; i < teamsSnapshot.docs.length; ++i) {
				data = teamsSnapshot.docs[i].data();
				data.name = "#" + data.name;
				ret[teamsSnapshot.docs[i].id] = data;
			}
			return ret;
		} catch (err) { return undefined; }
	}

	isTeam(teamName) {
		try {
			return this.getId(teamName) != undefined;
		} catch(err) { return undefined; }
	}

	getData(teamId) {
		try {
			var a = findObjectByKey(teamsSnapshot.docs, "id", teamId);
			return a ? a.data() : undefined;
		} catch (err) { return undefined; }
	}

	getMembers(teamId) {
		try {
			return this.getData(teamId).members;
		} catch (err) { return undefined; }
	}

	getId(teamName) {
		try {
			for (var i = 0; i < teamsSnapshot.docs.length; i++) {
				if (teamsSnapshot.docs[i].data().name == teamName) {
					return teamsSnapshot.docs[i].id;
				}
			}
			return undefined;
		} catch (err) { return undefined; }
	}

	getName(teamId) {
		try {
			return this.getData(teamId).name;
		}
		catch (err) { return; }
	}

	getTeams(member) {
		try {
			var ret = [];
			for (var i = 0; i < teamsSnapshot.docs.length; i++) {
				if (teamsSnapshot.docs[i].data().members.includes(member)) {
					ret.push( teamsSnapshot.docs[i].id );
				}
			}
			return ret;
		} catch (err) { return undefined; }
	}

	memberInTeam(member, teamId) {
		try {
			return this.getMembers(teamId).includes(member);
		} catch (err) { return undefined; }
	}
}
