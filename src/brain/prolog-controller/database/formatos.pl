:- encoding(utf8).

/**
 * Definição de predicados
 * criado apenas para formatar uma entrada.
 */


%% nome_proprio(+Atom, -AtomNormalizado)
%% Identificar o Atom como nome próprio.
%% Adicionar colchetes.
nome_proprio(Atom, AtomNormalizado) :- atomic_list_concat(["{", Atom, "}"], AtomNormalizado).
