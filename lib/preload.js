const _ = require('lodash')
const {
  remote: { getCurrentWindow },
  ipcRenderer: ipc, webFrame
} = require('electron')

const { EventEmitter2: _ee } = require('eventemitter2')

let _window = getCurrentWindow()

_ee.prototype.send = function () {
  ipc.send(...['_window', ...arguments])
  return this
}

_ee.prototype.ready = function (msgToLoadCallback) {
  ipc.send('_ready', msgToLoadCallback)
  return this
}

_ee.prototype.hide = function () {
  ipc.send('_hide')
  return this
}

_ee.prototype.show = function () {
  ipc.send('_show')
  return this
}

_ee.prototype.debug = function () {
  ipc.send('_debug')
  return this
}

_ee.prototype.location = function (_url = undefined) {
  ipc.send('_location', _url)
  return this
}

_ee.prototype.reload = function (_cache = true) {
  ipc.send('_reload', _cache)
  return this
}

_ee.prototype.close = function () {
  ipc.send('_close')
  return this
}

_ee.prototype.focus = function () {
  ipc.send('_focus')
  return this
}

_ee.prototype.disableZoom = function () {
  webFrame.setVisualZoomLevelLimits(1, 1)
}

_ee.prototype.id = _window.id

_ee.prototype.webFrame = webFrame

const _oak = new _ee({
  wildcard: true,
  maxListeners: 100,
  newListener: false
})

ipc.emit = function (e, ee, data) {
  _oak.emit(e, data)
}

window.alert = function () {
  handleDialogs('alert', ...arguments)
}
window.confirm = function () {
  handleDialogs('confirm', ...arguments)
}
window.prompt = function () {
  handleDialogs('prompt', ...arguments)
}

function handleDialogs (name, ...args) {
  console.info(`* got window.${name}:`, args)
  ipc.send(name, args)
}

window.oak = _oak

window.oak.once('_scriptsToInject', function (scripts) {
  scripts.forEach(function (val) {
    if (_.has(val, 'name') && _.has(val, 'path')) {
      window[val.name] = require(val.path)
    } else if (_.isString(val)) {
      require(val)
    }
  })
})
