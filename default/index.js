const { join } = require('path')
const oak = require(join(__dirname, '..'))

oak.on('ready', () => {
  oak.load({
    url: 'file://' + join(__dirname, 'index.html'),
    fullscreen: false,
    debugger: true
  })
})
