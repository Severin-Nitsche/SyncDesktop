const fs = require('fs')

function index(directory, data, remove) {
  let files = fs.readdirSync(directory)
  files.forEach(file => {
    if(fs.lstatSync(directory+'/'+file).isDirectory()) {
      index(directory+'/'+file, data, remove)
    } else {
      data.push({file: file, directory: directory.replace(remove,''), time: fs.statSync(directory+'/'+file).mtime})
    }
  })
}

module.exports = index
