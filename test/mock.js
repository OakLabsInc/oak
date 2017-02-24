process.env.NODE_ENV = 'test'
const { EventEmitter2 } = require('eventemitter2')

module.exports.message = new EventEmitter2({
  wildcard: true,
  newListener: false,
  maxListeners: 200
})
