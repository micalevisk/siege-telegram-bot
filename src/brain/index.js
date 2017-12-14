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
const PrologController = require('./prolog-controller')

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
  }

  /**
   *
   * @param {number} unixTimestamp
   * @return {nubmer}
   */
  obterAnoDe(unixTimestamp) {
    return parser.getYearFromUnixTimestamp(unixTimestamp)
  }

  /**
   *
   * @param {str} texto
   * @param {MessageEntity} entidades
   * @return {string}
   */
  obterTextoComEntidades(texto, entidades) {
    return parser.getWithTags(texto, entidades)
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
      caption: `Esta é a bandeira ${parser.normalizarNomeEstado(nomeNormalizado)}`,
    }
  }

  /**
   * Interfaceia com o RiveScript e Swi-Prolog.
   * Executa a resposta, se esta for dada como consulta em Prolog.
   * @param {{id:number, username:string, text:string}} msgInfo
   * @return {promise}
   */
  responderMensagem({ id, username, text: msg }) {

    const controladorConsulta = async (query) => {
      try {

        const res = await query.next() // dá {} se a resposta for True
        if (res.Resposta) return { text: parser.tratarTexto(res.Resposta) }
        if (res.RespostaDada && typeof res.RespostaDada === 'string') {
          return (id === res.IdAutor)
          ? { text: parser.tratarTexto(res.RespostaDada) }
          : { respostaDada: parser.tratarTexto(res.RespostaDada), pergunta: res.Pergunta, qtdVotos: res.Votos }
        }
        if (res.RespostaAusente && typeof res.RespostaAusente === 'string') return { respostaAusente: parser.tratarTexto(res.RespostaAusente), pergunta: res.Pergunta }
        return res

      } catch (e) {
        console.log('[responderMensagem::error]', e)
        return null
      }
    }

    return new Promise((resolve) => {
      const respostaIntent = this.rsb.reply(username, msg)
      return this.plg.executeQuery(respostaIntent, controladorConsulta).then((r) => {
        return (typeof r === 'string')
             ? resolve({ text: parser.tratarTexto(r) })
             : resolve(r)
      })
    })

  }

}

//===================//
module.exports = Brain
//===================//
