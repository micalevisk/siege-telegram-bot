/* eslint-disable comma-dangle */

/**
 * Definição dos marcadores para o pós-tratamento
 * das saídas geradas pelo Prolog.
 * Tais marcadores devem estar de acordo com a
 * base de conhecimento em "prolog-controller".
 * Os símbolos dos marcadores não podem compartilhar caracteres.
 * Além de não possuírem caracteres que são palavras-chave no Prolog.
 *
 * @namespace
 * @property {object} marcadores
 * @property {Marking} marcadores.nomeproprio
 * @property {Marking} marcadores.estado_com_preposicao
 * @property {Marking} marcadores.codigo
 * @property {Marking} marcadores.link
 * @property {Marking} marcadores.italico
 * @property {Marking} marcadores.negrito
 */
module.exports = {
  nomeproprio: {
    sb_start: '{',
    sb_end: '}'
  },

  estado_com_preposicao: {
    sb_start: '&',
    sb_end: '&'
  },

  codigo: {
    sb_start: '`',
    sb_end: '`'
  },

  link: {
    sb_start: '@',
    sb_end: '@'
  },

  italico: {
    sb_start: '__',
    sb_end: '__'
  },

  negrito: {
    sb_start: '**',
    sb_end: '**'
  }
}
