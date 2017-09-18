/*************************************************/
// t.me/SIEGE_BR_bot
// emojis (c) https://emojipedia.org/

const brain = require('./brain')
const strUtils = require('../lib/utils/string_utils')
const { Extra, reply } = require('telegraf')
const defaultReplyOptions = Extra.HTML().notifications(false).webPreview(false)
/*************************************************/

/**************************************************************************************************/
const HELP_MESSAGE = `${strUtils.asBold('regras:')}
${strUtils.asCode('1.')} os substantivos próprios devem estar escritos como manda a gramática;
${strUtils.asCode('2.')} as demais palavras podem ser escritas de qualquer forma;
${strUtils.asCode('3.')} as perguntas que o bot responde estão em ${strUtils.asLink('siege-telegram-bot', 'http://github.com/micalevisk/siege-telegram-bot')};
`
const COMMANDS_AVAILABLE = `${strUtils.asBold('Olá, eu posso te ajudar a conhecer o Brasil 🇧🇷!')} 😉
Me faça algumas perguntas sobre o Brasil geográfico que talvez eu saiba lhe responder 😊

comando disponível:
${strUtils.asCode('/help')} - ${strUtils.asItalic('mostra as instruções para o uso correto')}
`
/**************************************************************************************************/


/**
 *
 * @param {*} ctx
 * @param {*} next
 * @return {*} envio da resposta
 */
function bandeiraMiddleware(ctx, next) {
  const msg = ctx.message.text
  const match = ctx.match
  if (!match) return next()

  const inicioNome = msg.indexOf(match[1])
  const nome = brain.primeiroNome(msg, inicioNome)

  const { filepath, caption } = brain.getImagemBandeira(nome)
  return (filepath)
         ? ctx.replyWithPhoto(filepath, { caption })
         : ctx.reply('Nome inválido 🤷')
}


/**
 *
 * @param {*} ctx
 * @return {promise} envio da resposta
 */
function callBrainMiddleware(ctx) {
  const msg = ctx.message.text

  return brain.responderMensagem(msg)
    .then(resposta => ctx.reply(resposta, defaultReplyOptions) )
    .catch(msgErro => ctx.reply(msgErro, defaultReplyOptions) )
}


/**
 * Inicializa o bot.
 * @param {Telegraf} bot
 */
function initializeBot(bot) {

  bot.command('start', reply(COMMANDS_AVAILABLE, defaultReplyOptions))

  bot.command('help', reply(HELP_MESSAGE, defaultReplyOptions))

  bot.hears(/^(?:qual) .+ bandeira d[oea] (.+)/i, bandeiraMiddleware)

  bot.hears(/^[^/\s]+.+$/i, callBrainMiddleware)

  bot.startPolling()

}

module.exports = initializeBot
