const { join } = require('path')
const oak = require('oak')

// main app
oak.on('ready', () => {
  let one = oak.load({
    url: 'file://' + join(__dirname, 'one.html'),
    fullscreen: false,
    ontop: false
  })

  let two = oak.load({
    url: 'file://' + join(__dirname, 'two.html'),
    fullscreen: false,
    ontop: false
  })

  // the event has been fired by this windows html via `oak.send()`
  one.on('switch', function () {
    two.focus().send('isFocused')
  })

  two.on('switch', function () {
    one.focus().send('isFocused')
  })
})
