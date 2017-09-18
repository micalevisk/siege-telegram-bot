/* eslint-disable */

/**
 * Preposições para os nomes
 * dos 27 estados brasileiros.
 */
const estados = {
  'acre': 'do',
  'alagoas': 'de',
  'amapá': 'do',
  'amazonas': 'do',
  'bahia': 'da',
  'ceará': 'do',
  'distrito federal': 'do',
  'espírito santo': 'de',
  'goiás': 'de',
  'maranhão': 'do',
  'mato grosso': 'de',
  'mato grosso do sul': 'de',
  'minas gerais': 'de',
  'pará': 'do',
  'paraíba': 'da',
  'paraná': 'do',
  'pernambuco': 'de',
  'piauí': 'do',
  'rio de janeiro': 'do',
  'rio grande do norte': 'do',
  'rio grande do sul': 'do',
  'rondônia': 'de',
  'roraima': 'de',
  'santa catarina': 'de',
  'são paulo': 'de',
  'sergipe': 'de',
  'tocantins': 'de'
}

/**
 *
 * @param {string} nomeEstado
 * @return {string} O nome do estado antecedido da sua preposição
 */
const nomeEstadoComoPreposicao = (nomeEstado) => (estados[nomeEstado]) ? estados[nomeEstado] + ' ' + nomeEstado : nomeEstado

module.exports = { estados, nomeEstadoComoPreposicao }
