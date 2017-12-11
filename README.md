<div align="center">
  <a href="https://telegram.me/SIEGE_BR_bot"><img src="https://img.shields.io/badge/%F0%9F%92%AC%20Telegram-SIEGE__BR__bot-blue.svg?style=flat-square" /></a>
  <a href="https://waffle.io/micalevisk/siege-telegram-bot"><img src="https://badge.waffle.io/micalevisk/siege-telegram-bot.png?columns=all&style=flat-square" /></a>
  <a href="https://heroku.com"><img src="http://heroku-badge.herokuapp.com/?app=siege-telegram-bot&style=flat" /></a>
  <a href="http://micalevisk.mit-license.org"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" /></a>
  <div><strong>SIEGE Bot</strong> - <b>S</b>istema <b>I</b>nteligente de <b>E</b>nsino de <b>Ge</b>ografia para o Telegram</div>
  <sub>
    by
    <a href="https://github.com/micalevisk">Micael Levi</a>
  </sub>
</div>


## Sobre a base de conhecimento em [src/brain/prolog-controller/database](src/brain/prolog-controller/database)

Os fatos disponíveis nos programas dispostos neste diretório são:
> - `regiao(?Nome:string, ?QuantidadeEstados:int)`
> - `estado(?Nome:string, ?Sigla:string, ?NomeRegiao:string, ?NomeCapital:string)`
> - `tamanho(-EstadosEAreas:list(NomeEstado-Area))`
> - `municipio(?Nome:string, ?NomeEstado:string)`
> - `questao(?Pergunta:string, -RespostaDada:string, -UsernameAutor:string, -IdAutor:int, -Votos:int, -Ano:int)`

Pensando nos fatos em termos de tabela, o esquema do banco de conhecimentos fica da seguinte forma no modelo relacional:

<!-- diagrama feito em  https://erdplus.com -->
<img alt="diagrama RIR" src="docs/diagrams/diagrama-integridade-referencial.png" align="middle" width="780">

## Visão geral da estrutura
<!-- diagrama feito em  https://www.draw.io -->
<img alt="estrutura" src="docs/diagrams/arquitetura-visão-geral.png" align="middle">


-------------

## Instalação e Execução
<div align="center">
  <table align="center">
    <tr align="center">
      <td align="center">
        <b>crie um bot</b>
        <div>
          &nbsp; &nbsp; <a href="http://t.me/BotFather">@BotFather</a> &nbsp; &nbsp;
        </div>
      </td>
      <td align="center">
        <b>instale</b>
        <div><a href="http://www.swi-prolog.org" title="para o uso da linguagem Prolog">SWI-Prolog</a></div>
        <div><a href="https://nodejs.org" title="framework base">Node.Js&reg;</a></div>
      </td>
      <td align="center">
        <b>clone este repositório</b>
        <div>
          &nbsp; <kbd>git clone https://github.com/micalevisk/siege-telegram-bot</kbd> &nbsp;
        </div>
      </td>
      <td align="center">
        <b>🙏</b>
        <div>
          &nbsp; &nbsp; <kbd>npm i</kbd> &nbsp; &nbsp;
        </div>
      </td>
    </tr>
  </table>
</div>

1. Altere o nome do arquivo [`.env.example`](.env.example) para **`.env`**;
3. Altere o conteúdo do arquivo renomeado para adicionar o token do seu bot (recuperado ao criar o bot);
2. Execute **`npm start`** no terminal.


# Perguntas que serão respondidas
As perguntas listadas a seguir contém apenas sentenças que o bot entenderá _(InSeNsÍvEl aO cAsO)_
> - as perguntas tenta ser o mais breve possível (sem gerar ambiguidade)
> - algumas palavras podem ser substituídas por seus sinônimos mais comuns (além de versões sem acentuação)
> - palavras entre colchetes indicam que estes são opcionais; a barra indica uma alternativa
> - os substantivos próprios devem iniciar em maiúsculo (como manda a gramática)
> - palavras em destaque são consideradas "variáveis"; representam apenas o conceito
> - a interrogação no final da pergunta é indiferente para a compreensão do bot
> - espaços excedentes são ignorados

<!-- ORDEM MANTIDA PELO RIVESCRIPT COM PADRÕES MAIS ESPECÍCIOS PRIMEIRO -->
1. qual [é] [a] capital/sede/metrópole do/de/da `Estado`
2. `Município` é [a] capital/sede/metrópole de qual/algum estado?
3. `Município` é [a] capital/sede/metrópole do/de/da `Estado`
4. Existe/Há algum estado cuja [a] capital/sede/metrópole tem/possua o mesmo nome do estado?
14. O [estado [do/de/da]] `Estado` tem/possui quantas/quantos cidades/municípios?
17. `Estado`/`Município` (está/fica [localizado])/(se localiza) em qual região?

<!--§
### *Capitais dos Estados Brasileiros*
~1. Qual [a] capital do/de/da `Estado`?
~2. Qual [a] capital do Brasil?
~3. [A] cidade/município [do/de] `Municipio` é capital do/de/da `Estado`?
~4. Existe/Há algum estado cuja [a] capital tem/possui o mesmo nome do estado?
5. `Municipio` é a/o capital de qual estado?
6. `Municipio` é a/o capital de algum estado?
7. `Municipio` é a/o capital do/de/da `Estado`?

### *Estados e Regiões*
8.  Qual [é] [o] estado [que] tem/possui mais cidades/municípios?
9.  Qual [é] [o] estado [que] tem/possui menos cidades/municípios?
10. Quais estados [brasileiros] estão no/na [região] `Regiao`?
11. Quais [são] [as] regiões [que] possuem até `Numero` estados?
12. Quantos estados [o] Brasil tem/possui?
13. Quantos estados a/o [região] `Regiao` delimita?
~14. Quantas/Quantos cidades/municípios o estado [do/de/da] `Estado` tem/possui?
15. [A/O cidade/município do/de] `Municipio` está/fica em qual estado?
16. [A/O estado/cidade/município do/de/da] `Estado`/`Municipio` está/fica na região `Regiao`?
~17. [A/O estado do/de/da] `Estado`/`Municipio` está/fica em qual região?

### *Tamanho Territorial (estados)*
18. Qual [é] [o] tamanho territorial do/de/da `Estado`?
19. Qual estado tem/possui [o] menor tamanho [territorial]?
20. Qual estado tem/possui [o] maior tamanho [territorial]?
21. Qual [é] [o] tamanho territorial do Brasil?
22. Quais [são] os estados de maior e menor tamanho [territorial]?
-->

<!--
### *Contingente Populacional* **(sem dados)**
24. Qual é a população do/de `Estado`?
25. Qual é a população da região `Regiao`?
26. Qual é o estado com maior população?
27. Qual é o estado com menor população?
28. Qual é a população do `Municipio`?
29. Existem estados com população inferior a `Numero` habitantes?
-->

<!--
### *Limites e Fronteiras dos Estados Brasileiros* **(sem dados)**
30. Que estados fazem fronteira com o estado `Estado`?
31. Qual é o estado que faz fronteira com mais estados?
32. Qual é o estado que faz fronteira com menos estados?
33. Quais são os estados que são banhados pelo mar?
34. Quais são as capitais brasileiras que ficam em ilhas?
35. Existe algum estado que faz fronteira com apenas um estado?
36. Descreva um caminho rodoviário entre o estado do/de `Estado1` e `Estado2`, sem sair das fronteiras do Brasil.
-->

<!--§
### *Extras*
36. O que [o/a] `Estado`/`Municipio`/`Regiao` é para o Brasil?
37. Qual [é] a bandeira do/de/da `Estado`/Brasil?
-->

## Expressões regulares utilizadas para identificar as perguntas
> - o texto deve ser truncado (espaços excedentes removidos) e a comparação deve ser case insensitive
> - os termos utilizados no casamento são os sinônimos principais

<!--§
| no. | regex |
|:----|:------|
| 1   | `^(?:qual) .*\bcapital\b.+d[oea] (.+)`
| 2   | `^(?:qual) .*\b(capital)\b.+do (brasil)\b.+`
| 3   | `^.*\bmunicípio (?:d[oe] )?(.+) é capital d[oea] (.+)`
| 4   | `^(existe) .*algum estado cuja .*\bcapital .+ mesmo nome .*\bd[oe] .+`
| 5   | `(.+) é (?:[ao] .*)?capital de qual estado\b.+`
| 6   | `(.+) é (?:[ao] .*)?capital de algum estado\b.+`
| 7   | `(.+) é (?:[ao] .*)?capital d[oea] (.+)`
| 8   | `^(?:qual) .*\b(estado) .+ (mais) (municípios)\b.+`
| 9   | `^(?:qual) .*\b(estado) .+ (menos) (municípios)\b.+`
| 10  | `^(?:quais) estados .*\bestão (.+)`
| 11  | `^(?:quais) .*\bregiões .*\bpossuem .*\baté (\d+) estados\b.+`
| 12  | `^(?:quantos) (estados) .*\b(brasil) (tem)\b.+`
| 13  | `^(?:quantos) estados .*\b(?:região)? (.+) delimita\b.+`
| 14  | `^(?:quant[oa]s) municípios [oa]? (?:estado )?(.+) tem\b.+`
| 15  | `^(.+) fica .+ qual estado\b.+`
| 16  | `^(.+) fica .*\bna região (.+)`
| 17  | `^(.+) fica .+ qual região\b.+`
| 18  | `^(?:qual) .*\btamanho territorial d[oea] estado (.+)`
| 19  | `^(?:qual) estado .+ menor tamanho\b.+`
| 20  | `^(?:qual) estado .+ maior tamanho\b.+`
| 21  | `^(?:qual) .*\btamanho territorial do brasil\b.+`
| 22  | `^(?:quais) .+ (estados) .+ (maior) e (menor) (tamanho)\b.+`
| 36  | `^(?:o que) (.+) é para .*\bbrasil\b.+`
| 37  | `^(?:qual) .+ bandeira d[oea] (.+)`
-->

# Consultas para as perguntas <small>(implementadas)</small>
> - O símbolo '+' indica que a variável (que segue) deve ser uma entrada, i.e., ter valor.
> - As querys terminadas com ponto final já estão no formato exato, i.e., estão prontas para serem executadas.

| no. | query |
|:----|:------|
| 1   | `capital(+Estado, NC)`
| 2   | `capital(NE, +Município)`
| 3   | `capital(+Estado, +Município)`
| 4   | `findall(E, capital(E,E), +Quais), list_nonempty(+Quais, +Existe)`
| 14  | `municipios(+Estado, Municipios), length(Municipios, QtdMunicipios)`
| 17  | `regiao_de(+Nome, Regiao)`


<!--§
| no. | query | saída |
|:----|:------|------:|
| 1   | `capital(+Estado, NomeCapital)`                                             | __NomeCapital__                  |
| 2   | `capital(brasil, Capital).`                                                 | __Capital__                      |
| 3   | `capital(+Estado, +Municipio)`                                              | _boolean_                        |
| 4   | `findall(E, capital(E,E), Quais), list_nonempty(Quais, Existe).`            | __Existe__                       |
| 5   | `capital(NomeEstado, +Municipio)`                                           | __NomeEstado__                   |
| 6   | `capital(Estado, +Municipio)`                                               | __Estado__                       |
| 7   | `capital(+Estado, +Municipio)`                                              | _boolean_                        |
| 8   | `estados_municipios(_, E), first(E, Estado-QtdMunicipios).`                 | __Estado__, __QtdMunicipios__    |
| 9   | `estados_municipios(_, E), last(E, Estado-QtdMunicipios).`                  | __Estado__, __QtdMunicipios__    |
| 10  | `findall(E, estado(E,_,+Regiao,_), ListaEstados)`                           | __ListaEstados__                 |
| 11  | `findall(R, (regiao(R, Q), Q =< +Numero), ListaRegioes)`                    | __ListaRegioes__                 |
| 12  | `findall(QtdEstados, regiao(_, QtdEstados), L), sum_list(L, QtdEstados).`   | __QtdEstados__                   |
| 13  | `regiao(+Regiao, QtdEstados)`                                               | __QtdEstados__                   |
| 14  | `municipios(+Estado, Municipios), length(Municipios, QtdMunicipios)`        | __QtdMunicipios__                |
| 15  | `municipio(+Municipio, Estado)`                                             | __Estado__                       |
| 16  | `regiao_de(+Nome, +Regiao)`                                                 | _boolean_                        |
| 17  | `regiao_de(+Nome, Regiao)`                                                  | __Regiao__                       |
| 18  | `tamanho(+Estado, Tamanho)`                                                 | __Tamanho__                      |
| 19  | `menor_area(MenorArea, MenorEstado).`                                       | __MenorEstado__                  |
| 20  | `maior_area(MaiorArea, MaiorEstado).`                                       | __MaiorEstado__                  |
| 21  | `tamanho(brasil, TamanhoTotal).`                                            | __TamanhoTotal__                 |
| 22  | `maior_area(MaiorArea, MaiorEstado), menor_area(MenorArea, MenorEstado).`   | __MaiorEstado__, __MenorEstado__ |
| 36  | `relacao(+Nome, Relacao)`                                                   | __Relacao__                      |
-->
