/**
 * Para manipular as consultas.
 * @typedef {(query: Promise) => void} AsyncCallback
 */

/**
 * Para representar um objeto que será
 * utilizado como interface entre o swipl-stdio
 * e o telegram bot, afim de generelizar as
 * execuções das consultas.
 * @typedef QueryHandler
 * @type {object}
 * @property {RegExp} regex - A expressão que casa com a pergunta que esta query trata.
 * @property {object} [params] - Contêm os parâmetros necessários para a execução da consulta (deve ser setado pela 'execRegexTo')
 * @property {(text:string) => this} execRegexTo - Para setar a propriedade 'params' do objeto (executar a regex sobre uma entrada).
 * @property {(variaveis?:object) => string} consulta - Função que recebe os parâmetros da query e retorna a query formatada.
 * @property {(query:promise) => promise} controlador - Função async que controladrá a saída do swi prolog e definirá a resposta.
 * @property {(saidas:object, entradas?:object) => string} resposta - Função que recebe a resposta obtida pelo controlador e retorna a mensagem que o bot dará.
 */

 /**
 * Usado para classificar texto como
 * pergunta ou afirmação.
 * Ou "respostas" como
 * booleanas ou booleanas com explicação.
 * @typedef {object} CLASSIFICATIONS
 * @property {object} CLASSIFICATIONS
 * @property {string} CLASSIFICATIONS.QUESTION
 * @property {string} CLASSIFICATIONS.ASSERTION
 * @property {string} CLASSIFICATIONS.BOOLEAN
 * @property {string} CLASSIFICATIONS.PHRASE
 * @property {string} CLASSIFICATIONS.BOOLEAN_PHRASE
 */
