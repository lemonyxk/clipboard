const { app, Menu } = require("electron");

const { isMac, isWin32 } = require("./lib");

function createMenu() {
	if (isMac()) {
		const template = [
			{
				label: "Application",
				submenu: [
					{
						label: "Quit",
						accelerator: "Command+Q",
						click: () => this.quit(),
					},
				],
			},
			{
				label: "Edit",
				submenu: [
					{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
					{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
					{ type: "separator" },
					{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
					{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
					{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
					{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
				],
			},
			{
				label: "Dev",
				submenu: [{ label: "Open Dev Tools", role: "toggleDevTools" }],
			},
		];
		Menu.setApplicationMenu(Menu.buildFromTemplate(template));
	}

	if (isWin32()) {
		// tray flicker
		app.commandLine.appendSwitch("wm-window-animations-disabled");
		Menu.setApplicationMenu(null);
	}
}

module.exports = { createMenu };
