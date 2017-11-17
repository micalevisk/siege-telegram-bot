require('../../../lib/typedefs')
const swipl = require('swipl-stdio')
const { PATH_MAIN_PL, queries } = require('./config')


/**
 * Define um texto já classificado.
 * Com metadados para facilitar o processamento
 * da informação textual.
 * @class PrologController
 * @property {(query:string, cb:AsyncCallback) => promise} executeQuery
 * @property {(queryHandler:QueryHandler, queryInputs?:object) => promise} executeQueryWithHandler
 */
class PrologController {

  /**
   *
   * @param {string} [pathInitialProgram]
   */
  constructor(pathInitialProgram = PATH_MAIN_PL) {
    if (!pathInitialProgram || typeof pathInitialProgram !== 'string') throw Error('Arg must be an string')

    checkConsult(pathInitialProgram)
    this.pathInitialProgram = pathInitialProgram
  }

  /**
   *
   * @param {string} query
   * @param {AsyncCallback} cb
   * @return {promise}
   */
  executeQuery(query, cb) {
    if (typeof cb !== 'function') throw TypeError('"cb" must be an callback')
    return executeQuery(this.pathInitialProgram, query, cb)
          .catch((err) => { throw Error('[prolog-controller::error]', err) })
  }

  /**
   *
   * @param {QueryHandler} queryHandler
   * @param {object} [queryInputs={}]
   * @return {promise}
   */
  executeQueryWithHandler(queryHandler, queryInputs = {}) {
    return this.executeQuery(queryHandler.consulta(queryInputs), queryHandler.controlador)
  }

}

/**
 * Verifica se o carregamento de um programa
 * a partir de um código Prolog
 * foi realizada com sucesso.
 * @param {string} programPath
 */
async function checkConsult(programPath) {
  const engine = new swipl.Engine()
  const call = await engine.call(`consult('${programPath}')`)
  engine.close()
  if (!call) throw Error('Consult Failed!')
}

/**
 *
 * @param {string} initialProgram
 * @param {string} strQuery
 * @param {AsyncCallback} callback
 */
async function executeQuery(initialProgram, strQuery, callback) {
  const engine = new swipl.Engine()
  await engine.call(`consult('${initialProgram}')`) // admite que o programa será carregado

  let response;
  const query = await engine.createQuery(strQuery)
  try {
    response = await callback(query)
  } finally {
    await query.close()
  }

  engine.close()
  return response
}


module.exports = { PrologController, queries };
