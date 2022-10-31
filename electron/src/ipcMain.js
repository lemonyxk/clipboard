const { ipcMain, clipboard, nativeImage, app } = require("electron");
const lib = require("./lib");
const path = require("path");
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
		lib.showMessage("clear success!!!");
	});

	ipcMain.on("hide-window", () => {
		this.mainWindow.hide();
	});

	ipcMain.on("delete-file", (e, item) => {
		var index = this.files.findIndex((e) => e.id == item.id);
		if (index == -1) return this.mainWindow.webContents.send("delete-file");
		this.files.splice(index, 1);
		return this.mainWindow.webContents.send("delete-file");
	});

	ipcMain.on("load-image", async (e, item) => {
		try {
			var img = await nativeImage.createThumbnailFromPath(`${item.text}`, { width: 256, height: 256 });
			var data = img.toPNG().toString("base64");
			this.mainWindow.webContents.send("load-image", `data:${`image/png`};base64,${data}`);
		} catch (error) {
			if (lib.isWin32()) {
				try {
					fs.statSync(`${item.text}`);
					var img = await app.getFileIcon(`${item.text}`);
					var data = img.toPNG().toString("base64");
					this.mainWindow.webContents.send("load-image", `data:${`image/png`};base64,${data}`);
				} catch (error) {
					var index = this.files.findIndex((e) => e.id == item.id);
					if (index == -1) return;
					this.files[index].deleted = true;
					this.mainWindow.webContents.send("load-image");
				}
			}

			if (lib.isMac()) {
				var index = this.files.findIndex((e) => e.id == item.id);
				if (index == -1) return;
				this.files[index].deleted = true;
				this.mainWindow.webContents.send("load-image");
			}
		}
	});

	ipcMain.on("clipboard-favorite", (e, info) => {
		if (info.type == "text") {
			var index = this.texts.findIndex((e) => e.id == info.id);
			if (index == -1) return;
			this.texts[index].favorite = !this.texts[index].favorite;
			if (!this.texts[index].favorite) {
				var index = this.textsFavorite.findIndex((e) => e.id == info.id);
				if (index == -1) return;
				this.textsFavorite.splice(index, 1);
			} else {
				this.textsFavorite.unshift(this.texts[index]);
			}
		}

		if (info.type == "file") {
			var index = this.files.findIndex((e) => e.id == info.id);
			if (index == -1) return;
			this.files[index].favorite = !this.files[index].favorite;
			if (!this.files[index].favorite) {
				var index = this.filesFavorite.findIndex((e) => e.id == info.id);
				if (index == -1) return;
				this.filesFavorite.splice(index, 1);
			} else {
				this.filesFavorite.unshift(this.files[index]);
			}
		}
	});

	ipcMain.on("clipboard-text", (e, text) => {
		clipboard.writeText(text, "clipboard");
	});

	ipcMain.on("clipboard-file", (e, file) => {
		lib.writeFiles([file]);
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
		var regex = new RegExp(filter);
		var res = [];
		for (let i = 0; i < source.length; i++) {
			if (regex.test(source[i].text)) {
				res.push(source[i]);
			}
		}
		this.mainWindow.webContents.send("get-clipboard-text-search", {
			data: res,
			total: res.length,
			size: this.config.pageSize,
		});
	});

	ipcMain.on("get-clipboard-file-search", (e, info) => {
		var filter = info.filter;
		var source = info.favorite ? this.filesFavorite : this.files;
		var regex = new RegExp(filter);
		var res = [];
		for (let i = 0; i < source.length; i++) {
			if (regex.test(source[i].text)) {
				res.push(source[i]);
			}
		}
		this.mainWindow.webContents.send("get-clipboard-file-search", {
			data: res,
			total: res.length,
			size: this.config.pageSize,
		});
	});
}

module.exports = { ipc };
