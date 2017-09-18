const path = require('path')
const querys = require('./querys')

module.exports = {
   PATH_MAIN_PL: path.join(__dirname, 'database', 'main.pl').replace(/\\/g, '/')
  ,querys
}
