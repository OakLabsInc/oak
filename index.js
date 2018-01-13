#!/usr/bin/env node

const { resolve, join, basename } = require('path')
const Module = require('module')
const _ = require('lodash')

require(join(__dirname, 'lib', 'util'))

const program = require('commander')

const {
  version,
  engines: {
    node: nodeVersion
  },
  dependencies: {
    electron: electronVersion
  }
} = require(join(__dirname, 'package.json'))

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
    '-c, --cache [Boolean]',
    'Use HTTP cache',
    _.toBoolean, true
  )
  .option(
    '-d, --debugger [Boolean]',
    'Open chrome dev tools on load',
    _.toBoolean, false
  )
  .option(
    '--sslExceptions [Array]',
    'Bypass SSL security for specific hosts. This uses a host pattern. Example: *.mysite.com',
    v => v.split(','), []
  )
  .option(
    '--electronVersion',
    'Print electron version'
  )
  .arguments('<url>')
  .action(function (url, options) {
    if (url) {
      opts.url = url
    }
  })

// setting temp argv for commander to use if we are inside our compiled app
let tmpArgv = process.argv

if (_.get(process.env, 'CHROME_DESKTOP') === 'oak.desktop' || basename(process.argv[0]).indexOf('oak') !== -1) {
  tmpArgv = ['', ...process.argv]
}

program.parse(tmpArgv)

if (program.electronVersion) {
  console.log(electronVersion)
  process.exit(0)
}

if (!program.url) {
  program.help()
}

opts = _(program._events)
  .omit('*', 'version', 'electronVersion')
  .mapValues((v, k) => program[k])
  .omitBy(_.isUndefined)
  .merge(opts)
  .value()

if (require('url').parse(opts.url).protocol !== null) {
  // if the url argument is an actual URI, just load it
  oak.on('ready', () => oak.load(opts))
} else {
  // if not, require it as a file
  try {
    require(resolve(opts.url))
  } catch (e) {
    if (e.message.indexOf('Cannot find module') === 0) {
      console.error('Not a valid URL or file path.', e.message)
      process.exit(1)
    }
    if (e.message.indexOf('NODE_MODULE_VERSION') !== -1) {
      console.error(`Wrong node modules version for electron@${electronVersion}.\nPlease use electron-rebuild or run npm install with node v${nodeVersion}`)
      process.exit(1)
    }
    console.error(e)
    process.exit(1)
  }
}
