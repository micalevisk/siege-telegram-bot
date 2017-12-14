const isEmpty = str => !str.trim()
const asBold  = str => `<b>${str}</b>`
const asItalic= str => `<i>${str}</i>`
const asPre   = str => `<pre>${str}</pre>`
const asCode  = str => `<code>${str}</code>`
const asStrong= str => `<strong>${str}</strong>`
const asLink  = (str, ref='') => `<a href="${ref}">${str}</a>`

/**
 * Troca todas as ocorrências do caractere espaço
 * por uma string (underscore, por padrão).
 * @param {string} str Alvo da alteração
 * @param {string} [newstr=' ']
 */
const changeSpaces = (str, newstr = '_') => str.replace(/\s/g, newstr)

/**
 * Quebra uma string em palavras.
 * @param {string} str
 * @return {string[]}
 */
const splitIntoWords = str => str.split(' ')

/**
 * Encontrar a primeira palavra que segue,
 * imediatamente outra.
 * @param {string} word
 * @param {string} str
 * @param {number} fromIndex
 * @return {{index:number, word:string}}
 */
const findNextWordOf = (word, str, fromIndex = 0) => {
  const splited = splitIntoWords(str)
  const index = splited.indexOf(word, fromIndex)
  return { index, word: (index !== -1) ? splited[index + 1] : '' }
}

/**
 * Remove todos os emojis de uma string.
 * (c) 'jony89' at https://stackoverflow.com/questions/10992921
 * @param {string} str
 * @return {string}
 */
const removeEmojis = str => str.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '')


module.exports = {
  isEmpty,
  asBold,
  asItalic,
  asPre,
  asCode,
  asStrong,
  asLink,
  changeSpaces,
  splitIntoWords,
  findNextWordOf,
  removeEmojis
}
