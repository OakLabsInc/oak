const oak = require('oak')
const { join } = require('path')

const scripts = join(__dirname, 'scripts')

oak.on('ready', () => {
  oak.load({
    url: 'file://' + join(__dirname, 'index.html'),
    scripts: [
      // this will just evaluate the script, you dont have to use module.exports
      join(scripts, 'iev_inject.js'),
      // this will assign the JSON from json_inject.json to window.json_inject in the renderer
      {
        name: 'json_inject',
        path: join(scripts, 'json_inject.json')
      },
      // the module export is a function, which gets assigned to window.module_inject()
      {
        name: 'module_inject',
        path: join(scripts, 'module_inject.js')
      }
    ],
    fullscreen: false
  })
})
