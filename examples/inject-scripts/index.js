const oak = require('oak')
const { join } = require('path')

oak.on('ready', () => {
  oak.load({
    url: 'file://' + require('path').join(__dirname, 'index.html'),
    scripts: [
      // this will assign the JSON from inject_some.json to window.some_json in the renderer
      {
        name: 'some_json',
        path: join(__dirname, 'scripts', 'inject_some.json')
      },
      // the module export is a function, which gets assigned to window.how_cool()
      {
        name: 'how_cool',
        path: join(__dirname, 'scripts', 'how_cool.js')
      },
      // this will just evaluate the script, outside the use of module.exports
      join(__dirname, 'scripts', 'foobar.js')
    ],
    fullscreen: false
  }).debug()
})
