const { PATH_CONHECIMENTOS_EXTERNOS } = require('./prolog-controller/config')

const strQueriesAprendizado = {

  salvarQuestao: (pergunta, resposta, usernameAutor, idAutor, ano) => `§salvar_questao("${pergunta}", "${resposta}", "${usernameAutor}", ${idAutor}, ${ano}, "${PATH_CONHECIMENTOS_EXTERNOS}")`,

  incrementarVoto: pergunta => `§incrementar_voto("${pergunta}", Votos, "${PATH_CONHECIMENTOS_EXTERNOS}")`,

}


module.exports = { strQueriesAprendizado }
