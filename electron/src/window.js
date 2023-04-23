const { BrowserWindow } = require("electron");
const path = require("path");

function createMainWindow() {
	var { width, height, dev } = this;

	var mainWindow = new BrowserWindow({
		width: width,
		height: height,
		minWidth: width,
		minHeight: height,
		icon: path.join(__dirname, "clipboard.icns"),

		resizable: true,
		minimizable: false,
		maximizable: false,

		show: false,
		transparent: true,
		// titleBarStyle: "hidden",
		// titleBarOverlay: true,
		frame: false,
		alwaysOnTop: true,
		skipTaskbar: true,

		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
			// webSecurity: false,
			nodeIntegrationInWorker: true,
			backgroundThrottling: false,
		},
	});

	mainWindow.isShow = false;

	mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

	mainWindow.webContents.on("before-input-event", (event, input) => {
		if (input.code == "Tab") event.preventDefault();

		if (input.type == "keyDown") {
			mainWindow.webContents.send("keyDown", input);
		}

		if (input.type == "keyUp") {
			mainWindow.webContents.send("keyUp", input);
		}
	});

	mainWindow.on("hide", (e) => {
		mainWindow.webContents.send("mainWindow-hide");
		mainWindow.isShow = false;
	});

	mainWindow.on("show", (e) => {
		mainWindow.webContents.send("mainWindow-show");
		mainWindow.isShow = true;
	});

	mainWindow.on("close", (e) => {
		if (dev) return this.quit();
		e.preventDefault();
		mainWindow.hide();
		mainWindow.webContents.send("mainWindow-close");
	});

	mainWindow.on("blur", (e) => {
		mainWindow.webContents.send("mainWindow-blur");
	});

	mainWindow.on("focus", (e) => {
		mainWindow.webContents.send("mainWindow-focus");
	});

	mainWindow.webContents.on("dom-ready", () => {
		console.log("main window dom-ready");
	});

	// and load the index.html of the app.
	if (dev) {
		mainWindow.loadURL("http://127.0.0.1:8080");
	} else {
		mainWindow.loadFile(path.join(__dirname, "/dist/index.html"));
	}

	// Open the DevTools.
	if (dev) mainWindow.webContents.openDevTools();

	console.log("create main window success");

	return mainWindow;
}

function createSettingWindow() {
	var { width, height, dev } = this;

	var settingWindow = new BrowserWindow({
		width: dev ? 400 + 500 : 400,
		height: 400,
		minWidth: 400,
		minHeight: 400,
		icon: path.join(__dirname, "clipboard.icns"),

		resizable: true,
		minimizable: false,
		maximizable: false,

		show: false,
		// transparent: true,
		// titleBarStyle: "hidden",
		// titleBarOverlay: true,
		// frame: false,
		alwaysOnTop: true,
		skipTaskbar: true,

		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,

			nodeIntegrationInWorker: true,
			backgroundThrottling: false,
		},
	});

	settingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

	settingWindow.on("hide", (e) => {
		settingWindow.webContents.send("settingWindow-hide");
	});

	settingWindow.on("show", (e) => {
		settingWindow.webContents.send("settingWindow-show");
	});

	settingWindow.on("close", (e) => {
		e.preventDefault();
		settingWindow.hide();
		settingWindow.webContents.send("settingWindow-close");
	});

	settingWindow.on("blur", (e) => {
		settingWindow.webContents.send("settingWindow-blur");
	});

	settingWindow.on("focus", (e) => {
		settingWindow.webContents.send("settingWindow-focus");
	});

	settingWindow.webContents.on("dom-ready", () => {
		console.log("setting windows dom-ready");
	});

	// and load the index.html of the app.
	if (dev) {
		settingWindow.loadURL("http://127.0.0.1:8080/#/setting");
	} else {
		settingWindow.loadFile(path.join(__dirname, "/dist/index.html"), { hash: "/setting" });
	}

	if (dev) settingWindow.webContents.openDevTools();

	console.log("create setting window success");

	return settingWindow;
}

function createAboutWindow() {
	var { width, height, dev } = this;

	var aboutWindow = new BrowserWindow({
		width: dev ? 400 + 500 : 400,
		height: 400,
		minWidth: 400,
		minHeight: 400,
		icon: path.join(__dirname, "clipboard.icns"),

		resizable: false,
		minimizable: false,
		maximizable: false,

		show: false,
		// transparent: true,
		// titleBarStyle: "hidden",
		// titleBarOverlay: true,
		// frame: false,
		alwaysOnTop: true,
		skipTaskbar: true,

		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,

			nodeIntegrationInWorker: true,
			backgroundThrottling: false,
		},
	});

	aboutWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

	aboutWindow.on("hide", (e) => {
		aboutWindow.webContents.send("aboutWindow-hide");
	});

	aboutWindow.on("show", (e) => {
		aboutWindow.webContents.send("aboutWindow-show");
	});

	aboutWindow.on("close", (e) => {
		e.preventDefault();
		aboutWindow.hide();
		aboutWindow.webContents.send("aboutWindow-close");
	});

	aboutWindow.on("blur", (e) => {
		aboutWindow.webContents.send("aboutWindow-blur");
	});

	aboutWindow.on("focus", (e) => {
		aboutWindow.webContents.send("aboutWindow-focus");
	});

	aboutWindow.webContents.on("dom-ready", () => {
		console.log("about window dom-ready");
	});

	// and load the index.html of the app.
	if (dev) {
		aboutWindow.loadURL("http://127.0.0.1:8080/#/about");
	} else {
		aboutWindow.loadFile(path.join(__dirname, "/dist/index.html"), { hash: "/about" });
	}

	if (dev) aboutWindow.webContents.openDevTools();

	console.log("create about window success");

	return aboutWindow;
}

module.exports = { createMainWindow, createSettingWindow, createAboutWindow };
