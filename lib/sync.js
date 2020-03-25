const fs = require('fs')
const read = require('./read.js')
const download = require('./download.js')
const { downloadFile } = download;

function compare(item1, item2) {
  if(!item2) return false
  return item1.file == item2.file && item1.directory == item2.directory && item1.time == item2.time
}

function contains(item, set) {
  for(file in set) {
    if(compare(file, item)) return true
  }
  return false
}

function get(item, set) {
  for(let i=0; i<set.length; i++) {
    let datum = set[i]
    if(datum.file == item.file && datum.directory == item.directory) return datum
  }
}

function need(item, local, info) {
  let localItem = get(item, local)
  if(localItem == undefined) {
    console.log(`need ${item.file} because it is not in local`)
    return true
  }
  else {
    let infoItem = get(item, info)
    if(infoItem == undefined) {
      console.log(`need ${item.file} because it is not in info`)
      return true
    }
    else if(infoItem.time_remote != item.time || infoItem.time_local != localItem.time) {
      return true
    }
    else return false
  }
}

function simplify(path, removeFirst = true, addLast = true) {
  if(addLast) {
    if(!path.endsWith('/')) path = path+'/'
  } else {
    if(path.endsWith('/')) path = path.substring(0,path.length-1)
  }
  return removeFirst&&path.startsWith('/')?path.substring(1):path;
}

async function info(remote, local, url, dir, event, header) {
  dir = simplify(dir, false)

  let infoPath = `${dir}info.json`

  let info = [];

  if(fs.existsSync(infoPath)) {
    info = await read.asJSON(infoPath)
  }

  let count = 0

  remote.forEach((item, i) => {
    if(need(item, local, info)) {
      if(item.file != 'files.json') count++;
    }
  });

  return count;
}

async function sync(remote, local, url, dir, event, header) {
  dir = simplify(dir, false)

  let infoPath = `${dir}info.json`

  let info = [];

  if(fs.existsSync(infoPath)) {
    info = await read.asJSON(infoPath)
  }

  remote.forEach((item, i) => {
    if(need(item, local, info)) {
      let path = simplify(item.directory)
      let lpath = dir + path;
      path = path.split('/').join(':')

      if (!fs.existsSync(lpath)){
          fs.mkdirSync(lpath, {recursive: true});
      }

      path += simplify(item.file, true, false)
      lpath += simplify(item.file, true, false)

      downloadFile(
        `${url}/download/sync:${path}`,
        lpath,
        header,
        () => {
          let datum = get(item,info)
          if(datum == undefined) {
            info.push(
              {
                file: item.file,
                directory: item.directory,
                time_remote: item.time,
                time_local: fs.statSync(lpath).mtime
              }
            )
          } else {
            datum.time_remote = item.time
            datum.time_local = fs.statSync(lpath).mtime
          }
          fs.writeFileSync(infoPath, JSON.stringify(info), err => {if(err) throw err})
          event.reply('status','done')
        },
        () => {
          event.reply('status','syncing...')
        }
      )


    }
  });
}

module.exports = {
  sync,
  info
}
