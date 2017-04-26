const { app, dialog } = require('electron')

const { inherits } = require('util')
const { join } = require('path')
const { EventEmitter } = require('events')
const { EventEmitter2 } = require('eventemitter2')
const _ = require('lodash')
const tools = require('oak-tools')
const pkg = require(join(__dirname, '..', 'package.json'))

const isProd = process.env.NODE_ENV === 'production'

const message = new EventEmitter2({
  wildcard: true,
  newListener: false,
  maxListeners: 200
})

global.windowModules = []

var Core = function (opts) {
  let _this = this
  EventEmitter.call(this)

  this.ready = false
  this.message = message
  this.version = pkg.version
  this.log = tools.logger({
    level: isProd ? 'error' : 'info',
    pretty: !isProd
  })

  app.on('window-all-closed', function () {
    app.quit()
  })

  app.on('ready', function () {
    _this.ready = true
    _this.emit('ready')
  })

  _this.app = app
  return this
}

inherits(Core, EventEmitter)

Core.prototype.load = function (opts = false, callback = function () {}) {
  if (!opts || !_.isObject(opts)) {
    throw new Error('You need to pass options into Oak as the first parameter.')
  }
  if (!this.ready) {
    throw new Error("Oak isn't ready yet, wait your turn!")
  }

  let Window = require(join(__dirname, 'window'))
  opts = _.defaultsDeep(opts, {
    modules: [],
    flags: []
  })

  opts.flags.forEach(app.commandLine.appendSwitch)

  global.windowModules = _.union(global.windowModules, opts.modules)
  return new Window(this, opts, callback)
}

Core.prototype.catchErrors = function () {
  let _this = this
  // we are (ideally) running without errors on the screen, so we will ignore the dialog box for JS errors
  dialog.showErrorBox = (title, err) => {
    return
  }
  // take on uncaughtExceptions, send them to the logger
  process.on('uncaughtException', err => {
    _this.log.error({ name: 'process.uncaughtException', err })
  })
}

var core = new Core()

module.exports = core
