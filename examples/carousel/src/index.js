const { join } = require('path')
const oak = require('oak')

oak.catchErrors()

// main app
oak.on('ready', () => {
  let w = oak.load({
    url: 'file://' + join(__dirname, 'index.html'),
    node: true
  }, function () {
    w.send('settings', require(join(__dirname, 'settings.json')))
  })
})
