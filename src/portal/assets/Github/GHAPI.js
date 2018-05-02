function getGPD(url, func) {
	var Gde = {};
	var PDD = false;
	getGAPI(url, function (data) {
		var prosL = Object.keys(data).length;
		var prosI = 0;
		for (var project in data) {
			//Each Project
			Gde[data[project].name] = {};
			getGAPIK(data[project].columns_url, function (data, proD) {
				var colsL = Object.keys(data).length;
				var colsI = 0;
				for (var column in data) {
					//Each Column
					Gde[proD.pro][data[column].name] = {};
					getGAPIK(data[column].cards_url, function (data, colD) {
						for (var card in data) {
							//Each Card
							var cardNote = data[card].note;
							var cardId = data[card].id;
							Gde[colD.pro][colD.col][cardId] = { cardNote };
							//console.log(colD.pro + "/" + colD.col + "/" + cardId + "/" + cardNote);
						}
						if ((colD.prosI == (colD.prosL-1)) && (colD.colsI == (colD.colsL-1))) {
							//if (PDD) {
								func(Gde);
							//}
							//PDD = true;
						}
					}, { col: data[column].name, colsL: colsL, colsI, colsI, pro: proD.pro, prosL: proD.prosL, prosI: proD.prosI });
					colsI++;
				}
			}, { pro: data[project].name, prosL: prosL, prosI: prosI });
			prosI++;
		}
	});
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
		beforeSend: setGHHeader
	});
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
		beforeSend: setGHHeader
	});
}

function getGAPINA(url, func) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = () => {
		func(JSON.parse(request.responseText));		
	};
	
	request.send();
}

function setGHHeader(xhr) {
	xhr.setRequestHeader('Accept', 'application/vnd.github.inertia-preview+json');
	xhr.setRequestHeader('Authorization', 'token f29ec838673639aa53c5faa39cc8d0615a18be29');
}