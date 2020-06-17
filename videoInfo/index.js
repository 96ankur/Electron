const electron = require('electron');
const ffmpeg = require('fluent-ffmpeg');

const { app, BrowserWindow, ipcMain } = electron;  // app is the underlying process that will execute our code

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
});

ipcMain.on('video:submit', (event, path) => {
    ffmpeg.ffprobe(path, (error, metadata) => {
        if(error){
            console.log(error);
        } else {
            mainWindow.webContents.send('video:metadata', metadata.format.duration);
        }
    })
});