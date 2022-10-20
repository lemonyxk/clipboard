import { send, on } from "./ipc";
import { store } from "./store";
import { getCurrentInstance, ref } from "vue";

var maxLength = 1000;

var setting = store.get("setting") || {};
var data = [];
var files = [];
var onList = {};
var config = {
	pin: false,
};

on("mainWindow-focus", (e, v) => {
	setting = store.get("setting") || {};

	subscription.emit("setting", setting);
});

on("mainWindow-blur", (e, v) => {
	if (!config.pin) send("hide-window");
});

function initClipboard(v) {
	data = v;
	if (data.length > maxLength) data.splice(maxLength);
}

function initClipboardFiles(v) {
	files = v;
	if (files.length > maxLength) files.splice(maxLength);
}

on("update-clipboard", (e, v) => {
	data.unshift(v);
	if (data.length > maxLength) data.splice(maxLength);

	subscription.emit("data", v);
});

on("update-clipboard-files", (e, v) => {
	for (let i = 0; i < v.file.length; i++) {
		files.unshift({ file: v.file[i], time: v.time });
	}
	if (files.length > maxLength) files.splice(maxLength);
	subscription.emit("files", v);
});

var subscription = {
	config: () => config,
	setting: () => JSON.parse(JSON.stringify(setting)),
	data: () => {
		var res = [];
		for (let i = 0; i < data.length; i++) {
			res.push(data[i]);
		}
		return res;
	},
	files: () => {
		var res = [];
		for (let i = 0; i < files.length; i++) {
			res.push(files[i]);
		}
		return res;
	},

	wait: () => {
		return new Promise((r, j) =>
			Promise.all([
				send("init-clipboard").then((res) => initClipboard(res)),
				send("init-clipboard-files").then((res) => initClipboardFiles(res)),
			]).then(() => r())
		);
	},

	emit: (event, data) => {
		if (!onList[event]) return;
		for (const key in onList[event]) {
			onList[event][key](data);
		}
	},
	on: (event, fn) => {
		if (!onList[event]) {
			onList[event] = {};
		}
		var name = getCurrentInstance().vnode.component.type.__name;
		onList[event][name] = (...args) => fn(...args);
	},
};

export { subscription };
