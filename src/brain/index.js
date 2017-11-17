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

const fs   = require('fs')
const path = require('path')

const strUtils = require('../../lib/utils/string_utils')
const parser   = require('./grammar/parser')
const { PrologController, queries } = require('./prolog-controller')

const PATH_IMAGES = path.join(__dirname, './prolog-controller/database/images')
const RSB_USERNAME = 'local-user'

const rsTemplateValido = template => template && !template.startsWith('[ERR:');

/**
 *
 * @param {string} img Nome da imagem (em database/images)
 * @return {{source:string}|null} O caminho completo para a imagem
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

  /**
   *
   * @param {RiveScript} riveScriptBrain
   */
  constructor(riveScriptBrain) {
    this.plg = new PrologController()
    this.rsb = riveScriptBrain
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
   * @param {string} nomeEstado
   * @return {{filepath:string, caption:string}|{}}
   */
  getImagemBandeira(nomeEstado) {
    if (!nomeEstado) return {}
    const nomeNormalizado = nomeEstado.toLowerCase()
    return {
      filepath: getImageSource(`bandeira_${strUtils.changeSpaces(nomeNormalizado)}.png`),
      caption: `esta é a bandeira ${this.normalizarNomeEstado(nomeNormalizado)}`,
    }
  }

  /**
   * Interfaceia com o RiveScript e Swi-Prolog.
   * @param {string} msg
   * @return {promise}
   */
  responderMensagem(msg) { // FIXME pensar alternativa menos massante (retirar o loop)
    const msgNormalizada = parser.normalizarTexto(msg, true)
    const controladorConsulta = async (query) => {
      const result = await query.next() // dá {} se a resposta for True
      return result.Resposta || result
    }

    return new Promise((resolve, reject) => {
      const consultaResultante = this.rsb.reply(RSB_USERNAME, msgNormalizada)

      if ( !rsTemplateValido(consultaResultante) ) return reject(`O que você quis dizer com "${strUtils.asCode(msg)}"? 🤖`) // TODO remover isso
      if (!consultaResultante.startsWith('!')) return reject(consultaResultante) // não é uma consulta para o Prolog

      return this.plg.executeQuery(consultaResultante.substr(1), controladorConsulta).then((r) => {
        if (typeof r === 'string') return resolve( parser.tratarMarcadores(r) )
        return resolve(r ? 'Sim!' : 'Não :l')
      })
    })

    /* // §old-version§
    for (let q in queries) { // NÃO USAR! https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/
      const match = queries[q].regex.test(msgNormalizada)
      if (!match) continue
      const currQuery = queries[q].execRegexTo(msgNormalizada)

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
    */
  }

}

//===================//
module.exports = Brain
//===================//
