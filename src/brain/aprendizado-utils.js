const strQueriesAprendizado = {
  salvarQuestao: (pergunta, resposta, usernameAutor, idAutor) => `§salvar_questao("${pergunta}", "${resposta}", "${usernameAutor}", ${idAutor})`,
  incrementarVoto: pergunta => `§incrementar_voto("${pergunta}", Votos)`,
}


module.exports = { strQueriesAprendizado }
