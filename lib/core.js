const { app } = require('electron')

const { inherits } = require('util')
const { join } = require('path')
const { EventEmitter } = require('events')
const { EventEmitter2 } = require('eventemitter2')
const _ = require('lodash')

const message = new EventEmitter2({
  wildcard: true,
  newListener: false,
  maxListeners: 200
})

global.windowModules = []

var Core = function (opts) {
  let _this = this
  EventEmitter.call(this)
  opts = _.defaults(opts, {
    flags: []
  })

  this.ready = false
  this.message = message

  opts.flags.forEach(app.commandLine.appendSwitch)

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

  let W = require(join(__dirname, 'window'))

  opts = _.defaultsDeep(opts, {
    modules: []
  })

  global.windowModules = _.union(global.windowModules, opts.modules)
  return new W(this, opts, callback)
}

var core = new Core()

module.exports = core
