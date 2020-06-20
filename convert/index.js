const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const { result } = require('lodash');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(`file://${__dirname}/src/index.html`);
})

ipcMain.on("videos:added", (event, videos) => {
    const promises = _.map(videos, video => {
            return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(video.path, (err, metadata) => {
                    if(err) reject(err);
                    else resolve({
                        ...video,
                        duration: metadata.format.duration,
                        format: 'avi'
                    });
                });
            });
        });
    
    Promise.all(promises)
           .then(results => {
               mainWindow.webContents.send('metadata:completed', results);
           })
});

ipcMain.on("conversion:start", (event, videoData) => {
    let videos = Object.values(videoData);

    _.each(videos, video =>{
        const outPutDirectory = video.path.split(video.name)[0];
        const outputName = video.name.split('.')[0];
        const outputPath = `${outPutDirectory}${outputName}.${video.format}`
    
        ffmpeg(video.path)
            .output(outputPath)
            .on('progress', ({timemark}) => mainWindow.webContents.send('conversion:progress', {video, timemark}))
            .on('end', () => mainWindow.webContents.send('conversion:end', { video, outputPath}))
            .run();
    });
});