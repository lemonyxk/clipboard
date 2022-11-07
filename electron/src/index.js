const { app, clipboard } = require("electron");
const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
const lib = require("./lib");
const { createMainWindow, createSettingWindow, createAboutWindow } = require("./window");
const { createTray } = require("./tray");
const { ipc } = require("./ipcMain");
const { createMenu } = require("./menu");
const { startApp } = require("./startApp");

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
	config = { maxLength: 1500, pageSize: 15, showSize: 15, ...(this.store.get("setting") || {}) };

	init() {
		if (!this.dev) {
			var log = path.join(__dirname, "clipboard.log");
			var fd = fs.openSync(log, "a+");
			console.log = (...args) => {
				var str = "";
				for (let i = 0; i < args.length; i++) {
					str += args[i].toString();
					if (i != args.length - 1) {
						str += " ";
					} else {
						str += "\n";
					}
				}

				fs.writeSync(fd, `${new Date().toISOString()}: ${str}`);
			};
			console.log("init success");
		}
	}

	setting(setting = {}) {
		this.config = { ...this.config, ...setting };

		// start at login
		if (!this.dev) {
			if (!app.getLoginItemSettings().openAtLogin) {
				app.setLoginItemSettings({ openAtLogin: this.config.startAtLogin, openAsHidden: true });
			}
		}

		if (!this.config.pageSize || this.config.pageSize < 1) this.config.pageSize = 15;
		if (this.config.pageSize > 100) this.config.pageSize = 100;
		if (!this.config.showSize || this.config.showSize < 1) this.config.showSize = 15;
		if (this.config.showSize > 20) this.config.showSize = 20;
		if (!this.config.maxLength || this.config.maxLength < 1) this.config.maxLength = 1500;
		if (this.config.maxLength > 10000) this.config.maxLength = 10000;

		this.store.set("setting", this.config);

		console.log("setting update", this.config);
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
		} catch (err) {
			console.log(this.lock, "not exists");
		}
	}

	checkSingle() {
		if (fs.existsSync(this.lock)) {
			var pid = fs.readFileSync(this.lock).toString();
			if (this.find(parseInt(pid))) {
				console.log("pid not find");
				return false;
			}
		}

		fs.writeFileSync(this.lock, `${process.pid}`);

		return true;
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

	createTray() {
		if (this.tray) return;
		this.tray = createTray.call(this);
	}

	ipcMain() {
		ipc.call(this);
	}

	stopLoop() {
		clearInterval(this.saveTimer);
		clearInterval(this.filesTimer);
		console.log("stop loop");
	}

	startLoop() {
		this.saveTimer = setInterval(() => this.save(), 1000 * 60 * 30);

		this.filesTimer = setInterval(() => {
			var fList = lib.readFiles();
			if (fList.length != 0 && !lib.compare(fList, this.file)) {
				this.file = fList;
				var res = [];
				var t = Date.now();
				for (let i = 0; i < this.file.length; i++) {
					var f = { text: this.file[i], time: t, id: this.inc++ };
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
				var t = Date.now();
				var f = { text: this.text, time: t, id: this.inc++ };
				this.texts.unshift(f);
				if (this.texts.length > this.config.maxLength) this.texts.splice(this.config.maxLength);
				this.mainWindow.webContents.send("update-clipboard-text", {
					text: [f],
					total: this.texts.length,
					size: this.config.pageSize,
				});
			}
		}, 500);

		console.log("start loop");
	}

	save() {
		this.store.set("texts", this.texts);
		this.store.set("files", this.files);
		this.store.set("textsFavorite", this.textsFavorite);
		this.store.set("filesFavorite", this.filesFavorite);
		console.log("save data success");
	}

	quit() {
		this.save();
		this.unlock();
		app.exit();
	}

	run() {
		startApp.call(this);
	}

	start() {
		this.init();

		if (!this.checkSingle()) return this.quit();

		createMenu.call(this);

		this.run();
	}
}

Store.initRenderer();

const main = new Main();

main.start();
