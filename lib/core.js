const { app } = require('electron')

const { inherits } = require('util')
const { join } = require('path')
const { EventEmitter } = require('events')
const { EventEmitter2 } = require('eventemitter2')
const async = require('async')
const _ = require('lodash')

const Logger = require(join(__dirname, 'logger'))

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
  this.version = require(join(__dirname, '..', 'package.json')).version
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

  return this
}

inherits(Core, EventEmitter)

Core.prototype.logger = new Logger(message)

Core.prototype.load = function (opts = false, callback) {
  let _this = this

  if (!opts) {
    throw new Error('You need to pass options into Oak as the first parameter.')
  }
  if (!this.ready) {
    throw new Error("Oak isn't ready yet, wait your turn in line!")
  }

  let W = require(join(__dirname, 'window'))

  async.eachSeries(
    _.isArray(opts) ? opts : [opts],
    function (opt, cb) {
      opt = _.defaultsDeep(opt, {
        modules: []
      })
      global.windowModules = _.union(global.windowModules, opt.modules)
      return new W(_this, opt, cb)
    },
    callback
  )
}

var core = new Core()

module.exports = core
