const { nativeImage, screen, Menu, Tray } = require("electron");
const path = require("path");
const { isWin32 } = require("./lib");

function move(b) {
	const { width, height } = this;
	const size = screen.getPrimaryDisplay().size;

	var x = b.x;
	var y = b.y;

	if (isWin32()) {
		y = size.height - height - b.height;
	}

	if (x - width / 2 < 0) {
		x = 0;
		this.mainWindow.setPosition(x, y);
	} else {
		this.mainWindow.setPosition(x - width / 2, y);
	}
}

function createTray() {
	const icon = nativeImage.createFromPath(path.join(__dirname, "copyTemplate.png"));
	const tray = new Tray(icon);

	tray.setToolTip("Clipboard Manager");

	new Promise((r, j) => {
		var t = setInterval(() => {
			var b = tray.getBounds();
			if (b.x != 0) {
				r(b);
				clearInterval(t);
			}
		}, 100);
	}).then((b) => move.call(this, b));

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Clipboard Preferences",
			type: "normal",
			click: () => this.settingWindow.show(),
		},
		{ type: "separator" },
		{
			label: "About Clipboard",
			type: "normal",
			click: () => this.aboutWindow.show(),
		},
		{ type: "separator" },
		{ label: "Quit Clipboard", type: "normal", click: () => this.quit() },
	]);

	contextMenu.on("menu-will-close", () => {
		tray.setContextMenu(null);
		this.mainWindow.hide();
	});

	tray.on("right-click", () => {
		tray.setContextMenu(contextMenu);
		tray.popUpContextMenu();
	});

	tray.on("click", (e, b, p) => {
		tray.setContextMenu(null);
		if (this.mainWindow.isShow) {
			this.mainWindow.hide();
		} else {
			this.mainWindow.show();
		}
	});

	console.log("create tray success");

	return tray;
}

module.exports = { createTray };
