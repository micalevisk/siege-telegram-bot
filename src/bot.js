/**
 * Main code.
 * Inicializa e inicia o bot.
 *
 * emojis (c) https://emojipedia.org
 */

const { Extra, Markup, session } = require('telegraf')

const Brain    = require('./brain')
const strUtils = require('../lib/utils/string_utils')
const { strQueriesAprendizado } = require('./brain/aprendizado-utils')

const DEFAULT_REPLY_OPTIONS = Extra.HTML().notifications(false).webPreview(false)

// ========================================== MENSAGENS PRÉ-DEFINIDAS ========================================== //
const HELP_MESSAGE = `${strUtils.asBold('📋Observações:')}
${strUtils.asCode('1.')} conheço os sinônimos de várias palavras;
${strUtils.asCode('2.')} entendo palavras mesmo sem a acentuação devida;
${strUtils.asCode('3.')} a priori, todas as mensagens serão tratadas como perguntas, então não precisam terminar com interrogação;
${strUtils.asCode('4.')} não há distinção entre caracteres maiúsculos e minúsculos;
${strUtils.asCode('5.')} as perguntas que eu já sei responder estão listadas ${strUtils.asLink('aqui', 'https://github.com/micalevisk/siege-telegram-bot#readme')}.`

const COMMANDS_AVAILABLE = `${strUtils.asBold('Olá, eu posso te ajudar a conhecer o Brasil 🇧🇷!')} 😉
Me faça algumas perguntas sobre a geografia brasileira que talvez eu saiba respondê-las 😊

📡 Comando disponível:
${strUtils.asLink('/help')} - ${strUtils.asCode('listar observações e instruções.')}
${strUtils.asLink('/cancelar')} - ${strUtils.asCode('parar espera do bot.')}`
// ------------------------------------------------------------------------------------------------------------- //


/**
 * Inicializa o bot.
 * @param {Telegraf} bot
 * @param {RiveScript} rsBrain
 */
function initializeBot(bot, rsBrain) {

  const brain = new Brain(rsBrain)
  bot.use( session() )

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
   * @param {object} inlineKeyboard
   * @return
   */
  function handlerRespostaComInlineKeyboard(ctx, inlineKeyboard) {
    return ctx.reply(ctx.session.ultima_resposta_dada, Extra.markup(inlineKeyboard).HTML().inReplyTo(ctx.message.message_id))
  }

  /**
   *
   * @param {*} ctx
   * @param {object} next
   */
  function handlerLerResposta(ctx, next) {
    ctx.session.esperando_msg = false

    const { session: { ultima_pergunta_identificada }, from: { username, id }, message: { text, message_id } } = ctx

    const controladorConsulta = async (query) => {
      const res = await query.next()
      console.log('~>>>', res) // FIXME: inserção da questão não está sendo escrito
      return res
    }

    return brain.plg.executeQuery(strQueriesAprendizado.salvarQuestao(ultima_pergunta_identificada, text, username, id), controladorConsulta)
      .then((r) => {
        if (r) return ctx.reply('Obrigado por me ensinar!!', DEFAULT_REPLY_OPTIONS.inReplyTo(message_id))
        return next()
      })
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
    if (ctx.session.esperando_msg === true) return handlerLerResposta(ctx, next)

    const { reply, from: { is_bot, id, username }, message: { text, message_id } } = ctx
    if (is_bot) return next()
    rsBrain.setUservar(username, 'id', id)

    return brain.responderMensagem({ id, username, text })
      .then((r) => {
        if (r.text) {
          ctx.session.ultima_resposta_dada = r.text
          return reply(r.text, DEFAULT_REPLY_OPTIONS)
        }

        if (r.respostaDada) {
          ctx.session.ultima_resposta_dada = r.respostaDada
          ctx.session.ultima_pergunta_identificada = r.pergunta
          return handlerRespostaComInlineKeyboard(ctx, Markup.inlineKeyboard([
            Markup.callbackButton('⚠️', 'incrementar_votos'),
            Markup.callbackButton('✅', 'remover_opcoes'),
          ]))
        }

        // msg sem intent ou sem conhecimento externo
        ctx.session.ultima_pergunta_identificada = r.pergunta
        ctx.session.ultima_resposta_dada = r.respostaAusente
        return handlerRespostaComInlineKeyboard(ctx, Markup.inlineKeyboard([
          Markup.urlButton('🔍', 'http://google.com/search?q=' + ctx.session.ultima_pergunta_identificada.replace(/\s/g, '+')),
          Markup.callbackButton('📝', 'ensinar'),
          Markup.callbackButton('😕', 'remover_opcoes'),
        ]))
      })
      .catch((msgErro) => {
        if (typeof msgErro === 'string') return reply(msgErro, DEFAULT_REPLY_OPTIONS.inReplyTo(message_id))
        return next()
      })
  }


  bot.start((ctx) => {
    ctx.session.esperando_msg = false
    ctx.reply(COMMANDS_AVAILABLE, DEFAULT_REPLY_OPTIONS)
  })

  bot.command('help', ({ reply }) => reply(HELP_MESSAGE, DEFAULT_REPLY_OPTIONS))

  bot.command('cancelar', (ctx, next) => {
    if (ctx.session.esperando_msg === true) {
      ctx.session.esperando_msg = false
      return ctx.reply('Tudo bem 🙁 não estou esperando sua resposta mais...')
    }
    return next()
  })

  bot.hears(/^(?:qual) .+ bandeira d[oea] (.+)\?*/i, bandeiraMiddleware)

  bot.hears(/^[^/\s]+.+$/i, callBrainMiddleware)


  bot.action('incrementar_votos', (ctx, next) => {
    const controladorConsulta = async (query) => {
      const res = await query.next()
      console.log('->>>', res) // FIXME: alteração de VOTOS não está sendo escrita
      return res
    }

    return brain.plg.executeQuery(strQueriesAprendizado.incrementarVoto(ctx.session.ultima_pergunta_identificada), controladorConsulta)
      .then((r) => {
        if (r) {
          return ctx.answerCbQuery('voto negativo computado!')
            .then(() => ctx.editMessageText(ctx.session.ultima_resposta_dada, Extra.HTML()))
            .catch((err) => {
              console.log('[bot-incrementar_votos::error]', err)
              return ctx.deleteMessage() // sessão perdida
            })
        }
        return next()
      })
  })

  bot.action('ensinar', (ctx) => {
    ctx.session.esperando_msg = true
    return ctx.answerCbQuery('😀 Opa! Estou esperando a sua resposta, tudo bem?', true)
      .then(() => ctx.editMessageText(ctx.session.ultima_resposta_dada, Extra.HTML()))
      .catch((err) => {
        ctx.session.esperando_msg = false
        console.log('[bot-ensinar::error]', err)
        return ctx.editMessageText('Desculpe, perdi sua mensagem...\n<b>Não</b> estou esperando sua resposta')
      })
  })

  bot.action('remover_opcoes', (ctx) => {
    return ctx.editMessageText(ctx.session.ultima_resposta_dada, Extra.HTML())
  })


  bot.startPolling()

}

module.exports = initializeBot
