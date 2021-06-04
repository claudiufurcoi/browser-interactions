const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const url = require("url");

let win;

function createWindow() {
	win = new BrowserWindow(
		{
			width: 1980, height: 1080,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			}
		}
	);

	// load the dist folder from Angular
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, '/dist/index.html'),
			protocol: "file:",
			slashes: true
		})
	);

	// win.webContents.openDevTools();


	win.on("closed", () => {
		win = null;
	});
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});


ipcMain.on("loadJson", (event, path) => {
	win.webContents.send("loadFile");
});
