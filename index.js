#!/usr/bin/env node

const { resolve, join, basename } = require('path')
const Module = require('module')
const _ = require('lodash')

require(join(__dirname, 'lib', 'util'))

const program = require('commander')

const {
  version: oakVersion,
  engines: {
    node: nodeVersion
  },
  dependencies: {
    electron: electronVersion
  }
} = require(join(__dirname, 'package.json'))

let opts = {}

program
  .version(oakVersion)
  .description('If you load oak with a script path, no commandline options will apply automatically.')
  .option(
    '-b, --background [String]',
    'Hex background color for initial window. Example: #f0f0f0',
    '#000000'
  )
  .option(
    '-f, --fullscreen [Boolean]',
    'Set the window to full width and height. This overrides the --size option',
    _.toBoolean, true
  )
  .option(
    '-k, --kiosk [Boolean]',
    'Kiosk mode, which is fullscreen by default. On OSX this will cause the workspace to shift to a whole new one',
    _.toBoolean, false
  )
  .option(
    '-s, --size [String]',
    'Window size in WIDTHxHEIGHT format. Example: 1024x768. This will over ride both --kiosk and --fullscreen',
    /(\d+)x(\d+)/
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
    '--show [Boolean]',
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
    'Use standard caching, setting this to false has the same effect as the --disable-http-cache chrome flag',
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

  .arguments('<uri>')
  .action(function (uri, options) {
    if (uri) {
      opts.url = uri
    }
  })

program
  .command('version [type]')
  .description('Prints version, options are are `all`, `oak`, `electron`, `node`')
  .option('-j, --json', 'Output in JSON format', false)
  .action(function (type = 'oak', opts) {
    let exitVal = 0
    let all = {
      oak: oakVersion,
      electron: electronVersion,
      node: nodeVersion
    }
    let out = all.oak
    switch (type) {
      case 'oak':
      case 'electron':
      case 'node': {
        out = {}
        out[type] = all[type]
        if (!_.isUndefined(opts.json)) {
          out = JSON.stringify(out, null, 2)
          break
        } else {
          out = out[type]
        }
        out[type] = all[type]
        break
      }
      case 'all': {
        out = JSON.stringify(all, null, 2)
        break
      }
      default: {
        out = 'Invalid name for version'
        exitVal = 1
        break
      }
    }
    console.log(out)
    process.exit(exitVal)
  })

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

// setting temp argv for commander to use if we are inside our compiled app
let tmpArgv = process.argv

if (_.get(process.env, 'CHROME_DESKTOP') === 'oak.desktop' || basename(process.argv[0]).indexOf('oak') !== -1) {
  tmpArgv = ['', ...process.argv]
}

program.parse(tmpArgv)

if (!opts.url) {
  program.help()
}

opts = _(program._events)
  .omit('*', 'version')
  .mapValues((v, k) => program[k])
  .omitBy(_.isUndefined)
  .merge(opts)
  .value()

if (require('url').parse(opts.url).protocol !== null) {
  // if the url argument is a valid URI, load that directly
  oak.on('ready', () => oak.load(opts))
} else {
  // if not, require it as a file
  try {
    require(resolve(opts.url))
  } catch (e) {
    if (e.message.indexOf('Cannot find module') === 0) {
      console.error('Not a valid URL or file path. Make sure you specify a valid URI with a protocol prefix (i.e. http:// or file://)', e.message)
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
