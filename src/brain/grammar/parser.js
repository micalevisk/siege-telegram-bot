const { splitIntoWords } = require('../../../lib/utils/string_utils')
const { nomeEstadoComoPreposicao } = require('./preposicoes')
const strUtils = require('../../../lib/utils/string_utils')
const MARCADORES = require('./marcadores')


/**
 * @param {array} fns - Funções que serão aplicadas.
 * @return {function}
 */
function pipe(...fns) {
  const PIPE = (f, g) => (...args) => g( f(...args) )
  return fns.reduce(PIPE)
}

/**
 * Transforma para upper case todos as primeiras letras
 * de cada palvra de uma string, exceto se estas tiverem
 * tamanho menor que 3 ou sua primeira palavra for
 * seguido por um apóstrofo.
 * @param {string} str A string alvo da transformação
 * @return {string} A string normalizada
 */
function allFirstToUpper(str) {
  if ((!str) || (str.length < 3)) return str
  const re = /([ÀÈÌÒÙÁÉÍÓÚÃÕÇÀ-ÿA-Z])([^\s]+)/gi
  const fixed = str.replace(/\\'/g, "'")

  const firstChar = fixed.charAt(0)
  if (!firstChar.match(/[ÀÈÌÒÙÁÉÍÓÚÃÕÇÀ-ÿA-Z]/i)) return fixed

  const newstr = fixed.replace(re, (match, firstCharWord, restWord) => {
    if (restWord.length < 2) return firstCharWord + restWord
    return (restWord.charAt(0) === '\'')
           ? firstCharWord.toLowerCase() + restWord.substr(0, 2).toUpperCase() + restWord.substr(2).toLowerCase()
           : firstCharWord.toUpperCase() + restWord.toLowerCase()
  })

  return newstr.replace(/-./g, match => match.toUpperCase())
}

/**
 * Converte todos os caracteres de uma string
 * para minúsculo, exceto o primeiro.
 * @param {string} word A string alvo da transformação
 * @return {string} A string transformada
 * @see normalização
 */
function allToLowerExceptFirst(word) {
  const re = /(?:(.)('.)|-.)/g
  let [firstChar, ...rest] = word

  if (!firstChar) return word
  if (rest.length) rest = rest.join('').toLowerCase()
  else return firstChar.toLowerCase()

  const newWord = firstChar + rest
  if (word.length < 3) return newWord
  if (!firstChar.match(/[ÀÈÌÒÙÁÉÍÓÚÃÕÇÀ-ÿA-Za-z]/)) return word

  return newWord.replace(re, (match, charAntesApostrofo, charComApostrofo) => {
    return (charComApostrofo)
           ? charAntesApostrofo.toLowerCase() + charComApostrofo.toUpperCase()
           : match.toUpperCase()
  })
}

/**
 * Recupera o primeiro nome identificado em um texto.
 * Admite que o texto está separando (sintáticamente) os nomes próprios.
 * @param {string|string[]} str O texto alvo ou os tokens (lexical)
 * @param {number} [fromIndex=0] A posição incial
 * @return {{palavra:string, index:number, length:number}|null}
 */
function getPrimeiroSubstantivoProprio(str, fromIndex = 0) {
  // const re = /[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z][àèìòùáéíóúãõça-z]+((\s+|-)(d(as?|es?|os?)\s+|d')?[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z]([.]|[àèìòùáéíóúãõça-z]*))*/
  const re = /[àèìòùáéíóúãõça-z]+((\s+|-)(d(as?|es?|os?)\s+|d')?[àèìòùáéíóúãõça-z]([.]|[àèìòùáéíóúãõça-z]*))*/i
  const tokens = (typeof str === 'string') ? splitIntoWords(str).map(allToLowerExceptFirst) : str
  const normalizado = tokens.join(' ').substr(fromIndex)
  const matched = normalizado.match(re)

  if (!matched) return null
  const palavra = matched[0]
  return { palavra, index: normalizado.indexOf(palavra), length: palavra.length }
}

/**
 * Padroniza o nome de um estado brasileiro
 * capitalizando-o e adicionando a sua devida preposição.
 * Utilizado na exibição.
 * @param {string} nomeEstado
 * @return {string}
 */
function normalizarNomeEstado(nomeEstado) {
  return allFirstToUpper( nomeEstadoComoPreposicao(nomeEstado) )
}

/**
 * Dado um texto, as tags (marcadores) que definem
 * os símbolos inicial e final, e uma função que
 * realiza a conversão/tratamento do texto que está
 * entre os símbolos marcadores,
 * essa função realizará tal processo de conversão.
 * OBS: não admite símbolos de diferentes tags possuem um caractere em comum.
 *
 * tratarMarcacoes :: (String, { sb_start: String, sb_end: String }, String -> String) -> (String -> String)
 * @param {Marking} marcador
 * @param {function} tratador
 * @return {function} Função que tratará um texto de acordo com os parâmetros definidos
 */
function tratarMarcacoes(marcador, tratador) {
  return (str) => {
    const inicio = str.indexOf(marcador.sb_start) // primeiro ocorrência da tag inicial
    const fim    = str.lastIndexOf(marcador.sb_end) // última ocorrência da tag final
    return (inicio >= 0 && fim >= 0)
           ? str.slice(0, inicio) + tratador( str.substring(inicio + marcador.sb_start.length, fim) ) + str.slice(fim + marcador.sb_end.length)
           : str
  }
}

/**
 * Analisa o texto para substituir/tratar
 * todas as marcações encontradas
 * por seus valores válidos.
 * @param {string} strComTags
 * @return {string} O texto tratado (sem marcações)
 */
function tratarTodasMarcacoes(strComTags) {
  return pipe(
    tratarMarcacoes(MARCADORES.nomeproprio, allFirstToUpper),
    tratarMarcacoes(MARCADORES.estado_com_preposicao, normalizarNomeEstado),
    tratarMarcacoes(MARCADORES.codigo, strUtils.asCode),
    tratarMarcacoes(MARCADORES.hiperlink, strUtils.asLink),
    tratarMarcacoes(MARCADORES.italico, strUtils.asItalic),
    tratarMarcacoes(MARCADORES.negrito, strUtils.asBold),
  )(strComTags)
}


/**
 * Trata as marcações/entidades de um texto,
 * a fim de obter uma saída formatada
 * na mensagem visando a formatação HTML.
 * @param {string} text
 * @param {MessageEntity} entities
 * @return {string}
 * @see https://core.telegram.org/bots/api#messageentity
 */
exports.getWithTags = (text, entities) => {
  if (!entities) return text
  const tagsHTML = {
    bold: strUtils.asBold,
    italic: strUtils.asItalic,
    code: strUtils.asCode,
    pre: strUtils.asPre,
  }

  const result = entities.reduce(({ str, last }, entity) => {

    const [begin, end] = [entity.offset, entity.offset + entity.length]
    const parseEntity = tagsHTML[entity.type]
    const updatedText = (parseEntity)
                        ? text.slice(last, begin) + parseEntity( text.slice(begin, end) )
                        : text.slice(last, end)

    return { str: str + updatedText, last: end }

  }, { str: '', last: 0 })

  return result.str + text.slice(result.last)
}

/**
 * Recupera o primeiro nome próprio encontrado
 * a partir de uma posição, e transforma
 * os caracteres em minúsculo e escapa
 * o caractere apóstrofo.
 * @param {string} str
 * @param {number} [fromIndex=0]
 * @return {string|null}
 */
exports.getPrimeiroSubstantivoProprioNormalizado = (str, fromIndex = 0) => {
  const nome = getPrimeiroSubstantivoProprio(str, fromIndex)
  return (nome) ? nome.palavra.toLowerCase().replace(/'/g, "\\'") : null
}

exports.normalizarNomeEstado = nomeEstado => normalizarNomeEstado(nomeEstado)

/**
 * Capitaliza todos os primeiros caracteres
 * das palavras no nome, visando as regras
 * gramaticais da língua brasileira.
 * Utilizado na exibição.
 * @param {string} nome
 * @return {string}
 */
exports.normalizarNomeProprio = nome => allFirstToUpper(nome)

/**
 * @param {string} str
 * @param {number} [fromIndex=0]
 * @return {{numero:number, index:number}|null}
 */
exports.getPrimeiroNumero = (str, fromIndex = 0) => {
  const re = /-?[0-9]+(?:.[0-9]+)?/
  const normalizado = str.substr(fromIndex)
  const matched = normalizado.match(re)

  if (!matched) return null
  const numero = Number(matched[0])
  return { numero, index: normalizado.indexOf(numero) }
}

/**
 * Realiza processamentos que o RiveScript não consegue fazer.
 * Mas sem prejudicar a lógica das consultas em Prolog,
 * e as respostas obtidas.
 *
 * Escapa caracteres tendenciosos.
 * @param {string} str Texto a ser tratado
 * @return {string} O texto normalizado
 */
exports.corrigirTexto = str => str.replace(/['"]/g, '\\$&')

/**
 * Realiza o processo inversa da "correção" do texto de resposta.
 * Além de tratar as marcações (removendo-as e substituindo devidamente).
 * @param {string} str O texto a ser tratado
 * @return {string} O texto tratado
 */
exports.tratarTexto = str => tratarTodasMarcacoes( str.replace(/\\(')/g, '$1') )

/**
 * Converte uma data no formato Unix
 * e recupera o ano.
 * @param {number} dateUnixLike
 * @return {number} ano da data
 */
exports.getYearFromUnixTimestamp = dateUnixLike => new Date(dateUnixLike * 1000).getFullYear()


/**
 * Recupera todos os nomes que iniciam com maísculo.
 * Além de nomes compostos (por hífen e/ou preposições).
 * Normaliza os nomes caso o parâmetro seja string.
 * Admite que o texto está devidamente estruturado.
 * @param {string|string[]} str A string ou os tokens (texto normalizado e dividido em palavras)
 * @return {string[]|null} A lista de substantivos identificados, ou 'null' caso não encontre algum
 */
function getSubstantivosProprios(str) {
  // const re = /[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z][àèìòùáéíóúãõça-z]+((\s+|-)(d(as?|es?|os?)\s+|d\')?[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z][àèìòùáéíóúãõça-z]+)*/g
  const re = /[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z][àèìòùáéíóúãõça-z]+((\s+|-)(d(as?|es?|os?)\s+|d')?[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z]([.]|[àèìòùáéíóúãõça-z]*))*/g
  const tokens = (typeof str === 'string') ? splitIntoWords(str).map(allToLowerExceptFirst) : str
  const normalizado = tokens.join(' ')
  return normalizado.match(re)
}
