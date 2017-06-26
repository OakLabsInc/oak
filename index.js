#!/usr/bin/env node

const { resolve, join } = require('path')
const Module = require('module')
const _ = require('lodash')
require(join(__dirname, 'lib', 'util'))
const program = require('commander')
const { version } = require(join(__dirname, 'package.json'))

// oak gets loaded from this path
const oakPath = join(__dirname, 'lib', 'index.js')

// resolve future require('oak') to our core path
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request) {
  return request === 'oak' ? oakPath : origResolve(...[...arguments])
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
  .description('If you load oak with a script path, no commandline options will apply automatically.')
  .option(
    '-b, --background [String]',
    'Hex background color for initial window. Example: #f0f0f0',
    '#000000'
  )
  .option(
    '-f, --fullscreen [Boolean]',
    'Set the window to full width and height',
    _.toBoolean, true
  )
  .option(
    '-h, --height [Number]',
    'Window height',
    _.toInteger, 768
  )
  .option(
    '-w, --width [Number]',
    'Window width',
    _.toInteger, 1024
  )
  .option(
    '-x, --x [Number]',
    'Window X position',
    _.toInteger, 0
  )
  .option(
    '-y, --y [Number]',
    'Window Y position',
    _.toInteger, 0
  )
  .option(
    '-t, --title [String]',
    'Window title',
    _.toString, 'Oak'
  )
  .option(
    '-t, --ontop [Boolean]',
    'Start window ontop of others',
    _.toBoolean, true
  )
  .option(
    '-k, --kiosk [Boolean]',
    'Kiosk mode',
    _.toBoolean, true
  )
  .option(
     '-D, --display [Number]',
     'Display to use',
     _.toInteger, 0
    )
  .option(
    '-S, --shortcut [List]',
    'Register shortcuts, comma separated. reload,quit',
    v => v.split(','), []
  )
  .option(
    '-u, --useragent [String]',
    'User-Agent string',
    _.toString
  )
  .option(
    '-F, --frame [Boolean]',
    'Show window frame',
    _.toBoolean, false
  )
  .option(
    '-s, --show [Boolean]',
    'Show window on start',
    _.toBoolean, true
  )
  .option(
    '-n, --node [Boolean]',
    'Enable node integration',
    _.toBoolean, false
  )
  .option(
    '-i, --insecure [Boolean]',
    'Allow insecure connections (not recommended)',
    _.toBoolean, false
  )
  .option(
    '--sslExceptions [Array]',
    'Ignore SSL security warnings from a host pattern. Don\'t include the FQDN. Example: *.mysite.com',
    v => v.split(','), []
  )
  .option(
    '-c, --cache [Boolean]',
    'Use HTTP cache',
    _.toBoolean, false
  )
  .option(
    '-d, --debugger [Boolean]',
    'Open chrome dev tools on load',
    _.toBoolean, false
  )
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

if (require('url').parse(opts.url).protocol !== null) {
  // if the url argument is an actual URI, just load it
  oak.on('ready', () => oak.load(opts))
} else {
  // if not, require it as a file
  require(resolve(opts.url))
}
