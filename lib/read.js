const fs = require('fs').promises

async function read(file) {
  let data = await fs.readFile(file)
  return data
}

async function asJSON(file) {
  let data = await read(file)
  return JSON.parse(data)
}

module.exports = {
  asJSON,
  read
}
