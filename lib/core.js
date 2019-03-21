const { app, dialog, crashReporter } = require('electron')

const { join } = require('path')
const { EventEmitter2 } = require('eventemitter2')
const _ = require('lodash')
const minimatch = require('minimatch')
const pino = require('pino')

class Core extends EventEmitter2 {
  constructor () {
    super({
      wildcard: true,
      newListener: false,
      maxListeners: 200
    })

    let _this = this
    this.ready = false
    this.version = require(join(__dirname, '..', 'package.json')).version

    this.debug = process.env.DEBUG === 'true'

    this.log = pino({
      level: this.debug ? 'debug' : 'error',
      prettyPrint: this.debug ? { colorize: true } : false
    })
    this.crashReporter = crashReporter

    this.app = app
    this.quit = app.quit

    this._sslExceptions = []

    // waiting for SSL certificate errors
    app.on('certificate-error', (event, webContents, url, error, certificate, cb) => {
      let { hostname } = new URL(url)
      let isTrusted = false
      // if we get a match on our
      if (_.filter(_this._sslExceptions, pat => minimatch(hostname, pat))) {
        _this.log.debug({
          name: 'ignoring SSL certificate error',
          url,
          hostname
        })
        event.preventDefault()
        isTrusted = true
      }
      cb(isTrusted)
    })

    app.on('ready', function () {
      _this.ready = true
      _this.emit('ready')
    })

    return this
  }

  set sslExceptions (sslExceptions = []) {
    if (!_.isArray(sslExceptions)) throw new Error(`The 'sslExceptions' property must be an array`)

    // filtering out duplicate and empty array items
    this._sslExceptions = _.compact(_.uniq(sslExceptions))

    return this.sslExceptions
  }

  get sslExceptions () {
    return this._sslExceptions
  }

  quit (code) {
    if (code) {
      this.app.exit(code)
    } else {
      this.app.quit()
    }
    return this
  }

  load (opts = false, callback = function () {}) {
    if (!opts || !_.isObject(opts)) {
      throw new Error('You need to pass options into Oak as the first parameter.')
    }
    if (!this.ready) {
      throw new Error("Oak isn't ready yet, wait your turn!")
    }
    if (!_.isString(opts.url)) {
      throw new Error('Oak requires the option: url')
    }

    let Window = require(join(__dirname, 'window'))

    opts = _.defaultsDeep(opts, {
      scripts: [],
      flags: []
    })

    // Chrome switch flags
    if (!opts.cache) {
      opts.flags.push('--disable-http-cache')
    }

    // Append each cli switch
    opts.flags.forEach(app.commandLine.appendSwitch)

    global.scripts = opts.scripts

    return new Window(this, opts, callback)
  }

  getDisplays () {
    return require('electron').screen.getAllDisplays()
  }

  catchErrors () {
    let _this = this

    // we are (ideally) running without errors on the screen, so we will ignore the dialog box for JS errors
    dialog.showErrorBox = (title, err) => {
      return undefined
    }
    // take on uncaughtExceptions, send them to the logger
    process.on('uncaughtException', err => {
      _this.log.error(err)
      return false
    })

    return this
  }
}

module.exports = Core
