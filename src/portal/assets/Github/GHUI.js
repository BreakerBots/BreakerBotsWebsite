

function drawProjects() {
	var GPD = getGPD('https://api.github.com/repos/frc5104/Power-Up-2018/projects');
	var html6 = '';
	console.log(GPD);
	for (var p12 in GPD) {
		html6 += `
				<div class="row">
					<div class="col-lg-8">
						<div class="card card-contrast">
							<div class="card-header card-header-contrast">` + GPD[p12] + `</div>
							<div class="card-body">
				`;
		html6 += `</div></div></div></div></div>`;
	}
	document.querySelector("#Github").innerHTML = html6;
} drawProjects();



`
<div class="row">
	<div class="col-lg-8">
		<div class="card card-contrast">
			<div class="card-header card-header-contrast">Heading contrast<span class="card-subtitle">Panel subtitle description</span></div>
			<div class="card-body">
				<div class="card card-contrast">
					<div class="card-header card-header-contrast">Todo</div>
					<div class="card-body">
						<p> Quisque gravida aliquam diam at cursus, quisque laoreet ac lectus a rhoncusac tempus odio. </p>
						<p>Aliquam posuere volutpat turpis, ut euimod diam pellentesque at. Sed sit amet nulla a dui dignisim euismod. Morbi luctus elementum dictum. Donec convallis mattis elit id varius. Quisque facilisis sapien quis mauris, erat condimentum.</p>
					</div>
				</div>
				<div class="card card-contrast">
					<div class="card-header card-header-contrast">In Progress</div>
					<div class="card-body">
						<p> Quisque gravida aliquam diam at cursus, quisque laoreet ac lectus a rhoncusac tempus odio. </p>
						<p>Aliquam posuere volutpat turpis, ut euimod diam pellentesque at. Sed sit amet nulla a dui dignisim euismod. Morbi luctus elementum dictum. Donec convallis mattis elit id varius. Quisque facilisis sapien quis mauris, erat condimentum.</p>
					</div>
				</div>
				<div class="card card-contrast">
					<div class="card-header card-header-contrast">Done</div>
					<div class="card-body">
						<p> Quisque gravida aliquam diam at cursus, quisque laoreet ac lectus a rhoncusac tempus odio. </p>
						<p>Aliquam posuere volutpat turpis, ut euimod diam pellentesque at. Sed sit amet nulla a dui dignisim euismod. Morbi luctus elementum dictum. Donec convallis mattis elit id varius. Quisque facilisis sapien quis mauris, erat condimentum.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
`