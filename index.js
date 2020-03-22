const electron = require('electron')
const download = require('./lib/download.js')
const sync = require('./lib/sync.js')
const fs = require('fs')
const { asJSON } = require('./lib/read.js')
const { downloadFile } = download;
const {ipcMain, app, BrowserWindow} = electron

ipcMain.on('sync', async (event, arg) => {
  console.log(arg)
  let url = arg.remote+'/download/sync:files.json'
  let path = 'tmp/files.json'
  await downloadFile(url, path, () => {gotFile(path, arg, event)})
})

async function gotFile(path, arg, event) {
  let remote = await asJSON(path)
  console.log(remote)
  let local
  try {
    local = await asJSON(arg.directory+'/files.json')
  } catch(e) {
    local = []
  }
  console.log(local)
  fs.writeFile(arg.directory+'/files.json', JSON.stringify(remote), (err) => {
    if(err) console.log(err)
  })
  sync(remote, local, arg.remote, arg.directory, event)
}

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('ui/index.html')
}

app.whenReady().then(createWindow)
