const path = require('path')
const queries = require('./queries')

module.exports = {
  queries,
  PATH_MAIN_PL: path.join(__dirname, 'database', 'main.pl').replace(/\\/g, '/'),
}
