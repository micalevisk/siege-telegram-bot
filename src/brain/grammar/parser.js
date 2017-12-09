require('../../../lib/typedefs')

const MARCADORES = require('./marcadores')
const { splitIntoWords } = require('../../../lib/utils/string_utils')
const { nomeEstadoComoPreposicao } = require('./preposicoes')
// const { padronizarSinonimos } = require('./sinonimos')
const strUtils = require('../../../lib/utils/string_utils')

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

exports.normalizarNomeEstado = nomeEstado => normalizarNomeEstado(nomeEstado)

/**
 * Capitaliza todos os primeiros caracteres
 * das palavras no nome, visando as regras
 * gramaticais da língua brasileira.
 * Utilizado na exibição.
 * @param {string} nome
 * @return {string}
 */
exports.normalizarNomeProprio = (nome) => {
  return allFirstToUpper(nome)
}

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
exports.corrigirTexto = (str) => {
  return str.replace(/['"]/g, '\\$&')
}

/**
 * Realiza o processo inversa da "correção" do texto.
 * Além de tratar as marcações (removendo-as e substituindo devidamente).
 * @param {string} str O texto a ser tratado
 * @return {string} O texto tratado
 */
exports.tratarTexto = (str) => {
  return tratarTodasMarcacoes( str.replace(/\\(')/g, '$1') )
}

/**
 * Escapar os meta-caracteres das expressões regulares.
 * @param {strin} str
 * @return {string} A string com os caracteres escapados
 */
function escaparMetacaracteres(str) {
  return str.replace(/[{}()|^$*?+[\]/\\]/g, '\\$&')
}

/**
 * Dado um texto, as tags (marcadores) que definem
 * os símbolos inicial e final, e uma função que
 * realiza a conversão/tratamento do texto que está
 * entre os símbolos marcadores,
 * essa função realizará tal processo de conversão.
 * OBS: não admite símbolos de diferentes tags possuem um caractere em comum.
 *
 * tratarMarcacoes :: (String, { sb_start: String, sb_end: String }, String -> String) -> String
 * @param {string} str
 * @param {Marking} marcador
 * @param {function} tratador
 * @return {string} A str sem o marcador e com o texto (entre os marcadores) tratado
 */
function tratarMarcacoes(str, marcador, tratador) {
  const inicio = str.indexOf(marcador.sb_start) // primeiro ocorrência da tag inicial
  const fim    = str.lastIndexOf(marcador.sb_end) // última ocorrência da tag final

  return (inicio >= 0 && fim >= 0)
       ? str.slice(0, inicio) + tratador( str.substring(inicio + marcador.sb_start.length, fim) ) + str.slice(fim + marcador.sb_end.length)
       : str
}


/**
 * @param {array} fns - Funções que serão aplicadas.
 * @return {function}
 */
function pipe(...fns) {
  const PIPE = (f, g) => (...args) => g( f(...args) );
  return fns.reduce(PIPE);
}

/**
 * Analisa o texto para substituir/tratar
 * todas as marcações encontradas
 * por seus valores válidos.
 * @param {string} strComTags
 * @return {string} O texto tratado (sem marcações)
 */
function tratarTodasMarcacoes(strComTags) { // TODO: refatorar
  // if (typeof strComTags !== 'string') return strComTags
  let strSemTags = tratarMarcacoes(strComTags, MARCADORES.nomeproprio, allFirstToUpper)
  strSemTags = tratarMarcacoes(strSemTags, MARCADORES.estado_com_preposicao, normalizarNomeEstado)
  strSemTags = tratarMarcacoes(strSemTags, MARCADORES.codigo, strUtils.asCode)
  strSemTags = tratarMarcacoes(strSemTags, MARCADORES.link, strUtils.asLink)
  strSemTags = tratarMarcacoes(strSemTags, MARCADORES.italico, strUtils.asItalic)
  strSemTags = tratarMarcacoes(strSemTags, MARCADORES.negrito, strUtils.asBold)

  return strSemTags
}

