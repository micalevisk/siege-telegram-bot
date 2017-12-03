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
const { PrologController } = require('./prolog-controller')

const PATH_IMAGES = path.join(__dirname, './prolog-controller/database/images')


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

    this.responderMensagem('x é ').then(r => console.log('[RESPOSTA]', r))//DEMO
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
   * Executa a resposta, se esta for dada como consulta em Prolog.
   * @param {string} msg
   * @return {promise}
   */
  responderMensagem(msg) {
    // const msgNormalizada = parser.normalizarTexto(msg) // feito no bot RS

    /**
     * Segue a estratégia definida em "rivescript-controller/intents/queries.rive"
     * @return {string|boolean}
     */
    // TODO: inserir módulo de aprendizagem (mensagens com interação)
    const controladorConsulta = async (query) => {
      const resultado = await query.next() // dá {} se a resposta for True
      if (resultado.Resposta) {
        return resultado.Resposta
      } else if (resultado.Respostadada) {
        return `De acordo com o ${strUtils.asLink(resultado.Nickautor)},\n\n${resultado.Respostadada}`
      }
      return 'Não sei te responder...'
    }

    return new Promise((resolve, reject) => {
      const respostaIntent = this.rsb.reply('local-user', msg)

      // TODO: tratar error na consulta (.catch)
      return this.plg.executeQuery(respostaIntent, controladorConsulta)
        .then((r) => {
          // TODO: realizar parser na resposta visando tanto consultas com retorno 'true' (objeto vazio) quanto 'false'
          if (typeof r === 'string') return resolve( parser.tratarMarcacoes(r) )
          return reject(r)
        })
    })
  }

}

//===================//
module.exports = Brain
//===================//
