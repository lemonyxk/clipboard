const { app, BrowserWindow, powerMonitor, screen, Menu, globalShortcut, nativeImage, Tray, clipboard, ipcMain, ipcRenderer } = require("electron");
const path = require("path");
const Store = require("electron-store");
const fs = require("fs");
const lib = require("./lib");

let dev = !!process.env.NODE_ENV;

if (!dev) {
	var log = path.join(__dirname, "log");
	var fd = fs.openSync(log, "a+");
	var consoleFn = console.log;
	console.log = (...args) => {
		fs.writeSync(fd, args.toString() + "\n");
	};
}

Store.initRenderer();

var store = new Store();

var lock = path.join(__dirname, "lock");

var maxLength = 1000;

var data = store.get("data") || [];
var files = store.get("files") || [];
var text = data[0] || "";
var file = files[0] ? [files[0]] : [];

let width = dev ? 1200 : 700;
let height = dev ? 600 : 600;

class Main {
	mainWindow = null;
	aboutWindow = null;
	settingWindow = null;

	tray = null;

	setting() {
		if (!dev) {
			var setting = store.get("setting") || {};
			app.setLoginItemSettings({
				openAtLogin: setting.startAtLogin,
				openAsHidden: true,
			});
		}
	}

	find(pid) {
		try {
			return process.kill(pid, 0);
		} catch (e) {
			return e.code === "EPERM";
		}
	}

	checkSingle() {
		if (fs.existsSync(lock)) {
			var pid = fs.readFileSync(lock).toString();
			if (this.find(parseInt(pid))) {
				return false;
			}
		}

		fs.writeFileSync(lock, `${process.pid}`);

		return true;
	}

	lisnten() {
		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.
		app.on("ready", () => {
			const ret = globalShortcut.register("CommandOrControl+P", () => {
				var win = BrowserWindow.getFocusedWindow();
				if (!win) return;
				if (win.webContents.isDevToolsOpened()) {
					win.webContents.closeDevTools();
				} else {
					win.webContents.openDevTools();
				}
			});

			// // 检查快捷键是否注册成功
			// console.log(globalShortcut.isRegistered("CommandOrControl+P"));

			console.log("main pid", process.pid);
			if (this.server) console.log("child pid", this.server.pid);

			this.setting();

			this.createMainWindow();
			this.createAboutWindow();
			this.createSettingWindow();

			this.initTray();
			this.ipcMain();
		});

		// Quit when all windows are closed.
		// app.on("window-all-closed", () => {
		// 	console.log("on window-all-closed");
		// 	// On OS X it is common for applications and their menu bar
		// 	// to stay active until the user quits explicitly with Cmd + Q
		// 	// if (process.platform !== "darwin") {}
		// 	this.quit();
		// });

		// app.on("activate", () => {
		// 	console.log("on activate");
		// 	// On OS X it's common to re-create a window in the app when the
		// 	// dock icon is clicked and there are no other windows open.
		// 	if (BrowserWindow.getAllWindows().length === 0) {
		// 		this.createMainWindow();
		// 	}
		// });
	}

	createSettingWindow() {
		var settingWindow = new BrowserWindow({
			width: 300,
			height: 300,
			minWidth: 300,
			minHeight: 300,
			icon: path.join(__dirname, "clipboard.icns"),

			resizable: true,

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
			},
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

		// and load the index.html of the app.
		if (dev) {
			settingWindow.loadURL("http://127.0.0.1:8081/#/setting");
		} else {
			settingWindow.loadFile(path.join(__dirname, "/dist/index.html"), { hash: "/setting" });
		}

		this.settingWindow = settingWindow;
	}

	createAboutWindow() {
		var aboutWindow = new BrowserWindow({
			width: 300,
			height: 300,
			minWidth: 300,
			minHeight: 300,
			icon: path.join(__dirname, "clipboard.icns"),

			resizable: false,

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
			},
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

		// and load the index.html of the app.
		if (dev) {
			aboutWindow.loadURL("http://127.0.0.1:8081/#/about");
		} else {
			aboutWindow.loadFile(path.join(__dirname, "/dist/index.html"), { hash: "/about" });
		}

		this.aboutWindow = aboutWindow;
	}

	createMainWindow() {
		// Create the browser window.

		var mainWindow = new BrowserWindow({
			width: width,
			height: height,
			minWidth: width,
			minHeight: height,
			icon: path.join(__dirname, "clipboard.icns"),

			resizable: false,

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

				nodeIntegrationInWorker: true,
			},
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
			console.log("dom-ready");
		});

		// and load the index.html of the app.
		if (dev) {
			mainWindow.loadURL("http://127.0.0.1:8081");
		} else {
			mainWindow.loadFile(path.join(__dirname, "/dist/index.html"));
		}

		// Open the DevTools.
		if (dev) mainWindow.webContents.openDevTools();

		this.mainWindow = mainWindow;
	}

	initTray() {
		if (this.tray) return;

		let size = screen.getPrimaryDisplay().size;

		const icon = nativeImage.createFromPath(path.join(__dirname, "copyTemplate.png"));
		let tray = new Tray(icon);
		tray.setToolTip("Clipboard Manager");

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
			// console.log("menu will close");
			tray.setContextMenu(null);
			this.mainWindow.hide();
		});

		tray.on("right-click", () => {
			// console.log("right click");
			tray.setContextMenu(contextMenu);
			tray.popUpContextMenu();
		});

		tray.on("click", (e, b, p) => {
			// console.log("click");

			tray.setContextMenu(null);
			var x = b.x;
			var y = b.y;

			if (process.platform == "win32") {
				y = size.height - height - b.height;
			}

			if (x - width / 2 < 0) {
				x = 0;
				this.mainWindow.setPosition(x, y);
			} else {
				this.mainWindow.setPosition(x - width / 2, y);
			}

			// if (size.width - x < width) {
			// 	x = size.width - width;
			// 	this.mainWindow.setPosition(x, y);
			// } else {
			// 	if (x - width / 2 < 0) {
			// 		x = 0;
			// 		this.mainWindow.setPosition(x, y);
			// 	} else {
			// 		this.mainWindow.setPosition(x - width / 2, y);
			// 	}
			// }

			this.mainWindow.show();
		});

		setInterval(() => {
			var fList = lib.readFiles();

			if (fList.length != 0 && !lib.compare(fList, file)) {
				file = fList;
				for (let i = 0; i < file.length; i++) {
					files.unshift({ file: file[i], time: Date.now() });
				}
				if (files.length > maxLength) files.splice(maxLength);
				this.mainWindow.webContents.send("update-clipboard-files", { file, time: Date.now() });

				// stop read text
				text = clipboard.readText("clipboard");
				return;
			}

			var nText = clipboard.readText("clipboard");
			if (nText != "" && text != nText) {
				text = nText;
				data.unshift({ text, time: Date.now() });
				if (data.length > maxLength) data.splice(maxLength);
				this.mainWindow.webContents.send("update-clipboard", { text, time: Date.now() });
			}
		}, 500);

		this.tray = tray;
	}

	ipcMain() {
		powerMonitor.on("lock-screen", () => {
			console.log("lock-screen");
			store.set("data", data);
		});

		ipcMain.on("setting", (e, data) => {
			store.set("setting", data);
			this.setting();
		});

		ipcMain.on("clipboard-text", (e, text) => {
			clipboard.writeText(text, "clipboard");
		});

		ipcMain.on("clipboard-file", (e, file) => {
			lib.writeFiles([file]);
		});

		ipcMain.on("hide-window", () => {
			this.mainWindow.hide();
		});

		ipcMain.on("init-clipboard", () => {
			this.mainWindow.webContents.send("init-clipboard", data);
		});

		ipcMain.on("init-clipboard-files", () => {
			this.mainWindow.webContents.send("init-clipboard-files", files);
		});
	}

	quit() {
		store.set("data", data);
		store.set("files", files);
		try {
			fs.rmSync(lock);
		} catch (error) {}
		app.exit();
	}

	start() {
		if (!this.checkSingle()) {
			this.quit();
			return;
		}

		if (process.platform === "darwin") {
			const template = [
				{
					label: "Application",
					submenu: [
						{
							label: "Quit",
							accelerator: "Command+Q",
							click: () => this.quit(),
						},
					],
				},
				{
					label: "Edit",
					submenu: [
						{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
						{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
						{ type: "separator" },
						{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
						{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
						{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
						{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
					],
				},
				{
					label: "Dev",
					submenu: [{ label: "Open Dev Tools", role: "toggleDevTools" }],
				},
			];
			Menu.setApplicationMenu(Menu.buildFromTemplate(template));
		} else {
			// tray flicker
			app.commandLine.appendSwitch("wm-window-animations-disabled");
			Menu.setApplicationMenu(null);
		}

		app.allowRendererProcessReuse = true;

		this.lisnten();
	}
}

const main = new Main();

main.start();
