import { send, on } from "./ipc";
import { store } from "./store";
import { getCurrentInstance } from "vue";

var onList = {};
var config = { pin: false, favorite: false };
var setting = store.get("setting") || {};
var key = true;

on("setting", (e, v) => {
	setting = v;
	subscription.emit("setting", v);
});

on("mainWindow-hide", (e, v) => {
	subscription.emit("mainWindow-hide");
});

on("mainWindow-focus", (e, v) => {
	subscription.emit("mainWindow-focus");
});

on("mainWindow-blur", (e, v) => {
	subscription.emit("mainWindow-blur");
	if (!config.pin) send("hide-window");
});

on("update-clipboard-text", (e, v) => {
	subscription.emit("data", v);
});

on("update-clipboard-file", (e, v) => {
	subscription.emit("file", v);
});

on("keyDown", (e, v) => {
	if (!key) return;
	subscription.emit("onkeydown", v);
});

on("keyUp", (e, v) => {
	if (!key) return;
	subscription.emit("onkeyup", v);
});

var subscription = {
	config: () => config,
	setting: () => setting,
	startKey: () => (key = true),
	stopKey: () => (key = false),

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
		var name = getCurrentInstance()?.vnode.component.type.__name;
		if (!name) return;
		onList[event][name] = (...args) => fn(...args);
	},
	remove: (event) => {
		if (!onList[event]) return;
		var name = getCurrentInstance()?.vnode.component.type.__name;
		if (!name) return;
		delete onList[event][name];
	},
};

export { subscription };
