const { app, BrowserWindow, screen, Menu, globalShortcut, nativeImage, Tray, clipboard, ipcMain, dialog } = require("electron");
const path = require("path");
const child = require("child_process");
const Store = require("electron-store");
const fs = require("fs");

let dev = !!process.env.NODE_ENV;

// app.dock.hide();

Store.initRenderer();

var store = new Store();

if (!dev) {
	var log = path.join(__dirname, "log");
	var access = fs.createWriteStream(log, { flags: "a+" });
	process.stdout.write = process.stderr.write = access.write.bind(access);
}

var lock = path.join(__dirname, "lock");

var maxLength = 1000;

var data = store.get("data") || [];
var text = data[0] || "";

let width = dev ? 1000 : 500;
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
		if (process.platform === "win32") {
			return child.execSync(`tasklist | findstr ${pid}`);
		} else {
			return child.execSync(`ps axu | grep -v grep | grep ${pid}`);
		}
	}

	checkSingle() {
		if (fs.existsSync(lock)) {
			try {
				var pid = fs.readFileSync(lock).toString();
				this.find(pid);
				return false;
			} catch (error) {}
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

		this.mainWindow = new BrowserWindow({
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

		// this.mainWindow.webContents.on("ready-to-show", () => {
		// 	console.log("ready-to-show");
		// 	this.mainWindow.show();
		// });

		this.mainWindow.on("close", () => {
			console.log("close");
			this.mainWindow.hide();
			this.quit();
		});

		this.mainWindow.on("blur", () => {
			console.log("blur");
			this.mainWindow.hide();
		});

		this.mainWindow.webContents.on("dom-ready", () => {
			console.log("dom-ready");
		});

		// and load the index.html of the app.
		if (dev) {
			this.mainWindow.loadURL("http://127.0.0.1:8081");
		} else {
			this.mainWindow.loadFile(path.join(__dirname, "/dist/index.html"));
		}

		// Open the DevTools.
		if (dev) this.mainWindow.webContents.openDevTools();
	}

	hasInitTray = false;
	initTray() {
		if (this.hasInitTray) return;
		this.hasInitTray = true;

		let size = screen.getPrimaryDisplay().size;

		const icon = nativeImage.createFromPath(path.join(__dirname, "copy.png"));
		let tray = new Tray(icon.resize({ width: 16, height: 16 }));
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

			if (size.width - x < width) {
				x = size.width - width;
				this.mainWindow.setPosition(x, y);
			} else {
				if (x - width / 2 < 0) {
					x = 0;
					this.mainWindow.setPosition(x, y);
				} else {
					this.mainWindow.setPosition(x - width / 2, y);
				}
			}
			this.mainWindow.show();
		});

		ipcMain.on("setting", (e, data) => {
			store.set("setting", data);
			this.setting();
		});

		ipcMain.on("hide-window", () => {
			this.mainWindow.hide();
		});

		ipcMain.on("init-clipboard", () => {
			this.mainWindow.webContents.send("init-clipboard", data);
		});

		setInterval(() => {
			var nText = clipboard.readText("clipboard");
			if (text != nText) {
				text = nText;
				data.unshift({ text, time: Date.now() });
				if (data.length > maxLength) data.splice(maxLength);
				this.mainWindow.webContents.send("update-clipboard", { text, time: Date.now() });
			}
		}, 500);

		this.tray = tray;
	}

	quit() {
		store.set("data", data);
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
