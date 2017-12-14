/**
 * @param {string} sbStart símbolo que marca a posição inicial
 * @param {string} sbEnd símbolo que marca a posição final
 */
const Marking = (sbStart, sbEnd) => ({ sb_start: sbStart, sb_end: sbEnd })

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
 * @property {Marking} marcadores.hiperlink
 * @property {Marking} marcadores.italico
 * @property {Marking} marcadores.negrito
 */
module.exports = {
  nomeproprio: Marking('{', '}'),
  estado_com_preposicao: Marking('&', '&'),
  codigo: Marking('`', '`'),
  hiperlink: Marking('@', '@'),
  italico: Marking('__', '__'),
  negrito: Marking('**', '**'),
}
