const {
  remote: { getGlobal: _getGlobal },
  ipcRenderer: renderer
} = require('electron')

const { EventEmitter2: _ee } = require('eventemitter2')
const windowModules = _getGlobal('windowModules') || []

windowModules.forEach(function (name) {
  window[name] = require(name)
})

_ee.prototype.send = function () {
  renderer.send(...['_window', ...arguments])
  return this
}

_ee.prototype.ready = function (msgToLoadCallback) {
  renderer.send('_ready', msgToLoadCallback)
  return this
}

_ee.prototype.hide = function () {
  renderer.send('_hide')
  return this
}

_ee.prototype.show = function () {
  renderer.send('_show')
  return this
}

_ee.prototype.debug = function () {
  renderer.send('_debug')
  return this
}

_ee.prototype.reload = function () {
  renderer.send('_reload')
  return this
}

const _oak = new _ee({
  wildcard: true,
  maxListeners: 20,
  newListener: false
})

renderer.emit = function (e, ee, data) {
  _oak.emit(e, data)
}

window.onerror = function (msg, url, line) {
  return _oak.send('logger.error', {
    event: msg,
    err: new Error(`${url}: ${line}`)
  })
}

window.oak = _oak
