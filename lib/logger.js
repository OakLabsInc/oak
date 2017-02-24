const _ = require('lodash')
const tools = require('oak-tools')

class MakeError extends Error {
  constructor (name, message, stack) {
    super()
    this.name = name
    this.message = message || ''
    this.stack = stack || (new Error()).stack
  }
}

module.exports = function (message, _metadata) {
  let loaded = false
  let metadata = {
    properties: {}
  }
  let instance

  function Logger (opts = { level: 'info', pretty: false }) {
    if (!loaded) {
      loaded = true
      instance = tools.logger(opts)
      message.on('logger.*', function (e) {
        let ev = this.event.split('.').pop()
        if (['fatal', 'error', 'warn', 'info', 'debug', 'trace'].indexOf(ev) > -1) {
          e = _.defaultsDeep(e, metadata)
          if (ev === 'error') {
            e = _.defaultsDeep(e, {
              err: {}
            })
            instance[ev](new MakeError(e.event, e.err.message, e.err.stack))
          } else {
            instance[ev](e)
          }
        }
      })
    }

    function setMetadata (obj) {
      for (let k in obj) {
        metadata[k] = obj[k]
      }
      return metadata
    }
    return {
      instance,
      setMetadata
    }
  }

  return Logger
}
