process.env.NODE_ENV = 'test'

const test = require('tape')
let oak = false

test('test oak module', function (t) {
  let methods = [
    'on',
    'load',
    'catchErrors',
    'quit'
  ]
  t.plan(4 + methods.length)
  t.comment('oak existance')

  t.doesNotThrow(function () {
    oak = require('oak')
  }, 'oak should be requirable')
  t.isNot(oak.ready, true, 'oak should not be ready when setup for the first time')

  t.comment('oak methods')
  methods.forEach(function (v) {
    t.isEqual(typeof oak[v], 'function', 'oak has the ' + v + '() method')
  })

  t.comment('oak ready')
  oak.on('ready', function () {
    t.pass('Oak fired ready event')
    oak.app.on('will-quit', function () {
      t.pass('oak will quit')
      t.end()
    })
    oak.quit()
  })
})
