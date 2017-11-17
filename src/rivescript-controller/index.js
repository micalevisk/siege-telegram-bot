const { PATH_INTENTS } = require('./config')
const RiveScript = require('rivescript')

const rsBrain = new RiveScript({
  utf8: true,
  errors: {
    replyNotFound: '',
    replyNotMatched: '', // alterar aqui para adicionar o módulo de aprendizado (padrão não encontrado)
    objectNotFound: 'Ocorreu um problema em algun dos meus parafusos! 👀',
    deepRecursion: 'Opa! detectei um loop nessa mensagem 💪',
  },
})

rsBrain.unicodePunctuation = new RegExp(/[.,!?;:]/g)


/**
 * Callback de erro
 * para o carregamento das intenções.
 * @param {string} error
 * @param {number} [batch]
 */
function riveBrainError(error) {
  console.log('[rivescript-controller::error]', error)
}


/**
 *
 * @param {function} ask
 * @param {string} [directoryPath]
 */
function startRivescript(ask, directoryPath = PATH_INTENTS) {
  rsBrain.loadDirectory(directoryPath, () => {
    rsBrain.sortReplies()
    ask(rsBrain)
  }, riveBrainError)
}


module.exports = startRivescript
