/**
 * Main code.
 * Inicializa e inicia o bot.
 *
 * emojis (c) https://emojipedia.org
 */

const { Extra, reply } = require('telegraf')

const Brain    = require('./brain')
const strUtils = require('../lib/utils/string_utils')

const DEFAULT_REPLY_OPTIONS = Extra.HTML().notifications(false).webPreview(false)

// ========================================== MENSAGENS PRÉ-DEFINIDAS ========================================== //
const HELP_MESSAGE = `${strUtils.asBold('📋regras')}
${strUtils.asCode('1.')} os substantivos próprios devem estar escritos como manda a gramática;
${strUtils.asCode('2.')} as demais palavras podem ser escritas de qualquer forma;
${strUtils.asCode('3.')} as perguntas que o bot responde estão em ${strUtils.asLink('siege-telegram-bot', 'https://github.com/micalevisk/siege-telegram-bot#readme')};`

const COMMANDS_AVAILABLE = `${strUtils.asBold('Olá, eu posso te ajudar a conhecer o Brasil 🇧🇷!')} 😉
Me faça algumas perguntas sobre o Brasil geográfico que talvez eu saiba respondê-las 😊

📡comando disponível:
${strUtils.asLink('/help')} - ${strUtils.asCode('mostra as instruções para o uso correto')}`
// ------------------------------------------------------------------------------------------------------------- //


/**
 * Inicializa o bot.
 * @param {Telegraf} bot
 * @param {RiveScript} rsBrain
 */
function initializeBot(bot, rsBrain) {

  const brain = new Brain(rsBrain)

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
   * TODO:
   * - adicionar verificaração se o retorno é pra resposta direta
   * - adicionar módulo de aprendizado
   * @param {*} ctx
   * @return {promise} envio da resposta
   */
  function callBrainMiddleware(ctx, next) {
    const { text, message_id } = ctx.message

    return brain.responderMensagem(text)
      .then((resposta) => {
        return ctx.reply(
          resposta,
          DEFAULT_REPLY_OPTIONS) //.inReplyTo(message_id)
      })
      .catch((msgErro) => {
        if (typeof msgErro === 'string') ctx.reply(msgErro, DEFAULT_REPLY_OPTIONS)
        return next()
      })
  }


  bot.command('start', reply(COMMANDS_AVAILABLE, DEFAULT_REPLY_OPTIONS))

  bot.command('help', reply(HELP_MESSAGE, DEFAULT_REPLY_OPTIONS))

  bot.hears(/^(?:qual) .+ bandeira d[oea] (.+)/i, bandeiraMiddleware)

  bot.hears(/^[^/\s]+.+$/i, callBrainMiddleware)

  bot.startPolling()

}

module.exports = initializeBot
