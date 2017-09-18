/**
 * Recebe o texto do usuário
 * e tenta endenter o seu significado,
 * realizando um conjunto de tratamento do texto
 * a fim de "padronizá-lo", e, caso seja entendido
 * como uma pergunta que o bot saiba responder,
 * encaminha a mesnagem para sua devida consulta
 * e retorna um texto com a resposta obtida.
 * Ou seja, realiza a interface entre o Telegram Bot e o Swi Prolog.
 */

const strUtils = require('../../lib/utils/string_utils')
const parser = require('./grammar/parser')
const { prologController, querys } = require('../prolog-controller')

// =============================== external =============================== //
const fs = require('fs')
const path = require('path')
const PATH_IMAGES = path.join(__dirname, '../prolog-controller/database/images')


/**
 *
 * @param {string} img Nome da imagem (em database/images)
 * @return {{source:string}|null} O caminho completo para a imagem
 * utiliza metadados
 */
function getImageSource(img) {
  let fileContents;
  try {
    fileContents = fs.readFileSync( path.join(PATH_IMAGES, img) )
  } catch (err) {
    return null
  }
  return { source: fileContents }
}


/**
 * Define um texto já classificado.
 * Com metadados para facilitar o processamento
 * da informação textual.
 * @class Brain
 */
class Brain {

  constructor() {
    this.plg = prologController
  }

  /**
   *
   * @param {string} nomeEstado
   * @return {string}
   */
  normalizarNomeEstado(nomeEstado) {
    return parser.normalizarNomeEstado(nomeEstado || '')
  }

  /**
   *
   * @param {string} str
   * @param {number} fromIndex
   * @return {string}
   */
  primeiroNome(str, fromIndex = 0) {
    return parser.getPrimeiroSubstantivoProprioNormalizado(str, fromIndex)
  }

  /**
   *
   * @param {string} img Nome da imagem localizada no diretório padrão
   * @return {{source:string}|null}
   */
  getImagem(img) {
    return getImageSource(img)
  }
  /**
   *
   * @param {string} nomeEstado
   * @return {{filepath:string, caption:string}|{}}
   */
  getImagemBandeira(nomeEstado) {
    if (!nomeEstado) return {}
    const nomeNormalizado = nomeEstado.toLowerCase()
    return {
      filepath: this.getImagem(`bandeira_${strUtils.changeSpaces(nomeNormalizado)}.png`),
      caption: `esta é a bandeira ${this.normalizarNomeEstado(nomeNormalizado)}`
    }
  }

  /**
   * Interface com o Swi Prolog
   * @param {string} msg
   * @return {promise}
   */
  /* eslint-disable */
  responderMensagem(msg) { // FIXME pensar alternativa menos massante (retirar o loop)
    const msgNormalizada = parser.normalizeText(msg, true)

    for (let q in querys) { // NÃO USAR! https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/
      const match = querys[q].regex.test(msgNormalizada)
      if (!match) continue
      const currQuery = querys[q].execRegexTo(msgNormalizada)

      return new Promise((resolve, reject) => {
        if (!currQuery) return reject(`O que você quis dizer com ${strUtils.asCode(msg)}? 🤖`)

        return this.plg.executeQueryWithHandler(currQuery, currQuery.params)
        .then((r) => {
          const respostaMsg = currQuery.resposta(r, currQuery.params)
          return resolve(respostaMsg)
        })
      })
    }

    return Promise.reject(`Não entendi`)
  }

}

//========================//
module.exports = new Brain()
//========================//