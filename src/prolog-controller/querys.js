/**
 * Código que implementa todas as perguntas
 * que podem ser respondidas pelo bot e suas
 * respectivas respostas.
 *
 * FIXME:
 * - tratar casos onde os nomes próprios não são identificados (dados como null)
 * TODO:
 * - indificar quando usar o plural e o singular
 * - retornar uma consulta segura, i.e., verificar se as entradas são válidas
 * - Adicionar emojis de acordo com o grau de emoção da resposta
 */

/* eslint-disable comma-style, comma-spacing */

require('../../lib/typedefs')
const { prologlistToArray } = require('../../lib/utils/object_utils')
const parser = require('../brain/grammar/parser')

// ============================ wrappers ============================ //
const normalizarEstado = nomeEstado => parser.normalizarNomeEstado(nomeEstado)
const normalizarNome = nomeProprio => parser.normalizarNomeProprio(nomeProprio)
const primeiroNome = (str, inicio = 0) => parser.getPrimeiroSubstantivoProprioNormalizado(str, inicio)
const primeiroNumero = (str, inicio = 0) => parser.getPrimeiroNumero(str, inicio).numero
// ================================================================== //


const DEFAULT_NO = 'Não 😬'
const DEFAULT_YES = 'Sim! 😃'
const DEFAULT_ERROR = 'Não entendi 💩, repita, por favor'


/**
 * Qual [a] capital do/de/da `Estado`?
 * @type {QueryHandler}
 */
const q1 = {
   regex: /^(?:qual) .*\bcapital\b.+d[oea] (.+)/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioEstado = text.indexOf(match[1])
    this.params = Object.assign({
      Estado: primeiroNome(text, inicioEstado)
    })
    return this
  }

  ,consulta: entradas => `capital('${entradas.Estado}', NomeCapital)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { nomeCapital: result.NomeCapital }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.nomeCapital)
           ? `A capital ${normalizarEstado(entradas.Estado)} é ${normalizarNome(saidas.nomeCapital)}`
           : 'Não é um estado do Brasil 😐'
  }
}

/**
 * Qual [a] capital do Brasil?
 * @type {QueryHandler}
 */
const q2 = {
   regex: /^(?:qual) .*\b(capital)\b.+do (brasil)\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'capital(brasil, Capital)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { capital: result.Capital }
  }
  ,resposta: (saidas) => {
    return (saidas.capital)
           ? `${normalizarNome(saidas.capital)} é a capital do Brasil`
           : DEFAULT_ERROR
  }
}

/**
 * [A] cidade/município [do/de] `Municipio` é capital do/de/da `Estado`?
 * @type {QueryHandler}
 */
const q3 = {
   regex: /^.*\bmunicípio (?:d[oe] )?(.+) é capital d[oea] (.+)/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioMunicipio = text.indexOf(match[1])
    const inicioEstado = text.indexOf(match[2])

    this.params = Object.assign({
      Estado: primeiroNome(text, inicioEstado),
      Municipio: primeiroNome(text, inicioMunicipio)
    })
    return this
  }

  ,consulta: entradas => `capital('${entradas.Estado}', '${entradas.Municipio}')`
  ,controlador: async (query) => {
    const result = await query.next()
    return !!result
  }
  ,resposta: (saidas, entradas) => {
    return (saidas)
           ? `${DEFAULT_YES} ${normalizarNome(entradas.Municipio)} é capital ${normalizarEstado(entradas.Estado)}`
           : DEFAULT_NO
  }
}

/**
 * Existe/Há algum estado cuja [a] capital tem/possui o mesmo nome do estado?
 * @type {QueryHandler}
 */
const q4 = {
   regex: /^(existe) .*algum estado cuja .*\bcapital .+ mesmo nome .*\bd[oe] .+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'findall(E, capital(E,E), Quais), list_nonempty(Quais, Existe)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { quais: prologlistToArray(result.Quais), existe: !!result.Existe }
  }
  ,resposta: (saidas) => {
    return (saidas.existe)
           ? `${DEFAULT_YES} ${saidas.quais.map(normalizarNome).join(' e ')} são eles`
           : 'Não existe'
  }
}

/**
 * `Municipio` é a/o capital de qual estado?
 * @type {QueryHandler}
 */
const q5 = {
   regex: /(.+) é (?:[ao] .*)?capital de qual estado\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioMunicipio = text.indexOf(match[1])

    this.params = Object.assign({
      Municipio: primeiroNome(text, inicioMunicipio)
    })
    return this
  }

  ,consulta: entradas => `capital(NomeEstado, '${entradas.Municipio}')`
  ,controlador: async (query) => {
    const result = await query.next()
    return { nomeEstado: result.NomeEstado }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.nomeEstado)
           ? `${normalizarNome(entradas.Municipio)} é a capital ${normalizarEstado(saidas.nomeEstado)}`
           : DEFAULT_ERROR
  }
}

/**
 * `Municipio` é a/o capital de algum estado?
 * @type {QueryHandler}
 */
const q6 = {
  regex: /(.+) é (?:[ao] .*)?capital de algum estado\b.+/i
 ,execRegexTo(text) {
   const match = text.match(this.regex)
   if (!match) return null

   const inicioMunicipio = text.indexOf(match[1])

   this.params = Object.assign({
     Municipio: primeiroNome(text, inicioMunicipio)
   })
   return this
 }

 ,consulta: entradas => `capital(Estado, '${entradas.Municipio}')`
 ,controlador: async (query) => {
   const result = await query.next()
   return { estado: result.Estado }
 }
 ,resposta: (saidas, entradas) => {
   return (saidas.estado)
         ? `${DEFAULT_YES} ${normalizarNome(entradas.Municipio)} é a capital ${normalizarEstado(saidas.estado)}`
         : DEFAULT_NO
 }
}

/**
 * `Municipio` é a/o capital do/de/da `Estado`?
 * @type {QueryHandler}
 */
const q7 = {
   regex: /(.+) é (?:[ao] .*)?capital d[oea] (.+)/i
   ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioMunicipio = text.indexOf(match[1])
    const inicioEstado = text.indexOf(match[2])

    this.params = Object.assign({
      Municipio: primeiroNome(text, inicioMunicipio),
      Estado: primeiroNome(text, inicioEstado)
    })
    return this
  }

  ,consulta: entradas => `capital('${entradas.Estado}', '${entradas.Municipio}')`
  ,controlador: async (query) => {
    const result = await query.next()
    return !!result
  }
  ,resposta: (saidas, entradas) => {
    return (saidas)
           ? `${DEFAULT_YES} ${normalizarNome(entradas.Municipio)} é a capital ${normalizarEstado(entradas.Estado)}`
           : DEFAULT_NO
  }
}

/**
 * Qual [é] [o] estado [que] tem/possui mais cidades/municípios?
 * @type {QueryHandler}
 */
const q8 = {
   regex: /^(?:qual) .*\b(estado) .+ (mais) (municípios)\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'estados_municipios(_, E), first(E, Estado-QtdMunicipios)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { estado: result.Estado, qtdMunicipios: result.QtdMunicipios }
  }
  ,resposta: (saidas) => {
    return (saidas.estado)
          ? `${normalizarNome(saidas.estado)} é o que tem mais municípios (${saidas.qtdMunicipios} ao todo 😯)`
          : DEFAULT_ERROR
  }
}

/**
 * Qual [é] [o] estado [que] tem/possui menos cidades/municípios?
 * @type {QueryHandler}
 */
const q9 = {
   regex: /^(?:qual) .*\b(estado) .+ (menos) (municípios)\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'estados_municipios(_, E), last(E, Estado-QtdMunicipios)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { estado: result.Estado, qtdMunicipios: result.QtdMunicipios }
  }
  ,resposta: (saidas) => {
    return (saidas.estado)
           ? `${normalizarNome(saidas.estado)} é o que tem menos municípios (apenas ${saidas.qtdMunicipios})`
           : DEFAULT_ERROR
  }
}

/**
 * Quais estados [brasileiros] estão no/na [região] `Regiao`?
 * @type {QueryHandler}
 */
const q10 = {
   regex: /^(?:quais) estados .*\bestão (.+)/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioRegiao = text.indexOf(match[1])

    this.params = Object.assign({
      Regiao: primeiroNome(text, inicioRegiao)
    })
    return this
  }

  ,consulta: entradas => `findall(E, estado(E,_,'${entradas.Regiao}',_), ListaEstados)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { listaEstados: prologlistToArray(result.ListaEstados) }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.listaEstados.length)
           ? `A região ${normalizarNome(entradas.Regiao)} delimita ${saidas.listaEstados.length} estados, que são: ${saidas.listaEstados.map(normalizarNome).join(', ')}`
           : 'Essa não é uma região do Brasil'
  }
}

/**
 * Quais [são] [as] regiões [que] possuem até `Numero` estados?
 * @type {QueryHandler}
 */
const q11 = {
   regex: /^(?:quais) .*\bregiões .*\bpossuem .*\baté (\d+) estados\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioNumero = text.indexOf(match[1])

    this.params = Object.assign({
      Numero: primeiroNumero(text, inicioNumero)
    })
    return this
  }

  ,consulta: entradas => `findall(R, (regiao(R, Q), Q =< ${entradas.Numero}), ListaRegioes)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { listaRegioes: prologlistToArray(result.ListaRegioes) }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.listaRegioes.length)
           ? `As regiões que possuem até ${entradas.Numero} são: ${saidas.listaRegioes.join()}`
           : `Nenhuma região possui no mínimo ${entradas.Numero} estado(s)...`
  }
}

/**
 * Quantos estados [o] Brasil tem/possui?
 * @type {QueryHandler}
 */
const q12 = {
   regex: /^(?:quantos) (estados) .*\b(brasil) (tem)\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'findall(QtdEstados, regiao(_, QtdEstados), L), sum_list(L, QtdEstados)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { qtdEstados: result.QtdEstados }
  }
  ,resposta: (saidas) => {
    return (saidas.qtdEstados)
           ? `Atualmente o Brasil possui ${saidas.qtdEstados} estados!`
           : DEFAULT_ERROR
  }
}

/**
 * Quantos estados a/o [região] `Regiao` delimita?
 * @type {QueryHandler}
 */
const q13 = {
   regex: /^(?:quantos) estados .*\b(?:região)? (.+) delimita\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioRegiao = text.indexOf(match[1])

    this.params = Object.assign({
      Regiao: primeiroNome(text, inicioRegiao)
    })
    return this
  }

  ,consulta: entradas => `regiao('${entradas.Regiao}', QtdEstados)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { qtdEstados: result.QtdEstados }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.qtdEstados)
           ? `A região ${normalizarNome(entradas.Regiao)} atualmente possui ${saidas.qtdEstados} estados`
           : DEFAULT_ERROR
  }
}

/**
 * Quantas/Quantos cidades/municípios [o/a] [estado] [do/de/da] `Estado` tem/possui?
 * @type {QueryHandler}
 */
const q14 = {
   regex: /^(?:quant[oa]s) municípios [oa]? (?:estado )?(.+) tem\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioEstado = text.indexOf(match[1])

    this.params = Object.assign({
      Estado: primeiroNome(text, inicioEstado)
    })
    return this
  }

  ,consulta: entradas => `municipios('${entradas.Estado}', Municipios), length(Municipios, QtdMunicipios)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { listaMunicipios: prologlistToArray(result.Municipios), qtdMunicipios: result.QtdMunicipios }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.listaMunicipios)
           ? `O estado ${normalizarEstado(entradas.Estado)} possui ${saidas.qtdMunicipios} municípios`
           : DEFAULT_ERROR
  }
}

/**
 * [A/O cidade/município do/de] `Municipio` está/fica em qual estado?
 * @type {QueryHandler}
 */
const q15 = {
   regex: /^(.+) fica .+ qual estado\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioMunicipio = text.indexOf(match[1])

    this.params = Object.assign({
      Municipio: primeiroNome(text, inicioMunicipio)
    })
    return this
  }

  ,consulta: entradas => `municipio('${entradas.Municipio}', Estado)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { estado: result.Estado }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.estado)
           ? `O município ${normalizarNome(entradas.Municipio)} se localiza no estado ${normalizarEstado(saidas.estado)}`
           : 'Esse não é um município do Brasil (ou está escrito errado)'
  }
}

/**
 * [A/O estado/cidade/município do/de/da] `Estado`/`Municipio` está/fica na região `Regiao`?
 * @type {QueryHandler}
 */
const q16 = {
   regex: /^(.+) fica .*\bna região (.+)/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioNome = text.indexOf(match[1])
    const inicioRegiao = text.indexOf(match[2])

    this.params = Object.assign({
      Nome: primeiroNome(text, inicioNome),
      Regiao: primeiroNome(text, inicioRegiao)
    })
    return this
  }

  ,consulta: entradas => `regiao_de('${entradas.Nome}', '${entradas.Regiao}')`
  ,controlador: async (query) => {
    const result = await query.next()
    return !!result
  }
  ,resposta: (saidas, entradas) => {
    return (saidas)
           ? `${DEFAULT_YES} ${normalizarNome(entradas.Nome)} fica na região ${normalizarNome(entradas.Regiao)}`
           : `${DEFAULT_NO} ${normalizarNome(entradas.Nome)} não está nessa região`
  }
}

/**
 * [A/O estado do/de/da] `Estado`/`Municipio` está/fica em qual região?
 * @type {QueryHandler}
 */
const q17 = {
   regex: /^(.+) fica .+ qual região\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioNome = text.indexOf(match[1])

    this.params = Object.assign({
      Nome: primeiroNome(text, inicioNome)
    })
    return this
  }

  ,consulta: entradas => `regiao_de('${entradas.Nome}', Regiao)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { regiao: result.Regiao }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.regiao)
           ? `${normalizarNome(entradas.Nome)} se localiza na região ${normalizarNome(saidas.regiao)}`
           : `${normalizarNome(entradas.Nome)} não está no Brasil`
  }
}

/**
 * Qual [é] [o] tamanho territorial do/de/da `Estado`?
 * @type {QueryHandler}
 */
const q18 = {
   regex: /^(?:qual) .*\btamanho territorial d[oea] estado (.+)/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioEstado = text.indexOf(match[1])

    this.params = Object.assign({
      Estado: primeiroNome(text, inicioEstado)
    })
    return this
  }

  ,consulta: entradas => `tamanho('${entradas.Estado}', Tamanho)`
  ,controlador: async (query) => {
    const result = await query.next()
    return { tamanho: result.Tamanho }
  }
  ,resposta: (saidas, entradas) => {
    return (saidas.estado)
           ? `Atualmente o tamanho territorial ${normalizarEstado(entradas.Estado)} é ${saidas.tamanho} quilômetros quadrados`
           : `${normalizarNome(entradas.Estado)} não é um estado brasileiro (ou está escrito errado)`
  }
}

/**
 * Qual estado tem/possui [o] menor tamanho [territorial]?
 * @type {QueryHandler}
 */
const q19 = {
   regex: /^(?:qual) estado .+ menor tamanho\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'menor_area(MenorArea, MenorEstado)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { menorArea: result.MenorArea, menorEstado: result.MenorEstado }
  }
  ,resposta: (saidas) => {
    return (saidas.menorArea)
           ? `O estado ${normalizarEstado(saidas.menorEstado)} tem a menor área atualmente cerca de ${saidas.menorArea} quilômetros quadrados`
           : DEFAULT_ERROR
  }
}

/**
 * Qual estado tem/posui [o] maior tamanho [territorial]?
 * @type {QueryHandler}
 */
const q20 = {
   regex: /^(?:qual) estado .+ maior tamanho\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'maior_area(MaiorArea, MaiorEstado)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { maiorArea: result.MaiorArea, maiorEstado: result.MaiorEstado }
  }
  ,resposta: (saidas) => {
    return (saidas.maiorArea)
           ? `O estado ${normalizarEstado(saidas.maiorEstado)} tem a maior área atualmente, cerca de ${saidas.maiorArea} quilômetros quadrados`
           : DEFAULT_ERROR
  }
}

/**
 * Qual [é] [o] tamanho territorial do Brasil?
 * @type {QueryHandler}
 */
const q21 = {
   regex: /^(?:qual) .*\btamanho territorial do brasil\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'tamanho(brasil, TamanhoTotal)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { tamanhoTotal: result.TamanhoTotal }
  }
  ,resposta: (saidas) => {
    return (saidas.tamanhoTotal)
           ? `Atualmente, o Brasil possui ${saidas.tamanhoTotal} quilômetros quadrados de área territorial`
           : DEFAULT_ERROR
  }
}

/**
 * Quais [são] os estados de maior e menor tamanho [territorial]?
 * @type {QueryHandler}
 */
const q22 = {
   regex: /^(?:quais) .+ (estados) .+ (maior) e (menor) (tamanho)\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    return (match) ? this : null
  }

  ,consulta: () => 'maior_area(MaiorArea, MaiorEstado), menor_area(MenorArea, MenorEstado)'
  ,controlador: async (query) => {
    const result = await query.next()
    return { maiorEstado: result.MaiorEstado, maiorArea: result.MaiorArea, menorEstado: result.MenorEstado, menorArea: result.MenorArea }
  }
  ,resposta: (saidas) => {
    return (saidas.maiorEstado)
           ? `O maior estado em área territorial é o ${normalizarNome(saidas.maiorEstado)} (${saidas.maiorArea} km^2) e o menor é ${normalizarNome(saidas.menorEstado)} (${saidas.menorArea} km^2)`
           : DEFAULT_ERROR
  }
}

/**
 * O que [o/a] `Estado`/`Municipio`/`Regiao` é para o Brasil?
 * @type {QueryHandler}
 */
const q36 = {
   regex: /^(?:o que) (.+) é para .*\bbrasil\b.+/i
  ,execRegexTo(text) {
    const match = text.match(this.regex)
    if (!match) return null

    const inicioNome = text.indexOf(match[1])

    this.params = Object.assign({
      Nome: primeiroNome(text, inicioNome)
    })
    return this
  }

  ,consulta: entradas => `relacao('${entradas.Nome}', Relacao)`
  ,controlador: async (query) => {
    const result = await query.next()
     return { relacao: result.Relacao }
   }
   ,resposta: (saidas, entradas) => {
     return (saidas.relacao)
            ? `${normalizarNome(entradas.Nome)} é um(a) ${saidas.relacao} do Brasil`
            : 'Não possui relaçao alguma com o Brasil geográfico'
   }
}


// ------------ //
module.exports = {
  q1,
  q2,
  q3,
  q4,
  q5,
  q6,
  q7,
  q8,
  q9,
  q10,
  q11,
  q12,
  q13,
  q14,
  q15,
  q16,
  q17,
  q18,
  q19,
  q20,
  q21,
  q22,
  q36
}
// ------------ //
