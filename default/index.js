const oak = require('oak')
const { join } = require('path')

oak.logger()

oak.on('ready', () => {
  oak.load({
    url: 'file://' + join(__dirname, 'index.html'),
    fullscreen: false,
    debugger: true
  })
})
