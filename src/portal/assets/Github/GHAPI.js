function getGPD(url) {
	var Gde = {};
	getGAPI(url, function (data) {
		for (var project in data) {
			//Each Project
			Gde[data[project].name] = {};
			getGAPIK(data[project].columns_url, function (data, pro) {
				for (var column in data) {
					//Each Column
					Gde[pro][data[column].name] = {};
					getGAPIK(data[column].cards_url, function (data, col) {
						for (var card in data) {
							//Each Card
							var cardNote = data[card].note;
							var cardId = data[card].id;
							Gde[pro][col][cardId] = { cardNote };
						}
					}, data[column].name);
				}
			}, data[project].name);
		}
	});
	return Gde;
}

function getGAPIK(url, func, keepIY) {
	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			func(data, keepIY);
		},
		error: function () { },
		beforeSend: setHeader
	});

	function setHeader(xhr) {
		xhr.setRequestHeader('Accept', 'application/vnd.github.inertia-preview+json');
		xhr.setRequestHeader('Authorization', 'token 82bf8d77b8dd9212ebc9aab15aff4df4d430afea');
	}
}

function getGAPI(url, func) {
	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			func(data);
		},
		error: function () { },
		beforeSend: setHeader
	});

	function setHeader(xhr) {
		xhr.setRequestHeader('Accept', 'application/vnd.github.inertia-preview+json');
		xhr.setRequestHeader('Authorization', 'token 82bf8d77b8dd9212ebc9aab15aff4df4d430afea');
	}
}