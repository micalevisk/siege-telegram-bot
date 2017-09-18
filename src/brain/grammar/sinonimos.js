/* eslint-disable */

/**
 * Alguns sinônimos dos substantivos que serão detectados.
 * @see https://www.sinonimos.com.br/
 * @namespace
 * @property {object} sinonimos - Todos os substantivos suportados
 * Alguns "sinônimos" podem estar sem acentuação.
 * OBS: os sinônimos não podem começar/terminar com caractere especial pois a regex falhará.
 */
const sinonimos = {
  'capital':   [ 'sede', 'metropole', 'metrópole' ],
  'caminho':   [ 'rota', 'percurso', 'trajetoria', 'trajetória' ],
  'cuja':      [ 'a qual' ],
  'é':         [ 'é a', 'é o' ],
  'existe':    [ 'há' ],
  'fazem':     [ 'realizam' ],
  'ficam':     [ 'encontram-se', 'estão', 'estao' ],
  'fica':      [ 'encontra-se', 'está' ],
  'fronteira': [ 'divisa', 'limiar' ],
  'município': [ 'municipio', 'cidade' ],
  'municípios':[ 'municipios', 'cidades' ],
  'não':       [ 'nao', 'errado', 'negativo' ],
  'até':       [ 'no mínimo' ], // sentido adotado
  'população': [ 'cidadaos', 'cidadãos', 'habitantes', 'moradores', 'individuos', 'indivíduos' ],
  'para':      [ 'em relação à', 'em relação ao', 'para o', 'para a' ], // sentido adotado
  'região':    [ 'regiao', 'zona', 'faixa' ],
  'regiões':   [ 'regioes', 'zonas', 'faixas' ],
  'tem':       [ 'possui' ],
  'sim':       [ 'isso', 'exatamente', 'exato', 'afirmativo', 'positivo' ]
  // 'onde':      [ 'aonde' ],
}

/**
 * Troca todos as ocorrência de uma palavra
 * pelo seu sinônimo "principal" (mais usado).
 * Que estão listados acima.
 * @param {string} str
 * @return {string} O texto padronizado.
 */
function padronizarSinonimos(str) {
  let padronizado = str
  for (principal in sinonimos) {
    const regexStr = `(\\b|\\s)(${sinonimos[principal].join('|')})(\\b|\\s)`
    const regex = new RegExp(regexStr, 'ig')
    padronizado = padronizado.replace(regex, '$1' + principal + '$3')
  }

  return padronizado
}

module.exports = { sinonimos, padronizarSinonimos }
