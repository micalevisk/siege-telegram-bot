/** <module> Prolog documentation processor

Este módulo contém regras para a maniupulação de fatos do
tipo questao/5 a fim de gerenciar a aprendizagem dinâmica.

@author Micael Levi
@license MIT
*/

:- encoding(utf8).

%% questao(?Pergunta:string, +Respostadada:string, +UsernameAutor:string, +IdAutor:string, +Votos:int)
:- load_files('fatos_dinamicos.pl.lock', [encoding(utf8)]).



%! incrementar_voto(+Pergunta:string)
incrementar_voto(Pergunta) :- incrementar_voto(Pergunta, _).

%! salvar_questao(+Pergunta:string, +Respostadada:string, +UsernameAutor:string, +IdAutor:string)
salvar_questao(Pergunta, Respostadada, UsernameAutor, IdAutor) :- salvar_questao( questao(Pergunta, Respostadada, UsernameAutor, IdAutor, 0) ).


%! incrementar_voto(+Pergunta:string, -VotosAtualizado:int)
%  Dada um pergunta que exista no conhecimento adquirido,
%  computar +1 ao número de votos negativos.
%  O fato será removido se VotosAtualizado for igual a 3.
incrementar_voto(Pergunta, VotosAtualizado) :-
  questao(Pergunta, R, A, I, VotosAntigos),
  plus(1, VotosAntigos, VotosAtualizado),
  ( VotosAtualizado == 3 -> remover_questao(Pergunta);
  replace_existing_fact( questao(Pergunta,R,A,I,VotosAntigos), questao(Pergunta,R,A,I,VotosAtualizado) ),
  atualizar_banco() ).


%! remover_questao(+Pergunta:string)
%  Remove todas as questões que possuem a pergunta (String) passada.
remover_questao(Pergunta) :-
  retract( questao(Pergunta,_,_,_,_) ),
  atualizar_banco().


%! salvar_questao(+FatoQuestao:)
%  Insere uma questão no banco.
salvar_questao(FatoQuestao) :-
  assertz(FatoQuestao),
  atualizar_banco().


%! atualizar_banco()
%  recupera todas os fatos darquivo "lock" e lista-os, atualizando.
%  OBS: na database dinâmica deve-se ter uma declaração "dynamic questao/5".
%  solução adaptade de https://stackoverflow.com/questions/10857202
atualizar_banco() :-
  absolute_file_name('fatos_dinamicos.pl.lock', Abs),
  open(Abs, write, Fd, [ encoding(utf8), lock(write) ]),
  findall(X, source_file(X,Abs), L),
  tell(Fd),
  maplist(listing, L),
  close(Fd).

/* __old__
atualizar_banco() :-
  absolute_file_name('fatos_dinamicos.pl.lock', Abs),
  findall(X, source_file(X,Abs), L),
  tell('fatos_dinamicos.pl.lock'),
  maplist(listing, L),
  told.
*/


%! replace_existing_fact(+OldFact:atom, +NewFact:atom)
%  remove o 'OldFact' e insere o 'NewFact' (se o primeiro existir).
%  fonte: https://stackoverflow.com/questions/37871775
replace_existing_fact(OldFact, NewFact) :-
  ( call(OldFact) -> retract(OldFact),
    assertz(NewFact); true ).


%%%%%%%% TESTES %%%%%%%%
% ?- salvar_questao( 'qual o estado com maior população', 'sei lá', 'micalevisk', '1234' )
% ?- incrementar_voto( 'qual o estado com maior população', V ).
% ?- remover_questao( 'qual o estado com maior população' ).