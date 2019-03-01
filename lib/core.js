const { app, dialog, crashReporter } = require('electron')

const { join } = require('path')
const { EventEmitter2 } = require('eventemitter2')
const _ = require('lodash')
const minimatch = require('minimatch')
const { parse } = require('url')
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

    this.debug = process.env.OAK_DEBUG === 'true'
    this.log = pino({
      level: this.debug ? 'debug' : 'error',
      prettyPrint: this.debug ? { colorize: true } : false
    })
    this.crashReporter = crashReporter

    this.app = app
    this.quit = app.quit

    this.sslExceptions = []

    app.on('certificate-error', (event, webContents, url, error, certificate, cb) => {
      let { host } = parse(url)
      let isTrusted = false
      if (_.filter(_this.sslExceptions, pat => minimatch(host, pat))) {
        _this.log.debug({
          name: 'ignoring SSL certificate error',
          url,
          host
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

    this.sslExceptions = _.uniq(
      _.union(
        this.sslExceptions,
        opts.sslExceptions
      )
    )

    // Chrome switch flags
    if (!opts.cache) {
      opts.flags.push('--disable-http-cache')
    }

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
