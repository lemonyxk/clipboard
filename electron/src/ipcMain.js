const { ipcMain, clipboard, nativeImage, app, shell } = require("electron");
const lib = require("./lib");
const fs = require("fs");

function ipc() {
	ipcMain.on("setting", (e, setting) => {
		this.setting(setting);
		this.mainWindow.webContents.send("setting", this.config);
		this.settingWindow.webContents.send("setting", this.config);
		this.aboutWindow.webContents.send("setting", this.config);
	});

	ipcMain.on("clear", () => {
		clipboard.clear("clipboard");
		var setting = this.store.get("setting");
		this.store.clear();
		this.texts = [];
		this.files = [];
		this.text = "";
		this.file = [];
		this.textsFavorite = [];
		this.filesFavorite = [];
		this.store.set("setting", setting);
		this.mainWindow.reload();
		lib.showMessage("Clear Success");
	});

	ipcMain.on("hide-window", () => {
		this.mainWindow.hide();
	});

	ipcMain.on("export", () => {
		lib.exportData.call(this);
	});

	ipcMain.on("import", () => {
		lib.importData.call(this);
	});

	ipcMain.on("delete-file", (e, item) => {
		var index = this.files.findIndex((e) => e.id == item.id);
		if (index == -1) return this.mainWindow.webContents.send("delete-file");
		this.files.splice(index, 1);
		return this.mainWindow.webContents.send("delete-file");
	});

	ipcMain.on("open-file", async (e, item) => {
		var fn = () => {
			var index = this.files.findIndex((e) => e.id == item.id);
			if (index == -1) return;
			this.files[index].deleted = true;
		};

		if (!fs.existsSync(item.url)) {
			fn();
			return this.mainWindow.webContents.send("open-file", false);
		}

		if (item.dir) {
			shell.showItemInFolder(item.url);
			return this.mainWindow.webContents.send("open-file", true);
		}

		shell
			.openExternal(`file://${item.url}`)
			.then((res) => this.mainWindow.webContents.send("open-file", true))
			.catch((err) => {
				fn();
				this.mainWindow.webContents.send("open-file", false);
			});
	});

	ipcMain.on("load-image", async (e, item) => {
		var fn = () => {
			var index = this.files.findIndex((e) => e.id == item.id);
			if (index == -1) return;
			this.files[index].deleted = true;
		};

		if (!fs.existsSync(item.text)) {
			fn();
			return this.mainWindow.webContents.send("load-image");
		}

		if (lib.isMac()) {
			var img = await nativeImage.createThumbnailFromPath(`${item.text}`, { width: 256, height: 256 });
			var data = img.toPNG().toString("base64");
			this.mainWindow.webContents.send("load-image", `data:${`image/png`};base64,${data}`);
		}

		if (lib.isWin32()) {
			try {
				var img = await nativeImage.createThumbnailFromPath(`${item.text}`, { width: 256, height: 256 });
				var data = img.toPNG().toString("base64");
				this.mainWindow.webContents.send("load-image", `data:${`image/png`};base64,${data}`);
			} catch (err) {
				var img = await app.getFileIcon(`${item.text}`);
				var data = img.toPNG().toString("base64");
				this.mainWindow.webContents.send("load-image", `data:${`image/png`};base64,${data}`);
			}
		}
	});

	ipcMain.on("clipboard-favorite", (e, info) => {
		if (info.type == "text") {
			var textsIndex = this.texts.findIndex((e) => e.id == info.id);
			var favoriteIndex = this.textsFavorite.findIndex((e) => e.id == info.id);
			if (textsIndex == -1 && favoriteIndex == -1) return;

			if (favoriteIndex == -1) {
				this.texts[textsIndex].favorite = true;
				this.textsFavorite.unshift(this.texts[textsIndex]);
			} else {
				if (this.texts[textsIndex]) this.texts[textsIndex].favorite = false;
				this.textsFavorite.splice(favoriteIndex, 1);
			}
		}

		if (info.type == "file") {
			var filesIndex = this.files.findIndex((e) => e.id == info.id);
			var favoriteIndex = this.filesFavorite.findIndex((e) => e.id == info.id);
			if (filesIndex == -1 && favoriteIndex == -1) return;

			if (favoriteIndex == -1) {
				this.files[filesIndex].favorite = true;
				this.filesFavorite.unshift(this.files[filesIndex]);
			} else {
				if (this.files[filesIndex]) this.files[filesIndex].favorite = false;
				this.filesFavorite.splice(favoriteIndex, 1);
			}
		}
	});

	ipcMain.on("clipboard-text", (e, text) => {
		clipboard.writeText(text, "clipboard");
	});

	ipcMain.on("clipboard-file", (e, file) => {
		lib.writeFiles([file]);
	});

	ipcMain.on("clipboard-batch", (e, item) => {
		var index = -1;
		for (let i = 0; i < this.files.length; i++) {
			if (this.files[i].time == item.time) {
				index = i;
				break;
			}
		}

		if (index == -1) return;

		var res = [];
		for (let i = index; i < this.files.length; i++) {
			if (this.files[i].time != item.time) break;
			res.unshift(this.files[i].text);
		}

		this.stopLoop();

		// ignore files event
		this.file = res;

		lib.writeFiles(res);

		lib.showMessage(`${res.length} Items Copy Success`).then(() => this.startLoop());
	});

	ipcMain.on("get-clipboard-text", (e, info) => {
		var page = info.page;
		var source = info.favorite ? this.textsFavorite : this.texts;
		var res = source.slice(
			(page - 1) * this.config.pageSize,
			(page - 1) * this.config.pageSize + this.config.pageSize
		);
		this.mainWindow.webContents.send("get-clipboard-text", {
			data: res,
			total: source.length,
			size: this.config.pageSize,
		});
	});

	ipcMain.on("get-clipboard-file", (e, info) => {
		var page = info.page;
		var source = info.favorite ? this.filesFavorite : this.files;
		var res = source.slice(
			(page - 1) * this.config.pageSize,
			(page - 1) * this.config.pageSize + this.config.pageSize
		);
		this.mainWindow.webContents.send("get-clipboard-file", {
			data: res,
			total: source.length,
			size: this.config.pageSize,
		});
	});

	ipcMain.on("get-clipboard-text-search", (e, info) => {
		var filter = info.filter;
		var source = info.favorite ? this.textsFavorite : this.texts;
		var res = [];

		try {
			if (!filter) return;
			if (filter[0] == "`" && filter[filter.length - 1] == "`") {
				var regex = new RegExp(filter.slice(1, -1));
				for (let i = 0; i < source.length; i++) {
					if (regex.test(source[i].text)) {
						res.push(source[i]);
					}
				}
			} else {
				for (let i = 0; i < source.length; i++) {
					if (source[i].text.includes(filter)) {
						res.push(source[i]);
					}
				}
			}
		} catch (err) {
			console.log(err);
		} finally {
			this.mainWindow.webContents.send("get-clipboard-text-search", {
				data: res,
				total: res.length,
				size: this.config.pageSize,
			});
		}
	});

	ipcMain.on("get-clipboard-file-search", (e, info) => {
		var filter = info.filter;
		var source = info.favorite ? this.filesFavorite : this.files;
		var res = [];

		try {
			if (!filter) return;
			if (filter[0] == "`" && filter[filter.length - 1] == "`") {
				var regex = new RegExp(filter.slice(1, -1));
				for (let i = 0; i < source.length; i++) {
					if (regex.test(source[i].text)) {
						res.push(source[i]);
					}
				}
			} else {
				for (let i = 0; i < source.length; i++) {
					if (source[i].text.includes(filter)) {
						res.push(source[i]);
					}
				}
			}
		} catch (err) {
			console.log(err);
		} finally {
			this.mainWindow.webContents.send("get-clipboard-file-search", {
				data: res,
				total: res.length,
				size: this.config.pageSize,
			});
		}
	});

	console.log("create ipcMain success");
}

module.exports = { ipc };
