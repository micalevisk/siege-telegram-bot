/** <module> Novos Conhecimentos

Este módulo contém regras para a maniupulação de fatos do
tipo questao/6 a fim de gerenciar a aprendizagem dinâmica.

@author Micael Levi
@license MIT
*/

:- encoding(utf8).

%% questao(?Pergunta:string, +RespostaDada:string, +UsernameAutor:string, +IdAutor:int, +Votos:int, +Ano:int)
:- load_files('fatos_dinamicos.pl.lock', [encoding(utf8)]).



%! incrementar_voto(+Pergunta:string, +ArquivoConhecimentoExternos:string)
incrementar_voto(Pergunta, ArquivoConhecimentoExternos) :-
  incrementar_voto(Pergunta, _, ArquivoConhecimentoExternos).

%! salvar_questao(+Pergunta:string, +RespostaDada:string, +UsernameAutor:string, +IdAutor:int, +Ano:int, +ArquivoConhecimentoExternos:string)
salvar_questao(Pergunta, RespostaDada, UsernameAutor, IdAutor, Ano, ArquivoConhecimentoExternos) :-
  string_not_empty(RespostaDada),
  string_not_empty(Pergunta),
  salvar_questao( questao(Pergunta, RespostaDada, UsernameAutor, IdAutor, 0, Ano), ArquivoConhecimentoExternos ).


%! incrementar_voto(+Pergunta:string, -VotosAtualizado:int, +ArquivoConhecimentoExternos:string)
%  Dada um pergunta que exista no conhecimento adquirido,
%  computar +1 ao número de votos negativos.
%  O fato será removido se VotosAtualizado for igual a 3.
incrementar_voto(Pergunta, VotosAtualizado, ArquivoConhecimentoExternos) :-
  questao(Pergunta, R, A, I, VotosAntigos, Ano),
  plus(1, VotosAntigos, VotosAtualizado),
  ( VotosAtualizado = 3 -> remover_questao(Pergunta, ArquivoConhecimentoExternos);
  replace_existing_fact( questao(Pergunta,R,A,I,VotosAntigos,Ano), questao(Pergunta,R,A,I,VotosAtualizado,Ano) ),
  atualizar_banco(ArquivoConhecimentoExternos) ).


%! remover_questao(+Pergunta:string, +ArquivoConhecimentoExternos:string)
%  Remove todas as questões que possuem a pergunta (String) passada.
remover_questao(Pergunta, ArquivoConhecimentoExternos) :-
  retract( questao(Pergunta,_,_,_,_,_) ),
  atualizar_banco(ArquivoConhecimentoExternos).


%! salvar_questao(+FatoQuestao:questao, ArquivoConhecimentoExternos:string)
%  Insere uma questão no banco.
salvar_questao(FatoQuestao, ArquivoConhecimentoExternos) :-
  assertz(FatoQuestao),
  atualizar_banco(ArquivoConhecimentoExternos).


%! atualizar_banco(+ArquivoConhecimentoExternos:string)
%  recupera todas os fatos darquivo "lock" e lista-os, atualizando.
%  OBS: na database dinâmica deve-se ter uma declaração "dynamic questao/5".
%  solução adaptade de https://stackoverflow.com/questions/10857202
atualizar_banco(ArquivoConhecimentoExternos) :-
  absolute_file_name(ArquivoConhecimentoExternos, Abs),
  open(Abs, write, Fd, [ encoding(utf8), lock(write) ]),
  findall(X, source_file(X,Abs), L),
  tell(Fd),
  maplist(listing, L),
  close(Fd).


%! replace_existing_fact(+OldFact:atom, +NewFact:atom)
%  remove o 'OldFact' e insere o 'NewFact' (se o primeiro existir).
%  fonte: https://stackoverflow.com/questions/37871775
replace_existing_fact(OldFact, NewFact) :-
  ( call(OldFact) -> retract(OldFact),
    assertz(NewFact); true ).

string_empty('').
string_empty("").
string_not_empty(S) :- not(string_empty(S)).