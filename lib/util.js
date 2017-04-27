const _ = require('lodash')

function toBoolean (v) {
  if (!v) {
    return false
  }
  if (typeof v === 'number' || typeof v === 'boolean') {
    return !!v
  }
  return _.replace(_.trim(v.toLowerCase()), /[""'']/ig, '') === 'true'
}

_.mixin({
  'toBoolean': toBoolean
})
