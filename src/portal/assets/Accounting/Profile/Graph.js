//Profile Graph
function randomScalingFactor() { return Math.round(Math.random() * 100); }
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var config = {
	type: 'line',
	data: {
		labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
		datasets: [{
			label: '',
			borderColor: 'rgba(0,0,0,0.8)',
			backgroundColor: 'rgba(0,0,0,0.8)',
			data: [
				randomScalingFactor(),
				randomScalingFactor(),
				randomScalingFactor(),
				randomScalingFactor(),
				randomScalingFactor(),
				randomScalingFactor(),
				randomScalingFactor()
			],
		}]
	},
	options: {
		responsive: true,
		tooltips: {
			mode: 'index',
		},
		hover: {
			mode: 'index'
		},
		scales: {
			xAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'Month'
				}
			}],
			yAxes: [{
				stacked: true,
				scaleLabel: {
					display: true,
					labelString: 'Contributions'
				}
			}]
		}
	}
};
window.onload = function () {
	var ctx = document.getElementById('line-chart').getContext('2d');
	window.myLine = new Chart(ctx, config);
};
