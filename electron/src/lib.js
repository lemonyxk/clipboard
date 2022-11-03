const { clipboard, dialog, nativeImage } = require("electron");
const fs = require("fs");
const path = require("path");

const icon = nativeImage.createFromPath(path.join(__dirname, "copyTemplate.png"));

function showMessage(message) {
	return dialog.showMessageBox(null, { message, type: "info", icon: icon });
}

var exportDataFlag = false;
function exportData() {
	if (exportDataFlag) return;
	exportDataFlag = true;
	dialog
		.showSaveDialog(null, {
			title: "Export Data",
			defaultPath: `clipboard-${new Date().toISOString()}.json`,
		})
		.then((f) => {
			fs.writeFileSync(
				f.filePath,
				JSON.stringify({
					texts: this.texts,
					files: this.files,
					textsFavorite: this.textsFavorite,
					filesFavorite: this.filesFavorite,
				})
			);

			lib.showMessage("Export Data Success");
		})
		.finally(() => {
			exportDataFlag = false;
		});
}

var importDataFlag = false;
function importData() {
	if (importDataFlag) return;
	importDataFlag = true;
	dialog
		.showOpenDialog({
			title: "Import Data",
			properties: ["openFile"],
		})
		.then((f) => {
			var str = fs.readFileSync(f.filePaths[0]).toString();
			var res = JSON.parse(str);
			this.texts = res.texts;
			this.files = res.files;
			this.textsFavorite = res.textsFavorite;
			this.filesFavorite = res.filesFavorite;
		})
		.finally(() => {
			importDataFlag = false;
		});
}

function compare(arr1, arr2) {
	if (arr1.length != arr2.length) {
		return false;
	}

	var obj = {};
	for (let i = 0; i < arr1.length; i++) {
		obj[arr1[i]] = true;
	}

	for (let i = 0; i < arr2.length; i++) {
		if (!obj[arr2[i]]) {
			return false;
		}
	}

	return true;
}

function parsePList(str) {
	var start = str.indexOf("<array>");
	var end = str.indexOf("</array>");

	if (start == -1 || end == -1) return [];

	var arr = str.slice(start + 7, end).split("\n");
	var res = [];
	for (let i = 0; i < arr.length; i++) {
		var r = arr[i].trim();
		if (!r) continue;
		res.push(r.replace("<string>", "").replace("</string>", ""));
	}

	return res;
}

function formatPList(arr) {
	if (arr.length === 0) return "";

	var format = "";
	for (let i = 0; i < arr.length; i++) {
		format += `<string>` + arr[i] + `</string>\n`;
	}

	var str =
		`<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
	<plist version="1.0">
	<array>
		` +
		format +
		`
	</array>
	</plist>`;

	return str;
}

var clipboardEx = null;

function readFiles() {
	var fList = [];
	if (process.platform == "darwin") {
		var pList = clipboard.read("NSFilenamesPboardType");
		fList = parsePList(pList);
	} else {
		if (clipboardEx == null) {
			clipboardEx = require("electron-clipboard-ex");
		}
		fList = clipboardEx.readFilePaths();
	}
	return fList;
}

function writeFiles(arr) {
	if (arr.length == 0) return;

	fs.stat(arr[0], (err) => {
		if (err) {
			showMessage("Clipboard", arr[0] + " Not Exists");
			return;
		}

		if (process.platform == "darwin") {
			var str = formatPList(arr);
			if (str == "") return;
			clipboard.writeBuffer("NSFilenamesPboardType", Buffer.from(str));
		} else {
			if (clipboardEx == null) {
				clipboardEx = require("electron-clipboard-ex");
			}
			clipboardEx.writeFilePaths(arr);
		}
	});
}

function isWin32() {
	return process.platform == "win32";
}

function isMac() {
	return process.platform == "darwin";
}

module.exports = { compare, writeFiles, readFiles, showMessage, isWin32, isMac, importData, exportData };
