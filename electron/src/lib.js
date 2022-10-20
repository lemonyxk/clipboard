const { clipboard, dialog } = require("electron");
const fs = require("fs");

function compare(arr1, arr2) {
	if (arr1.length != arr2.length) {
		return false;
	}

	var swap1 = arr1.length > arr2.length ? arr1 : arr2;
	var swap2 = arr1.length > arr2.length ? arr2 : arr1;

	for (let i = 0; i < swap1.length; i++) {
		if (swap1[i] != swap2[i]) return false;
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

	var str = `<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
	<plist version="1.0">
	<array>`;

	for (let i = 0; i < arr.length; i++) {
		str += `<string>` + arr[i] + `</string>`;
	}

	str += `</array>
	</plist>`;

	return str;
}

function readFiles() {
	var fList = [];
	if (process.platform == "darwin") {
		var pList = clipboard.read("NSFilenamesPboardType");
		fList = parsePList(pList);
	} else {
		const clipboardEx = require("electron-clipboard-ex");
		fList = clipboardEx.readFilePaths();
	}
	return fList;
}

function writeFiles(arr) {
	if (arr.length == 0) return;

	fs.stat(arr[0], (err) => {
		if (err) {
			dialog.showErrorBox("Clipboard", arr[0] + " not exists!");
			return;
		}

		if (process.platform == "darwin") {
			var str = formatPList(arr);
			if (str == "") return;
			clipboard.writeBuffer("NSFilenamesPboardType", Buffer.from(str));
		} else {
			const clipboardEx = require("electron-clipboard-ex");
			clipboardEx.writeFilePaths([file]);
		}
	});
}

module.exports = { compare, writeFiles, readFiles };
