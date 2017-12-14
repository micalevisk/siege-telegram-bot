/**
 * Main code.
 * Inicializa e controla o bot.
 *
 * emojis (c) https://emojipedia.org
 *
 * Storage on ctx.session:
 * - ultima_resposta_dada
 * - esperando_msg
 * - ultima_pergunta_identificada
 */

const { Extra, Markup, session } = require('telegraf')

const Brain    = require('./brain')
const strUtils = require('../lib/utils/string_utils')
const { strQueriesAprendizado } = require('./brain/aprendizado-utils')

const DEFAULT_REPLY_OPTIONS = Extra.HTML().notifications(false).webPreview(false)

// ========================================== MENSAGENS PRÉ-DEFINIDAS ========================================== //
const MSG_ERRO_FUNCIONALIDADE = 'desculpe, ocorreu um problema 🔧...\nNão tente usar essa funcionalidade por enquanto.'

const HELP_MESSAGE = `${strUtils.asBold('📋Observações:')}
${strUtils.asCode('1.')} conheço os sinônimos de várias palavras;
${strUtils.asCode('2.')} entendo palavras mesmo sem a acentuação devida;
${strUtils.asCode('3.')} a priori, todas as mensagens serão tratadas como perguntas, então não precisam terminar com interrogação;
${strUtils.asCode('4.')} não há distinção entre caracteres maiúsculos e minúsculos;
${strUtils.asCode('5.')} as perguntas que eu já sei responder estão listadas ${strUtils.asLink('aqui', 'https://github.com/micalevisk/siege-telegram-bot#readme')}.`

const COMMANDS_AVAILABLE = `${strUtils.asBold('Olá, eu posso te ajudar a conhecer o Brasil 🇧🇷!')} 😉
Me faça algumas perguntas sobre a geografia brasileira que talvez eu saiba respondê-las 😊

📡 Comandos disponíveis:
${strUtils.asLink('/help')} - ${strUtils.asCode('listar observações e instruções.')}
${strUtils.asLink('/cancelar')} - ${strUtils.asCode('parar espera do bot.')}`
// ------------------------------------------------------------------------------------------------------------- //


/**
 * Recupera as opções para respostas
 * do bot usando as opções padrão, sem alterá-las
 * adicionando a opção 'inReplyTo'.
 * @param {number} messageId
 * @return {object}
 */
const getExtraWithInReplyTo = messageId => Object.assign({}, DEFAULT_REPLY_OPTIONS, Extra.inReplyTo(messageId))


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
   */
  function handlerLerResposta(ctx) {
    ctx.session.esperando_msg = false

    const { session: { ultima_pergunta_identificada }, from: { username, id }, message: { date, text, message_id, entities } } = ctx

    const controladorConsulta = async (query) => {
      try {
        const res = await query.next()
        return res !== false
      } catch (e) {
        console.log('[handlerLerResposta::error]', e)
        return null
      }
    }

    return brain.plg
      .executeQuery(strQueriesAprendizado.salvarQuestao(ultima_pergunta_identificada, brain.obterTextoComEntidades(text, entities), username, id, brain.obterAnoDe(date)), controladorConsulta)
      .then((salvou) => {
        return (salvou)
             ? ctx.reply('Obrigado por me ensinar!!', getExtraWithInReplyTo(message_id))
             : ctx.reply(MSG_ERRO_FUNCIONALIDADE)
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
            Markup.callbackButton(`⚠️ (${r.qtdVotos})`, 'incrementar_votos'),
            Markup.callbackButton('✅', 'remover_opcoes'),
          ]))
        }

        // msg sem intent ou sem conhecimento externo
        ctx.session.ultima_pergunta_identificada = r.pergunta
        ctx.session.ultima_resposta_dada = r.respostaAusente
        return handlerRespostaComInlineKeyboard(ctx, Markup.inlineKeyboard([
          Markup.urlButton('🔍', `http://google.com/search?q=${ctx.session.ultima_pergunta_identificada.replace(/\s/g, '+')}`),
          Markup.callbackButton('📝', 'ensinar'),
          Markup.callbackButton('😕', 'remover_opcoes'),
        ]))
      })
      .catch((msgErro) => {
        if (typeof msgErro === 'string') return reply(msgErro, getExtraWithInReplyTo(message_id))
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


  bot.action('incrementar_votos', (ctx) => {
    const controladorConsulta = async (query) => {
      try {
        const res = await query.next()
        return res.Votos
      } catch (e) {
        console.log('[bot-incrementar_votos::error]', e)
        return null
      }
    }

    return brain.plg
      .executeQuery(strQueriesAprendizado.incrementarVoto(ctx.session.ultima_pergunta_identificada), controladorConsulta)
      .then((qtdVotos) => {
        if (qtdVotos === null) return ctx.reply(MSG_ERRO_FUNCIONALIDADE)

        if (qtdVotos > 3) {
          return ctx.answerCbQuery('voto negativo computado!')
            .then(() => ctx.editMessageText(ctx.session.ultima_resposta_dada, Extra.HTML()))
            .catch((err) => {
              console.log('[bot-incrementar_votos::error]', err)
              return ctx.deleteMessage() // sessão perdida
            })
          }

        return ctx.answerCbQuery('resposta removida!!')
          .then(() => ctx.editMessageText(`${strUtils.asItalic('Desculpe, não sei te responder...')}`, Extra.HTML()))
          .catch((err) => {
            console.log('[bot-incrementar_votos::error]', err)
            return ctx.deleteMessage() // sessão perdida
          })

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
      .catch((err) => {
        console.log('[bot-incrementar_votos::error]', err)
        return ctx.deleteMessage() // sessão perdida
      })
  })


  bot.startPolling()

}

module.exports = initializeBot
