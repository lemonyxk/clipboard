import { send, on } from "./ipc";
import { store } from "./store";
import { getCurrentInstance } from "vue";

var onList = {};
var config = { pin: false, favorite: false };

window.onkeydown = (e) => {
	e.preventDefault();
	subscription.emit("onkeydown", e);
};

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

var subscription = {
	config: () => config,
	setting: () => store.get("setting") || {},

	wait: () => {
		return new Promise((r, j) => r());
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
	remove: (event) => {
		if (!onList[event]) return;
		var name = getCurrentInstance().vnode.component.type.__name;
		delete onList[event][name];
	},
};

export { subscription };
