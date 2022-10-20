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

function writeFiles(arr) {
	if (arr.length == 0) return;

	fs.stat(arr[0], (err) => {
		if (err) {
			dialog.showErrorBox("Clipboard", arr[0] + " not exists!");
			return;
		}

		var str = formatPList(arr);
		if (str == "") return;

		clipboard.writeBuffer("NSFilenamesPboardType", Buffer.from(str));
		// clipboard.writeBuffer("NSStringPboardType", Buffer.from("hello world"));
	});
}

module.exports = { formatPList, parsePList, compare, writeFiles };

// clipboard.writeBuffer("public.utf8-plain-text", Buffer.from(`hello world`));

// clipboard.readBuffer('CF_HDROP').toString('ucs2')
// var files = clipboard.read("NSFilenamesPboardType");
// console.log(files);

// var nImg = clipboard.readImage("clipboard");
// if (nImg.isEmpty()) return;
// if (img != nImg.toDataURL()) {
// 	img = nImg.toDataURL();
// 	image.unshift({ img, time: Date.now() });
// 	if (image.length > maxLength) image.splice(maxLength);
// 	this.mainWindow.webContents.send("update-clipboard-image", { img, time: Date.now() });
// }
