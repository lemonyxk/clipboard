const { ipcRenderer } = window.require("electron");

// ipcRenderer.send("init-clipboard");
// ipcRenderer.on("init-clipboard", (e, v) => {
// 	data = v;
// 	if (data.length > maxLength) data.splice(maxLength);
// 	isLoad = true;
// 	console.log(isLoad);
// });

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

export { send, on };
