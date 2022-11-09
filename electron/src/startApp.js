const { BrowserWindow, globalShortcut, app, powerMonitor } = require("electron");
const { isMac } = require("./lib");

function startApp() {
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on("ready", () => {
		var key = isMac ? "Command" : "Alt";

		console.log(
			`register globalShortcut ${key}+P`,
			globalShortcut.register(`${key}+P`, () => {
				var win = BrowserWindow.getFocusedWindow();
				if (!win) return;
				if (win.webContents.isDevToolsOpened()) {
					win.webContents.closeDevTools();
				} else {
					win.webContents.openDevTools();
				}
			})
		);

		console.log(
			`register globalShortcut ${key}+B`,
			globalShortcut.register(`${key}+B`, () => {
				if (this.mainWindow.isShow) {
					this.mainWindow.hide();
				} else {
					this.mainWindow.show();
				}
			})
		);

		console.log("main process pid", process.pid);

		this.setting();

		this.createMainWindow();
		this.createAboutWindow();
		this.createSettingWindow();

		this.createTray();

		this.ipcMain();

		this.startLoop();
	});

	// Quit when all windows are closed.
	app.on("window-all-closed", () => {
		console.log("on window-all-closed");
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (!isMac()) {
			console.log("maybe is time to quit");
		}
	});

	app.on("activate", () => {
		console.log("on activate");
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			console.log("maybe is time to create a new one");
		}
	});

	app.on("quit", () => {
		console.log("quit success");
	});

	powerMonitor.on("lock-screen", () => {
		console.log("lock-screen");
		this.save();
		this.stopLoop();
	});

	powerMonitor.on("unlock-screen", () => {
		console.log("unlock-screen");
		this.startLoop();
	});
}

module.exports = { startApp };
