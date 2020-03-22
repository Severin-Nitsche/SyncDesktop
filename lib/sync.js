const fs = require('fs')
const download = require('./download.js')
const { downloadFile } = download;

function compare(item1, item2) {
  if(!item2) return false
  return item1.file == item2.file && item1.directory == item2 && item1.time == item2.time
}

function sync(remote, local, url, dir) {
  console.log('Sync')
  console.log(remote)
  console.log(local)
  console.log(url)
  console.log(dir)
  remote.forEach((item, i) => {
    if(!compare(item,local[i])) {
      let path = item.directory+item.file
      path = path.split('/').join(':')
      console.log(path)
      console.log(dir+item.directory)
      let lpath = dir;
      if(dir.endsWith('/')) {
        if(item.directory.startsWith('/')) {
          lpath += item.directory.substring(1)
        } else {
          lpath += item.directory
        }
      } else {
        if(item.directory.startsWith('/')) {
          lpath += item.directory;
        } else {
          lpath += '/'+item.directory
        }
      }

      if (!fs.existsSync(lpath)){
          fs.mkdirSync(lpath, {recursive: true});
      }

      downloadFile(url+'/download/sync:'+path,lpath+item.file)
    }
  });
}

module.exports = sync
