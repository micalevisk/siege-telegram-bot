/* eslint semi: 2 */
/* eslint-disable no-await-in-loop, no-cond-assign */

// --------------------------------- //
require('../../lib/typedefs');
const swipl = require('swipl-stdio');
const { PATH_MAIN_PL, querys } = require('./config');
// --------------------------------- //

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
   * @param {string} pathInitialProgram
   */
  constructor(pathInitialProgram) {
    if (!pathInitialProgram || typeof pathInitialProgram !== 'string') throw Error('Arg must be an string');

    checkConsult(pathInitialProgram);
    this.pathInitialProgram = pathInitialProgram;
  }

  /**
   *
   * @param {string} query
   * @param {AsyncCallback} cb
   * @return {promise}
   */
  executeQuery(query, cb) {
    if (typeof cb !== 'function') throw TypeError('"cb" must be an callback');
    return executeQuery(this.pathInitialProgram, query, cb)
          .catch((err) => { throw Error('[executequery]', err); });
  }

  /**
   *
   * @param {QueryHandler} queryHandler
   * @param {object} [queryInputs={}]
   */
  executeQueryWithHandler(queryHandler, queryInputs = {}) {
    return this.executeQuery(queryHandler.consulta(queryInputs), queryHandler.controlador);
  }

}

/**
 * Verifica se o carregamento de um programa
 * a partir de um código Prolog
 * foi realizada com sucesso.
 * @param {string} programPath
 */
async function checkConsult(programPath) {
  const engine = new swipl.Engine();
  const call = await engine.call(`consult('${programPath}')`);
  engine.close();
  if (!call) throw Error('Consult Failed!');
}

/**
 *
 * @param {string} initialProgram
 * @param {string} strQuery
 * @param {AsyncCallback} callback
 */
async function executeQuery(initialProgram, strQuery, callback) {
  const engine = new swipl.Engine();
  await engine.call(`consult('${initialProgram}')`); // admite que o programa será carregado

  let response;
  const query = await engine.createQuery(strQuery);
  try {
    response = await callback(query);
  } finally {
    await query.close();
  }

  engine.close();
  return response;
}


module.exports = { prologController: new PrologController(PATH_MAIN_PL), querys };

// ===================================== external ===================================== //

// ==== in-line
/*
plg.executeQuery( 'append([1], [1,2], L)', async (query) => {
  let result;
  while (result = await query.next()) {
    console.log( result );
  }
});
*/

// ======== testando

/*
const { PATH_MAIN_PL, querys } = require('./config');
const plg = new PrologController(PATH_MAIN_PL);
const msg = 'o que São Paulx é para o Brasil?'; // msg texto do usuário
const currQuery = querys.q36.execRegexTo(msg); // 'qx' deve ser todas as propriedades em 'querys'
if (currQuery) {
  console.log('mensagem casada com sucesso!');

  plg.executeQueryWithHandler(currQuery, currQuery.params).then((r) => {
    const respostaMsg = currQuery.resposta(r, currQuery.params);
    console.log( respostaMsg );
  })

} else  console.log('mensagem não casou');
*/
/*
plg.executeQueryWithHandler(querys.q2).then((r) => {
  console.log(r);
});
*/
/*
plg.executeQueryWithHandler(querys.q1, { Estado: 'amazonas' }).then((r) => {
  console.log(r);
});
*/
/*
plg.executeQueryWithHandler(querys.q7, { Municipio: 'manausx' }).then((r) => {
  console.log(r);
});
*/
/*
plg.executeQueryWithHandler(querys.q3, { Estado: 'amazonas', Municipio: 'manaus' }).then((r) => {
  console.log(r);
});
*/
