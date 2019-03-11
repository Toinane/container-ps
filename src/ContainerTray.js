const path = require('path')

const { Tray, nativeImage } = require('electron')

class ContainerTray {
  constructor(menu) {
    this.tray = new Tray(this.getImageLink('idle'))
    this.tray.setToolTip('Container PS')
    this.isLoading = false
    this.setMenu(menu)
  }

  setIcon(type) {
    this.isLoading = false
    this.tray.setImage(this.getImageLink(type))
  }

  setMenu(menu) {
    this.tray.setContextMenu(menu)
  }

  getImageLink(link) {
    return nativeImage.createFromPath(path.join(__dirname, 'assets/' + link + 'Template.png'))
  }

  setLoading() {
    if(this.isLoading) return

    this.isLoading = true
    this.loadingAnimation(0, false)
  }

  loadingAnimation(step, decrement) {
    if(!this.isLoading) return

    this.tray.setImage(this.getImageLink('loading-' + step))
    if (step >= 4) decrement = true
    else if (step <= 0) decrement = false

    if(decrement) step--
    else step++

    setTimeout(() => this.loadingAnimation(step, decrement), 150)
  }
}

module.exports = ContainerTray