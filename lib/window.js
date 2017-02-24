const { BrowserWindow, globalShortcut, ipcMain, screen, session } = require('electron')
const { join } = require('path')
const url = require('url')
const async = require('async')
const UUID = require('uuid')
const _ = require('lodash')

var DisplayService = function (core, opts, callback) {
  var _this = this
  _this.window = null
  _this.session = null
  _this.message = core.message

  session.defaultSession.setUserAgent('Oak/' + core.version)

  opts = _.defaultsDeep(opts || {}, {
    title: 'OAK',
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
    wait: false,
    shortcut: {
      reload: false,
      quit: false
    },
    showOnInit: true
  })

  // display
  var displays = screen.getAllDisplays()

  var display = opts.display > displays.length - 1 ? displays[0] : displays[opts.display]

  if (opts.fullscreen) {
    opts.width = display.workArea.width
    opts.height = display.workArea.height
  }

  _this.opts = opts

  function createBrowserContext (cb) {
    _this.window = new BrowserWindow({
      title: opts.title,
      webPreferences: {
        nodeIntegration: false,
        allowDisplayingInsecureContent: opts.insecure,
        allowRunningInsecureContent: opts.insecure,
        preload: join(__dirname, 'preload')
      },
      width: opts.width,
      height: opts.height,
      x: opts.x,
      y: opts.y,
      alwaysOnTop: opts.ontop,
      backgroundColor: opts.background,
      frame: opts.frame,
      thickFrame: opts.frame,
      kiosk: opts.fullscreen,
      fullscreen: opts.fullscreen,
      show: opts.showOnInit
    })
    core.message.emit('logger.debug', {
      event: 'window.create',
      opts
    })
    cb()
  }

  function startWindow (cb = function () {}) {
    // bind the window namespace for events to this BrowserWindow
    core.message.on(`window.**`, function () {
      _this.window.webContents.send(...[this.event, ...arguments])
    })

    _this.window.once('ready-to-show', () => {
      if (opts.shortcut.reload) {
        globalShortcut.register('CommandOrControl+Shift+R', () => _this.window.isFocused() && ipcMain.emit('reload'))
      }
      if (opts.shortcut.quit) {
        globalShortcut.register('CommandOrControl+Shift+X', () => _this.window.isFocused() && _this.window.close())
      }
    })

    _this.window.on('closed', () => { _this.window = null })

    var preprocUrl = _url => {
      return url.parse(_url).format()
    }

    var loadPage = (_newUrl = false) => {
      let urlToLoad = _newUrl
      if (_.isFunction(opts.url)) {
        opts.url(_url => {
          urlToLoad = _url
          return urlToLoad
        })
      } else if (!_newUrl) {
        urlToLoad = opts.url
      }
      _this.window.loadURL(preprocUrl(urlToLoad))
      core.message.emit('window.reloaded', urlToLoad)
    }

    var setCurrentSession = (id) => {
      _this.session = id
      if (!_.isUndefined(core.logger)) {
        core.logger().setMetadata({
          session: id
        })
      }
    }

    var startNewSession = (id = UUID.v4()) => setCurrentSession(id)

    startNewSession()

    _this.window.on('did-fail-load', function (err) {
      core.message.emit('window.loadFailed', { opts, err })
      core.message.emit('logger.error', {
        event: 'window.loadFailed',
        opts,
        err
      })
    })

    // browser oak.reload() event binding
    ipcMain.on('reload', () => {
      // start new session
      startNewSession()
      if (opts.wait) {
        // wait for proceed event to reload
        core.message.once('window.proceed', function (newUrl) {
          loadPage(newUrl)
        })
      } else {
        loadPage()
      }
      core.message.emit('window.reloading')
    })

    // IPC messaging from preload
    ipcMain.on('window', function () {
      core.message.emit(...[...arguments].splice(1, arguments.length))
    })

    ipcMain.on('debug', () => {
      _this.window.openDevTools()
    })

    ipcMain.on('hide', () => {
      _this.window.hide()
    })

    ipcMain.on('show', () => {
      _this.window.show()
    })

    ipcMain.on('ready', () => {
      core.message.emit('window.session', _this.session)
      cb()
    })

    loadPage()
  }

  async.series([
    createBrowserContext,
    startWindow
  ], callback)
}

module.exports = DisplayService
