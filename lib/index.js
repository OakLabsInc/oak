const { join } = require('path')
const Core = require(join(__dirname, 'core.js'))

const core = new Core()

module.exports = core
