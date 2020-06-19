const path = require('path');
const electron =  require('electron');
const TimmerTray = require('./app/timmer_tray');
const MainWindow = require('./app/mainWindow');
const { app, ipcMain } = electron;

let mainWindow;
let tray;

app.on('ready', () => {
    mainWindow = new MainWindow(`file://${__dirname}/src/index.html`);

    const iconName = process.platform === 'win32' ? 'iconTemplate.png' : 'windows-icon.png';
    const iconPath = path.join(__dirname, `./src/assets/${iconName}`);
    tray = new TimmerTray(iconPath, mainWindow);
})

ipcMain.on('update-timer', (event, timeLeft) => {
    tray.setTitle(timeLeft);
})