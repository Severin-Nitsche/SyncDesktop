const electron = require('electron')
const download = require('./lib/download.js')
const sync = require('./lib/sync.js')
const fs = require('fs')
const reload = require('./lib/reload.js')
const request = require('request')
const preferences = require('./preferences/preferences.json')
const { asJSON } = require('./lib/read.js')
const { downloadFile } = download;
const {ipcMain, app, BrowserWindow} = electron

ipcMain.on('sync', (event, arg) => {
  let data = [];
  reload(arg.directory, data, arg.directory)
  fs.writeFile(arg.directory+'/files.json', JSON.stringify(data), err => {
    if(err) throw err
  })
  let options = {
    url: arg.remote+'/login',
    method: 'POST',
    headers: {
      user: arg.user,
      pwd: arg.password
    }
  }
  request(options, (err, res) => {
    if(err) {
      event.reply('status','Failed to connect')
      return
    }
    event.reply('status','connected')
    let status = res.statusCode
    event.reply('status',`got Status${status}`)
    if(status == 403) event.reply('status','Wrong Credentials')
    else initSync(arg, event, options.headers)
  });
})

ipcMain.on('load', (event, arg) => {
  event.reply('setup',preferences)
})

ipcMain.on('preferences', (event, arg) => {
  fs.writeFile('preferences/preferences.json', JSON.stringify(arg), (err) => {
    if(err) console.log(err)
  })
})

async function initSync(arg, event, header) {
  let url = arg.remote+'/download/sync:files.json'
  let path = 'tmp/files.json'
  await downloadFile(url, path, header, () => {gotFile(path, arg, event, header)})
}

async function gotFile(path, arg, event, header) {
  let remote = await asJSON(path)
  let local
  try {
    local = await asJSON(arg.directory+'/files.json')
  } catch(e) {
    local = []
  }
  fs.writeFile(arg.directory+'/files.json', JSON.stringify(remote), (err) => {
    if(err) console.log(err)
  })
  sync.sync(remote, local, arg.remote, arg.directory, event, header)
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
