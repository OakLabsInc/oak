const {
  remote: { getGlobal: _getGlobal },
  ipcRenderer: _ipc
} = require('electron')

const { EventEmitter2: _ee } = require('eventemitter2')
const windowModules = _getGlobal('windowModules') || []

windowModules.forEach(function (name) {
  window[name] = require(name)
})

_ee.prototype.send = function () {
  _ipc.send(...['window', ...arguments])
  return this
}

_ee.prototype.ready = function () {
  _ipc.send('ready')
  return this
}

_ee.prototype.hide = function () {
  _ipc.send('hide')
  return this
}

_ee.prototype.show = function () {
  _ipc.send('show')
  return this
}

_ee.prototype.debug = function () {
  _ipc.send('debug')
  return this
}

_ee.prototype.reload = function () {
  _ipc.send('reload')
  return this
}

const _oak = new _ee({
  wildcard: true,
  maxListeners: 20,
  newListener: false
})

_ipc.emit = function (e, ee, data) {
  _oak.emit(e, data)
}

window.onerror = function (msg, url, line) {
  return _oak.send('logger.error', {
    event: msg,
    err: new Error(`${url}: ${line}`)
  })
}

window.oak = _oak
