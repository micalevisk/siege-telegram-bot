const path = require('path')
const CHAR_EVAL_PROLOG = '§' // caractere que indica que o texto a seguir é uma instrução em Prolog

module.exports = {
  CHAR_EVAL_PROLOG,
  PATH_MAIN_PL: path.join(__dirname, 'database', 'main.pl').replace(/\\/g, '/'),
}
