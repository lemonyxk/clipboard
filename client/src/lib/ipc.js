const { ipcRenderer } = window.require("electron");

var send = (event, args) => {
	ipcRenderer.send(event, args);
	return {
		then: (fn) => new Promise((r, j) => ipcRenderer.once(event, (e, v) => r(v))).then((res) => fn(res)),
	};
};

var on = (event, fn) => {
	ipcRenderer.removeAllListeners(event);
	ipcRenderer.on(event, (e, v) => fn(e, v));
};

var remove = (event) => {
	ipcRenderer.removeAllListeners(event);
};

export { send, on, remove };
