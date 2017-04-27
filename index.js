#!/usr/bin/env node

const { resolve, join } = require('path')
const Module = require('module')
const _ = require('lodash')
require(join(__dirname, 'lib', 'util'))
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

let opts = {}

program
  .version(version)
  .description('If you load oak with a script path, no commandline options will apply. You need to specify them under oak.load(options)')
  .option('-b, --background [String]', 'Hex background color for initial window. Example: #f0f0f0', '#000000')
  .option('-f, --fullscreen [Boolean]', 'Set the window to full width and height', _.toBoolean, true)
  .option('-h, --height [Number]', 'Window height', _.toInteger, 768)
  .option('-w, --width [Number]', 'Window width', _.toInteger, 1024)
  .option('-x, --x [Number]', 'Window X position', _.toInteger, 0)
  .option('-y, --y [Number]', 'Window Y position', _.toInteger, 0)
  .option('-t, --title [String]', 'Window title', _.toString, 'Oak')
  .option('-t, --ontop [Boolean]', 'Start window ontop of others', _.toBoolean, true)
  .option('-k, --kiosk [Boolean]', 'Kiosk mode', _.toBoolean, true)
  .option('-D, --display [Number]', 'Display to use', _.toInteger, 0)
  .option('-S, --shortcut [List]', 'Register shortcuts, comma separated. reload,quit', v => v.split(','))
  .option('-u, --useragent [String]', 'User-Agent string', _.toString)
  .option('-F, --frame', 'Show window frame')
  .option('-s, --show', 'Show window on start')
  .option('-i, --insecure', 'Allow insecure connections (not recommended)')
  .option('-v, --verbose', 'Set log level to info')
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

if (!opts.url) {
  program.help()
}

if (isURL(opts.url)) {
  oak.on('ready', () => oak.load(opts))
} else {
  require(resolve(opts.url))
}

function isURL (value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value)
}
