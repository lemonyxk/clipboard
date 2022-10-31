const { app, BrowserWindow, powerMonitor } = require("electron");
const { globalShortcut, clipboard } = require("electron");
const Store = require("electron-store");
Store.initRenderer();
const path = require("path");
const fs = require("fs");
const lib = require("./lib");
const { createMainWindow, createSettingWindow, createAboutWindow } = require("./window");
const { createTray } = require("./tray");
const { ipc } = require("./ipcMain");
const { createMenu } = require("./menu");

class Main {
	// window handler
	mainWindow = null;
	aboutWindow = null;
	settingWindow = null;

	// tray handler
	tray = null;

	// id inc
	inc = Date.now();

	// lock file
	lock = path.join(__dirname, "lock");

	// mode
	dev = !!process.env.NODE_ENV;

	// main window width and height
	width = this.dev ? 700 + 500 : 700;
	height = this.dev ? 600 : 600;

	// store
	store = new Store();

	// data
	texts = this.store.get("texts") || [];
	files = this.store.get("files") || [];
	textsFavorite = this.store.get("textsFavorite") || [];
	filesFavorite = this.store.get("filesFavorite") || [];
	text = this.texts[0] ? this.texts[0].text : "";
	file = this.files[0] ? [this.files[0].text] : [];

	// app config
	config = { maxLength: 1500, pageSize: 15, ...(this.store.get("setting") || {}) };

	init() {
		if (!this.dev) {
			var log = path.join(__dirname, "log");
			var fd = fs.openSync(log, "a+");
			console.log = (...args) => {
				fs.writeSync(fd, args.toString() + "\n");
			};
		}
	}

	setting(setting = {}) {
		this.config = { ...this.config, ...setting };

		// start at login
		if (!this.dev) {
			app.setLoginItemSettings({ openAtLogin: this.config.startAtLogin, openAsHidden: true });
		}

		if (!this.config.pageSize || this.config.pageSize < 1) this.config.pageSize = 15;
		if (this.config.pageSize > 100) this.config.pageSize = 100;
		if (!this.config.maxLength || this.config.maxLength < 1) this.config.maxLength = 1500;
		if (this.config.maxLength > 10000) this.config.maxLength = 10000;

		this.store.set("setting", this.config);
	}

	find(pid) {
		try {
			return process.kill(pid, 0);
		} catch (e) {
			return e.code === "EPERM";
		}
	}

	unlock() {
		try {
			fs.rmSync(this.lock);
		} catch (error) {
			console.log(this.lock, "not exists");
		}
	}

	checkSingle() {
		if (fs.existsSync(this.lock)) {
			var pid = fs.readFileSync(this.lock).toString();
			if (this.find(parseInt(pid))) {
				return false;
			}
		}

		fs.writeFileSync(this.lock, `${process.pid}`);

		return true;
	}

	lisnten() {
		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.
		app.on("ready", () => {
			var key = lib.isMac() ? "Command" : "Alt";

			globalShortcut.register(`${key}+P`, () => {
				var win = BrowserWindow.getFocusedWindow();
				if (!win) return;
				if (win.webContents.isDevToolsOpened()) {
					win.webContents.closeDevTools();
				} else {
					win.webContents.openDevTools();
				}
			});

			globalShortcut.register(`${key}+B`, () => {
				this.mainWindow.show();
			});

			console.log(globalShortcut.isRegistered("CommandOrControl+P"));
			console.log("main pid", process.pid);

			this.setting();

			this.createMainWindow();
			this.createAboutWindow();
			this.createSettingWindow();

			this.initTray();
			this.ipcMain();

			this.loop();
		});

		// Quit when all windows are closed.
		app.on("window-all-closed", () => {
			console.log("on window-all-closed");
			// On OS X it is common for applications and their menu bar
			// to stay active until the user quits explicitly with Cmd + Q
			if (!lib.isMac()) {
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
	}

	createSettingWindow() {
		this.settingWindow = createSettingWindow.call(this);
	}

	createAboutWindow() {
		this.aboutWindow = createAboutWindow.call(this);
	}

	createMainWindow() {
		this.mainWindow = createMainWindow.call(this);
	}

	initTray() {
		if (this.tray) return;
		this.tray = createTray.call(this);
	}

	ipcMain() {
		ipc.call(this);
	}

	loop() {
		setInterval(() => {
			this.store.set("texts", this.texts);
			this.store.set("files", this.files);
			this.store.set("textsFavorite", this.textsFavorite);
			this.store.set("filesFavorite", this.filesFavorite);
		}, 1000 * 60 * 30);

		setInterval(() => {
			var fList = lib.readFiles();

			if (fList.length != 0 && !lib.compare(fList, this.file)) {
				this.file = fList;
				var res = [];
				for (let i = 0; i < this.file.length; i++) {
					var f = { text: this.file[i], time: Date.now(), id: this.inc++ };
					this.files.unshift(f);
					res.push(f);
				}
				if (this.files.length > this.config.maxLength) this.files.splice(this.config.maxLength);
				this.mainWindow.webContents.send("update-clipboard-file", {
					text: res,
					total: this.files.length,
					size: this.config.pageSize,
				});

				// stop read text
				this.text = clipboard.readText("clipboard");
				return;
			}

			var nText = clipboard.readText("clipboard");
			if (nText != "" && this.text != nText) {
				this.text = nText;
				var f = { text: this.text, time: Date.now(), id: this.inc++ };
				this.texts.unshift(f);
				if (this.texts.length > this.config.maxLength) this.texts.splice(this.config.maxLength);
				this.mainWindow.webContents.send("update-clipboard-text", {
					text: [f],
					total: this.texts.length,
					size: this.config.pageSize,
				});
			}
		}, 500);
	}

	save() {
		this.store.set("texts", this.texts);
		this.store.set("files", this.files);
		this.store.set("textsFavorite", this.textsFavorite);
		this.store.set("filesFavorite", this.filesFavorite);
	}

	quit() {
		this.save();
		this.unlock();
		app.exit();
	}

	start() {
		this.init();

		if (!this.checkSingle()) return this.quit();

		createMenu.call(this);

		app.allowRendererProcessReuse = true;

		powerMonitor.on("lock-screen", () => {
			console.log("lock-screen");
			this.save();
		});

		this.lisnten();
	}
}

const main = new Main();

main.start();
