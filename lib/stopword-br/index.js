/**
 * Copyright (c) 2017, Micael Levi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const defaultStopwords = require('./stopwords_br').words

/**
 * Remover stopwords de um array de palavras.
 * @param {string[]} tokens
 * @param {string[]} stopwords
 */
const removeStopwordsFromTokens = (tokens, stopwords = defaultStopwords) => {
  if (typeof tokens !== 'object' || typeof stopwords !== 'object') {
    throw new TypeError('expected Arrays try: removeStopwordsFromTokens(Array[, Array])')
  }
  return tokens.filter(value => (value.trim()) && (!stopwords.includes(value.toLowerCase())) )
}

/**
 * Remover as stopwords brasileiras de uma string.
 * @param {string} str Alvo da remoção.
 * @param {boolean} [asArray=false] Se o retorno será com as palavras separadas em array.
 * @return {string|string[]}
 */
const removeStopwords = (str, asArray = false) => {
  const withoutStopWords = removeStopwordsFromTokens( str.split(' ') )
  return asArray ? withoutStopWords : withoutStopWords.join(' ')
}

module.exports = {
  removeStopwordsFromTokens,
  removeStopwords
}
