:- encoding(utf8).

/**
 * Definição de predicados
 * criado apenas para formatar uma entrada.
 */


%% nome_proprio(+Atom, -AtomNormalizado)
%% Identificar o Atom como nome próprio.
%% Adicionar colchetes.
nome_proprio(Atom, AtomNormalizado) :- atomic_list_concat(["{", Atom, "}"], AtomNormalizado).


%% texto(+Str, -StrAtom)
%% Retornar em um Atom a string passada.
%% wrapper para format/3
texto(Str, StrAtom) :-
  format(atom(StrAtom), '~w', [ Str ]).


%% bool_to_str(+Fact, +StrTrue, +StrFalse, -StrBool)
%% Retorna em StrBool a string de StrTrue se Fact der True, senão StrFalse.
bool_to_str(Fact, StrTrue, StrFalse, StrBool) :-
  call(Fact) -> texto(StrTrue, StrBool);
  texto(StrFalse, StrBool).

%% bool_to_str(+Fact, -StrBool)
%% Trata 'true' como 'sim' e 'false' como 'não'.
bool_to_str(Fact, StrBool) :-
  bool_to_str(Fact, 'Sim', 'Não', StrBool).