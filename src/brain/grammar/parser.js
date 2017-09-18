const { splitIntoWords } = require('../../../lib/utils/string_utils')
const { nomeEstadoComoPreposicao } = require('./preposicoes')
const { padronizarSinonimos } = require('./sinonimos')


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
  if (!firstChar.match(/[ÀÈÌÒÙÁÉÍÓÚÃÕÇÀ-ÿA-Za-z]/)) return fixed

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
  const re = /[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z][àèìòùáéíóúãõça-z]+((\s+|-)(d(as?|es?|os?)\s+|d')?[ÀÈÌÒÙÁÉÍÓÚÃÕÇA-Z]([.]|[àèìòùáéíóúãõça-z]*))*/
  const tokens = (typeof str === 'string') ? splitIntoWords(str).map(allToLowerExceptFirst) : str
  const normalizado = tokens.join(' ').substr(fromIndex)
  const matched = normalizado.match(re)

  if (!matched) return null
  const palavra = matched[0]
  return { palavra, index: normalizado.indexOf(palavra), length: palavra.length }
}

exports.getPrimeiroSubstantivoProprioNormalizado = (str, fromIndex = 0) => {
  const nome = getPrimeiroSubstantivoProprio(str, fromIndex)
  return (nome) ? nome.palavra.toLowerCase().replace(/'/g, "\\'") : null
}


/**
 * Padroniza o nome de um estado brasileiro
 * capitalizando-o e adicionando a sua devida preposição.
 * @param {string} nomeEstado
 * @return {string}
 */
exports.normalizarNomeEstado = (nomeEstado) => {
  return allFirstToUpper( nomeEstadoComoPreposicao(nomeEstado) )
}

/**
 * Capitaliza todos os primeiros caracteres
 * das palavras no nome, visando as regras
 * gramaticais da língua brasileira.
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
 * Remove brancos desnecessários
 * e deixa todos os caracteres (exceto o primeiro) minúsculos.
 * Além de alterar todos as palavras que possuem
 * um sinônimo "casual" (definido no dicionário).
 * @param {string} str
 * @param {boolean} [fixSinonimos=false]
 * @return {string}
 * @see normalização
 */
exports.normalizeText = (str, fixSinonimos = false) => {
  const normalizado = splitIntoWords( str.trim().replace(/\s{2,}/, ' ') )
      .map(allToLowerExceptFirst)
      .join(' ')

  return (fixSinonimos) ? padronizarSinonimos(normalizado) : normalizado
}
