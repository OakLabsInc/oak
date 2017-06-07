const _ = require('lodash')
const {
  remote: { getGlobal: _getGlobal },
  ipcRenderer: renderer, webFrame
} = require('electron')

const qs = require('querystring')
const url = require('url')
const { EventEmitter2: _ee } = require('eventemitter2')

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

_ee.prototype.reload = function (_url = false) {
  renderer.send('_reload', _url)
  return this
}

_ee.prototype.proceed = function (_url = false) {
  renderer.send('_proceed', _url)
  return this
}

_ee.prototype.focus = function () {
  renderer.send('_focus')
  return this
}

_ee.prototype.id = qs.parse(url.parse(window.location.href).query).oak_id

_ee.prototype.webFrame = webFrame

const _oak = new _ee({
  wildcard: true,
  maxListeners: 100,
  newListener: false
})

renderer.emit = function (e, ee, data) {
  _oak.emit(e, data)
}

window.oak = _oak

_getGlobal('scripts').forEach(function (val) {
  if (_.has(val, 'name') && _.has(val, 'path')) {
    window[val.name] = require(val.path)
  } else if (_.isString(val)) {
    require(val)
  }
})
