const { PATH_INTENTS } = require('./config')
const RiveScript = require('rivescript')

const rsBrain = new RiveScript({
  utf8: true,
  errors: {
    replyNotFound: '',
    replyNotMatched: '',
    objectNotFound: '',
    deepRecursion: '',
  },
})

rsBrain.unicodePunctuation = new RegExp(/[.,!?;:"~]/g) // caracteres que serão removidos pelo bot

/**
 * Callback de erro
 * para o carregamento das intenções.
 * @param {string} error
 * @param {number} [batch]
 * @throws {Error}
 */
function riveBrainError(error) {
  throw new Error('[rivescript-controller::error]', error)
}

/**
 * Iniciar o bot do RiveScript.
 * @param {function} cb Função executada se o RS for carregado corretamente (recebe o cérebro do RS)
 * @param {string} [directoryPath] Caminho para os arquivos .rive
 */
function startRivescript(cb, directoryPath = PATH_INTENTS) {
  rsBrain.loadDirectory(directoryPath, () => {
    rsBrain.sortReplies()
    cb(rsBrain)
  }, riveBrainError)
}


module.exports = startRivescript
