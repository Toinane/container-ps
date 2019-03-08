const { app, dialog } = require('electron')
const List = require('./List')

// Fix GUI apps on macOS doesn't inherit the $PATH defined in your dotfiles
require('fix-path')()

app.on('will-finish-launching', () => {
  app.disableHardwareAcceleration()
  if (process.platform === 'darwin') app.dock.hide()
})

app.on('ready', async () => {
  try {
    const list = new List()
    await list.update()
  }
  catch (error) {
    console.log(error)
    dialog.showErrorBox('Container PS Error', error.toString())
  }
})