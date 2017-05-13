const { BrowserWindow, globalShortcut, ipcMain, screen, session } = require('electron')
const { join } = require('path')
const url = require('url')
const UUID = require('uuid')
const _ = require('lodash')
const { EventEmitter2 } = require('eventemitter2')
const append = require('append-query')

class DisplayService extends EventEmitter2 {
  constructor (core, opts, callback = function () {}) {
    super({
      wildcard: true,
      newListener: false,
      maxListeners: opts.maxListeners || 500
    })
    let _this = this
    this.instance = null
    this.session = UUID.v4()
    this.callback = callback

    this.opts = _.defaultsDeep(opts || {}, {
      title: 'OAK',
      userAgent: 'Oak/' + core.version,
      node: false,
      display: 0,
      width: 1024,
      height: 768,
      x: 0,
      y: 0,
      background: '#000000',
      fullscreen: true,
      kiosk: false,
      ontop: true,
      frame: false,
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
        nodeIntegration: _this.opts.node,
        webSecurity: !_this.opts.insecure,
        allowDisplayingInsecureContent: _this.opts.insecure,
        allowRunningInsecureContent: _this.opts.insecure,
        preload: join(__dirname, 'preload')
      },
      width: _this.opts.width,
      height: _this.opts.height,
      x: _this.opts.x,
      y: _this.opts.y,
      hasShadow: false,
      alwaysOnTop: _this.opts.ontop,
      backgroundColor: _this.opts.background,
      frame: _this.opts.frame,
      kiosk: _this.opts.kiosk,
      show: _this.opts.show
    })

    this.id = this.instance.id

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
      .on('_window', function () {
        filterWindow(...[_this.emit, ...arguments])
      })
      .on('_reload', function () {
        filterWindow(...[_this.reload, ...arguments])
      })
      .on('_debug', function () {
        filterWindow(...[_this.debug, ...arguments])
      })
      .on('_hide', function () {
        filterWindow(...[_this.hide, ...arguments])
      })
      .on('_show', function () {
        filterWindow(...[_this.show, ...arguments])
      })
      .on('_focus', function () {
        filterWindow(...[_this.focus, ...arguments])
      })
      .on('_proceed', function () {
        filterWindow(...[_this.proceed, ...arguments])
      })
      .on('_ready', function () {
        filterWindow(...[_this.ready, ...arguments])
      })

    function filterWindow (fn, ev) {
      if (ev.sender.id === _this.id) {
        fn.call(_this, ...[...arguments].splice(2, arguments.length))
      }
    }

    // anything in emitted to oak.message under the window.** namespace will be sent to the client side
    core.message.on(`windows.**`, function () {
      _this.send(this.event, ...arguments)
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
    this.instance.loadURL(
      append(url.parse(urlToLoad).format(), {
        oak_id: this.id
      })
    )
    return this
  }

  newSession (_id = UUID.v4()) {
    this.session = _id
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

  ready () {
    let _this = this
    this.emit('ready')
    this.callback.call(_this, null)
    return this
  }

  send () {
    if (arguments.length > 0) {
      this.instance.webContents.send(...[...arguments])
      return this
    } else {
      return new Error('You must specify an event name as the first parameter')
    }
  }

  proceed (_url) {
    this.emit('proceed', _url)
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

  focus () {
    this.instance.focus()
    return this
  }
}

module.exports = DisplayService
