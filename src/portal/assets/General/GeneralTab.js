//GeneralTab.js

var GeneralTab = new RegisteredTab("General", null, GeneralInit);

function GeneralInit() {
	GeneralPHI();
}

function GeneralPHI() {
	Helper.API.wait(function () {
		switch (Helper.API.getProgress("General", 0)) {
			case 0:
				Helper.drawing.display("Welcome to the Breakersite. I'm the tutorial bot, and will be introducing you into the website.",
					['50vw', '30vh'], [0.5, 0.5], function () { Helper.API.setProgress("General", 0, 1); GeneralPHI(); });
				break;
			case 1:
				Helper.drawing.display("The website is divided into tabs and this is General Tab. Here you can easily view information about the systems.",
					['50vw', '30vh'], [0.5, 0.5], function () { Helper.API.setProgress("General", 0, 2); GeneralPHI(); });
				break;
			case 2:
				Helper.drawing.display("Above this text is the toolbar were you can view notifications, apps, and your account. Also, some tabs may create a search bar here.",
					['100vw', '64px'], [1, 0], function () { Helper.API.setProgress("General", 0, 3); GeneralPHI(); });
				break;
			case 3:
				PeteSwitcher.set(true);
				Helper.drawing.display("To the left of me is the menu. It is used the navigate the website (change tabs). You can open and close the menu by pressing the three lines in the top left of the screen.",
					['17vw', '64px'], [0, 0], function () { Helper.API.setProgress("General", 0, 4); GeneralPHI(); });
				break;
			case 4:
				Helper.drawing.display("Now try it!",
					['17vw', '64px'], [0, 0], function () { Helper.API.setProgress("General", 0, 5); GeneralPHI(); });
				setTimeout(function () { Helper.API.setProgress("General", 0, 5); GeneralPHI(); }, 1500);
				break;
			default:
				Helper.drawing.close();
				break;
		}
	});
}