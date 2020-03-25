ipcRenderer.on('status', (event, arg) => {
  document.querySelector('#status').innerHTML = arg
})

function sync() {
  document.querySelector('#status').innerHTML = 'syncing..'
  ipcRenderer.send('sync', {remote: remote.value, directory: directory.value, user: user.value, password: password.value})
}
