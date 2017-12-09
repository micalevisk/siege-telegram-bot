const path = require('path')

module.exports = {
  CHAR_EVAL_PROLOG: '§', // caractere que indica que o texto a seguir é uma instrução em Prolog
  PATH_MAIN_PL: path.join(__dirname, 'database', 'main.pl').replace(/\\/g, '/'),
  PATH_CONHECIMENTOS_EXTERNOS: path.join(__dirname, 'database', 'fatos_dinamicos.pl.lock').replace(/\\/g, '/'),
}
