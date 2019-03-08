const { spawn } = require('child_process')

// const trayIcon = nativeImage.createFromPath(path.join(dirname, 'assets/loadingTemplate.png'));
// tray.setImage(trayIcon);

class Command {
  static run(cmd, options = []) {
    return new Promise((resolve, reject) => {
      const command = spawn(cmd, options)
      let result = ''

      command.stderr.on('data', error => reject(error))
      command.stdout.on('data', data => result += data.toString())
      command.on('close', () => resolve(result))
    })
  }
}

module.exports = Command