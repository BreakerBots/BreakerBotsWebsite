
function drawProjects() {
	getGPD('https://api.github.com/repos/frc5104/Power-Up-2018/projects', function (data) {
		var html = '';
		html += `
				<div class="col-lg-8">
				<div class="card card-contrast">
					<div class="card-header card-header-contrast">Todo</div>
					<div class="card-body">
				`
		for (var pro in data) {
			html += `
						<div class="card card-contrast">
							<div class="card-header card-header-contrast">` + pro + `</div>
								<div class="card-body">
				`;
			for (var col in data[pro]) {
				html += `
									<div class="card card-contrast">
										<div class="card-header card-header-contrast">` + col + `</div>
										<div class="card-body">
											`;
				for (var note in data[pro][col]) {
					html += `<p>` + (data[pro][col][note].cardNote) + `</p>`;
				}									
				html += `
										</div>
									</div>
						`;
			}
			html += `
							</div>
						</div>
					`;
		}
		html += `
					</div>
				</div>
				</div>
				`
		document.querySelector("#GithubRows").innerHTML += html;
	});
} //drawProjects();

function drawCommits() {
	getGAPINA('https://api.github.com/repos/frc5104/Power-Up-2018/commits', function (data) {
		var html = '';
		//console.log(data);
		html += `
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th style="width:37%;">User</th>
						<th style="width:36%;">Commit</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>`;

			for (var commitTP in data) {
				html += `
					<tr>
						<td class="user-avatar"> <img src="` + (data[commitTP].author == null ? "https://camo.githubusercontent.com/4755a1106f405e2812bc23e5fbfc6adbecdd4823/68747470733a2f2f302e67726176617461722e636f6d2f6176617461722f34366634326138663238616662656137633036306132333062613530666133313f643d68747470732533412532462532466173736574732d63646e2e6769746875622e636f6d253246696d6167657325324667726176617461727325324667726176617461722d757365722d3432302e706e6726723d6726733d3430" : data[commitTP].author.avatar_url) + `" alt="Avatar">` + (data[commitTP].author == null ? data[commitTP].commit.author.name : data[commitTP].author.login) + `</td>
						<td>` + data[commitTP].commit.message + `</td>
						<td>` + data[commitTP].commit.author.date + `</td>
					</tr>`;
				//console.log(data[commitTP].author == null ? data[commitTP].commit.author.name : data[commitTP].author.login);
			}

		html += `
				</tbody>
			</table>
		</div>`;

		document.querySelector("#GithubRecentCommitsWrapper").innerHTML += html;
	});
} //drawCommits();

`
<table class="table table-striped table-hover">
    <thead>
        <tr>
			<th style="width:37%;">User</th>
			<th style="width:36%;">Commit</th>
			<th>Date</th>
			<th class="actions"></th>
        </tr>
    </thead>
    <tbody>
        <tr>
			<td class="user-avatar"> <img src="assets/img/avatar6.png" alt="Avatar">Penelope Thornton</td>
			<td>Initial commit</td>
			<td>Aug 6, 2015</td>
			<td class="actions"><a href="#" class="icon"><i class="mdi mdi-delete"></i></a></td>
        </tr>
        <tr>
			<td class="user-avatar"> <img src="assets/img/avatar4.png" alt="Avatar">Benji Harper</td>
			<td>Main structure markup</td>
			<td>Jul 28, 2015</td>
			<td class="actions"><a href="#" class="icon"><i class="mdi mdi-delete"></i></a></td>
        </tr>
        <tr>
			<td class="user-avatar"> <img src="assets/img/avatar5.png" alt="Avatar">Justine Myranda</td>
			<td>Left sidebar adjusments</td>
			<td>Jul 15, 2015</td>
			<td class="actions"><a href="#" class="icon"><i class="mdi mdi-delete"></i></a></td>
			</tr>
        <tr>
			<td class="user-avatar"> <img src="assets/img/avatar3.png" alt="Avatar">Sherwood Clifford</td>
			<td>Topbar dropdown style</td>
			<td>Jun 30, 2015</td>
			<td class="actions"><a href="#" class="icon"><i class="mdi mdi-delete"></i></a></td>
			</tr>
    </tbody>
</table>
`