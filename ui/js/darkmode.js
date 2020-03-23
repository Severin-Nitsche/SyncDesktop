function toggleDark() {
  ipcRenderer.send('preferences', {dark: document.body.toggleAttribute('dark')})
}

darkmode.addEventListener('click', toggleDark)

ipcRenderer.on('setup', (event, arg) => {
  if(arg.dark) toggleDark()
})

ipcRenderer.send('load')
