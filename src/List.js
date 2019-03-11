const { clipboard, dialog, Menu } = require('electron')

const Tray = require('./ContainerTray')
const Container = require('./Container')
const Command = require('./Command')

class List {
  constructor() {
    this.separator = { type: 'separator' }
    this.defaultLabels = [
      { label: 'Container PS', enabled: false },
      this.separator,
      { label: 'Reload List', accelerator: 'CmdOrCtrl+R', click: () => this.update() },
      { label: 'Quit', role: 'quit', accelerator: 'CmdOrCtrl+Q' },
      this.separator
    ]
    this.tray = new Tray(Menu.buildFromTemplate([
      ...this.defaultLabels, 
      { label: 'Container PS is loading...', enabled: false }
    ]))
    this.iconType = {
      up: this.tray.getImageLink('up'),
      restarting: this.tray.getImageLink('restarting'),
      down: this.tray.getImageLink('down')
    }
  }

  async update() {
    this.tray.setLoading()
    const labels = await this.getContainerLabels()
    const menu = Menu.buildFromTemplate(labels)

    this.tray.setMenu(menu)
    this.tray.setIcon('idle')
  }

  async getContainerLabels() {
    let labels = []
    let containers = []

    labels = labels.concat(this.defaultLabels)

    try {
      const result = await Command.run('docker', ['ps', '-a', '-s'])
      const lines = result.toString().split('\n')

      lines.shift()
      lines.pop()
      lines.forEach(line => containers.push(new Container(line)))

      containers.sort((current, next) => {
        if (current.isUp() && next.isUp()) return 0
        else if (current.isUp() && !next.isUp()) return -1
        else return 1
      })

      containers.forEach(container => {
        labels.push({
          label: container.name,
          icon: this.iconType[container.getLivingInfo()],
          type: 'submenu',
          submenu: [
            { label: 'Id: ' + container.id, enabled: false },
            { label: 'Name: ' + container.name, enabled: false },
            { label: 'Entry Point: ' + container.entrypoint, enabled: false },
            { label: 'Created: ' + container.mountedAt, enabled: false },
            { label: 'Info: ' + container.mountedInfo, enabled: false },
            { label: 'Ports: ' + container.ports, enabled: false },
            { label: 'Image: ' + container.image, enabled: false },
            { label: 'Size: ' + container.size, enabled: false },
            this.separator, {
              label: (container.isUp() ? 'Stop Container' : 'Start Container'),
              id: container.id,
              click: async event => {
                this.tray.setLoading()
                await Command.run('docker', [container.isUp() ? 'stop' : 'start', event.id])
                this.update()
              }
            }, {
              label: 'Restart Container',
              id: container.id,
              click: async event => {
                this.tray.setLoading()
                await Command.run('docker', ['restart', event.id])
                this.update()
              }
            }, this.separator, {
              label: 'Copy ID Container',
              id: container.id,
              click: event => clipboard.writeText(event.id)
            }, this.separator, {
              label: 'Delete Container',
              id: container.id,
              click: async event => {
                const response = await dialog.showMessageBox({
                  type: 'warning',
                  buttons: [ 'No', 'Yes' ],
                  title: 'Do you really want to delete this container?',
                  message: 'Do you really want to delete this container?',
                  detail: 'This container will be deleted permanently and it will no longer be possible to recover it'
                })

                if(!response) return

                this.tray.setLoading()
                await Command.run('docker', ['stop', event.id])
                await Command.run('docker', ['rm', event.id])
                this.update()
              }
            }
          ]
        })
      })

      return labels
    }
    catch (error) {
      labels.push({ label: 'We can\'t get the container list back. Is Docker on?' })
  
      error
        .toString()
        .match(/.{1,35}/g)
        .forEach(el => labels.push({ label: el, enabled: false }))

      return labels
    }
  }
}

module.exports = List