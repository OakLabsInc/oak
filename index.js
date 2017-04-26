#!/usr/bin/env node

const { resolve, join } = require('path')
const Module = require('module')
const _ = require('lodash')
const program = require('commander')
const { version } = require(join(__dirname, 'package.json'))

// oak gets loaded from this path
const corePath = join(__dirname, 'lib', 'core.js')

// resolve future require('oak') to our core path
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request) {
  return request === 'oak' ? corePath : origResolve(...[...arguments])
}

const oak = require('oak')

// Attaches oak property to |exports|
exports.defineProperties = function (exports) {
  return Object.defineProperties(exports, {
    oak: {
      enumerable: false,
      get: () => require('oak')
    }
  })
}

// if no app url is provided, we load the default
let opts = {
  url: join(__dirname, 'default')
}

program
  .version(version)
  .option('-b, --background <String>', 'Hex background color for initial window. Example: #f0f0f0')
  .option('-D, --display <Number>', 'Display to use', _.toInteger)
  .option('-f, --fullscreen', 'Full screen width and height')
  .option('-F, --frame', 'Show window frame')
  .option('-h, --height <Number>', 'Window height', _.toInteger)
  .option('-i, --insecure', 'Allow insecure connections (not recommended)')
  .option('-k, --kiosk', 'Kiosk mode')
  .option('-t, --ontop', 'Start window ontop of others')
  .option('-s, --show', 'Show window on start')
  .option('-S, --shortcut [list]', 'Register shortcuts, comma separated. reload,quit', v => v.split(','))
  .option('-t, --title <String>', 'Window title')
  .option('-u, --useragent <String>', 'User-Agent string')
  .option('-v, --verbose', 'Set log level to info')
  .option('-w, --width <Number>', 'Window width', _.toInteger)
  .option('-x, --x <Number>', 'Window X position', _.toInteger)
  .option('-y, --y <Number>', 'Window Y position', _.toInteger)
  .arguments('<url>')
  .action(function (url) {
    if (url) {
      opts.url = url
    }
  })
  .parse(process.argv)

opts = _(program._events)
  .omit('*', 'version')
  .mapValues((v, k) => program[k])
  .omitBy(_.isUndefined)
  .merge(opts)
  .value()

if (isURL(opts.url)) {
  oak.on('ready', () => oak.load(opts))
} else {
  require(resolve(opts.url))
}

function isURL (value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value)
}
