const { join } = require('path')
const oak = require('oak')

const Hapi = require('hapi')
const inert = require('inert')

// load hapi, serve static files
const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: join(__dirname)
      }
    }
  }
})

server.connection({
  port: process.env.PORT || 9999
})

server.register(inert, () => {})

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true
    }
  }
})

// start hapi
server.start((err) => {
  if (err) {
    throw err
  }
})
oak.catchErrors()
// main app
oak.on('ready', () => {
  let one = oak.load({
    url: 'http://localhost:9999/index.html',
    scripts: ['lodash'],
    fullscreen: true,
    ontop: false
  }).on('switch', switchWindowFocus)

  let two = oak.load({
    url: 'http://localhost:9999/index.html',
    scripts: ['lodash'],
    fullscreen: true,
    ontop: false
  }).on('switch', switchWindowFocus)

  function switchWindowFocus (d) {
    if (one.instance.isFocused()) {
      two.instance.focus()
    } else {
      one.instance.focus()
    }
  }
})
