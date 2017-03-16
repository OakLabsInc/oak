const { BrowserWindow, globalShortcut, ipcMain, screen, session } = require('electron')
const { join } = require('path')
const url = require('url')
const UUID = require('uuid')
const _ = require('lodash')
const { EventEmitter2 } = require('eventemitter2')

class DisplayService extends EventEmitter2 {
  constructor (core, opts, callback) {
    super({
      wildcard: true,
      newListener: false
    })
    let _this = this
    this.instance = null
    this.session = UUID.v4()
    this.ready = false

    this.opts = _.defaultsDeep(opts || {}, {
      title: 'OAK',
      userAgent: 'Oak/' + core.version,
      display: 0,
      width: 1024,
      height: 768,
      x: 0,
      y: 0,
      background: '#000000',
      fullscreen: true,
      ontop: true,
      frame: false,
      modules: [],
      shortcut: {
        reload: false,
        quit: false
      },
      show: true,
      insecure: false,
      waitForUrl: false
    })

    session.defaultSession.setUserAgent(this.opts.userAgent)

    let displays = screen.getAllDisplays()
    this.display = this.opts.display > displays.length - 1 ? displays[0] : displays[this.opts.display]

    if (this.opts.fullscreen) {
      this.opts.width = this.display.workArea.width
      this.opts.height = this.display.workArea.height
    }

    this.instance = new BrowserWindow({
      title: _this.opts.title,
      webPreferences: {
        nodeIntegration: false,
        allowDisplayingInsecureContent: _this.opts.insecure,
        allowRunningInsecureContent: _this.opts.insecure,
        preload: join(__dirname, 'preload')
      },
      width: _this.opts.width,
      height: _this.opts.height,
      x: _this.opts.x,
      y: _this.opts.y,
      alwaysOnTop: _this.opts.ontop,
      backgroundColor: _this.opts.background,
      frame: _this.opts.frame,
      kiosk: _this.opts.fullscreen,
      fullscreen: _this.opts.fullscreen,
      fullscreenable: _this.opts.fullscreen,
      show: _this.opts.show
    })

    if (opts.shortcut.reload) {
      globalShortcut.register('CommandOrControl+Shift+R', () => {
        return _this.instance.isFocused() && _this.reload()
      })
    }
    if (opts.shortcut.quit) {
      globalShortcut.register('CommandOrControl+Shift+X', () => {
        _this.instance.isFocused() && _this.instance.close()
      })
    }

    this.instance
      .on('closed', () => { _this.instance = null })
      .on('did-fail-load', function (err) {
        _this.emit('loadFailed', { opts: _this.opts, err })
      })

    ipcMain
      // Anything fired from window will get emitted on this object, without the _window namespace.
      // This is how oak.emit() works transparently.
      .on('_window', function () {
        _this.emit(...[...arguments].splice(1, arguments.length))
      })
      .on('_reload', _this.reload)
      .on('_debug', _this.debug)
      .on('_hide', _this.hide)
      .on('_show', _this.show)
      .on('_ready', function (ev, msg) {
        callback(msg)
      })

    // anything in emitted to oak.message under the window.** namespace will be sent to the client side
    core.message.on(`window.**`, function () {
      _this.instance.webContents.send(...[this.event, ...arguments])
    })

    this.loadPage()

    return this
  }

  loadPage (_newUrl = false) {
    let urlToLoad = _newUrl
    if (_.isFunction(this.opts.url)) {
      this.opts.url(_url => {
        urlToLoad = _url
        return urlToLoad
      })
    } else if (!urlToLoad) {
      urlToLoad = this.opts.url
    }
    this.instance.loadURL(url.parse(urlToLoad).format())
    return this
  }

  newSession (id = UUID.v4()) {
    this.session = id
    return this.session
  }

  reload () {
    let _this = this
    // save the old session
    let oldSession = this.session
    // start new session
    this.newSession()
    if (this.opts.waitForUrl) {
      // wait for proceed event to reload
      this.once('proceed', function (newUrl) {
        _this.loadPage(newUrl)
      })
    } else {
      this.instance.reload()
    }
    this.emit('reloading', oldSession, this.session)
    return this
  }

  debug () {
    this.instance.openDevTools()
    return this
  }

  hide () {
    this.instance.hide()
    return this
  }

  show () {
    this.instance.show()
    return this
  }
}

module.exports = DisplayService
