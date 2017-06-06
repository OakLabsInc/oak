const oak = require('oak')

oak.on('ready', () => {
  oak.load({
    url: 'file://' + require('path').join(__dirname, 'index.html'),
    fullscreen: false
  })
})
