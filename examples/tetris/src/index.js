const { join } = require('path')
const oak = require('oak')

const tools = require('oak-tools')
const logger = tools.logger
const WsServer = tools.server('websocket')

const Hapi = require('hapi')
const inert = require('inert')

let log = logger({
  level: 'info',
  pretty: true
})

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

// websocket server

let wss = new WsServer({
  server: server.listener
})

wss
  .on('error', function (err) {
    log.error('* client error', err)
  })
  .on('connection', function (ID) {
    log.info('* client connection: ', ID)
  })
  .on('reconnect', function (ID) {
    log.info('* client reconnect: ', ID)
  })
  .on('close', function (ID) {
    log.info('* client closed', ID)
  })
  .on('window.**', function (data, ID) {
    console.log(this.event, data)
    oak.message.emit(this.event, data)
  })

// any client.** message, we just publish to clients, stripping off the client name
oak.message.on('client.**', function (data) {
  let ev = this.event.replace('client.', '')
  wss.pub(ev, data)
})

// start hapi
server.start((err) => {
  if (err) {
    throw err
  }
})

// main app
oak.on('ready', () => {
  let window = oak.load({
    // load our local server as the url
    url: 'http://localhost:9999/index.html',
    // we want to use lodash in the client side
    modules: ['lodash'],
    fullscreen: false,
    shortcut: {
      reload: true,
      quit: true
    },
    // this waits to show the window until we fire the 'proceed' event
    waitForUrl: true
  }, function (msg) {
    // our clint side called oak.ready(msg)
    log.info({
      name: 'window said',
      msg
    })
  })
  // lets wait to show the window when reloaded, incase we need to do some cleanup or send a new URL
  .on('reloading', function () {
    log.info('we are reloading now')
    // do cleanup here, before the window reloads
    window.emit(
      'proceed'
      //, 'http://mynewurl.com/' // optional new url to load
    )
  })
  // .debug() // uncomment to open the debugger on launch
})
