const { join } = require('path')
const _ = require('lodash')
const test = require('tape')
const { message } = require(join(__dirname, 'mock'))

const modpath = join(__dirname, '..', 'lib', 'logger')

function hookStdout (callback) {
  var oldWrite = process.stdout.write

  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(process.stdout, arguments)
      callback(string, encoding, fd)
    }
  })(process.stdout.write)

  return function () {
    process.stdout.write = oldWrite
  }
}

test('***** logger module', function (t) {
  t.plan(10)

  var logger = require(modpath)(message)

  t.comment('- module')
  t.equal(typeof logger, 'function', 'should return a function')
  t.equal(typeof (logger = logger()), 'object', 'should return an object')

  t.comment('- methods')
  t.ok(_.isFunction(logger.setMetadata), 'logger.setMetadata is a function')
  t.ok(logger.setMetadata(), 'logger.setMetadata returns an object')

  logger.setMetadata({
    'logger_metadata_test': true
  })

  t.comment('- functionality')
        // testing logger stdout
  var stdoutLogTest = false

  var unhook = hookStdout(function (s) {
    try { stdoutLogTest = JSON.parse(s) } catch (e) {}
  })

  message.emit('logger.info', {
    'logger_property_test': true
  })

  unhook()

  t.ok(stdoutLogTest, 'should have a valid log to stdout')
  t.equal(stdoutLogTest['level'], 30, 'log level should be 30 (info)')
  t.equal(typeof stdoutLogTest, 'object', 'log should be an object')
  t.equal(stdoutLogTest['logger_property_test'], true, 'log should have test property')
  t.equal(stdoutLogTest['logger_metadata_test'], true, 'log should have test metadata')
  t.equal(typeof stdoutLogTest['properties'], 'object', 'log should have properties object')
})
