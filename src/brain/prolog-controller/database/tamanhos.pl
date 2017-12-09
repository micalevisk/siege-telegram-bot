:- encoding(utf8).

/**
 * tamanhos(-EstadosEAreas:list(NomeEstado-Area))
 *
 * EstadosEAreas é formada por pares (NomeEstado - Area),
 * vide http://eu.swi-prolog.org/pldoc/man?section=pairs,
 * e está ordenada em ordem crescente por Area, ou seja, o estado
 * de nome NomeEstado de menor área é o cabeça da lista.
 *
 * NomeEstado = nome de um dos 27 estados brasileiros
 * Area       = tamanho da área territorial (em km^2)
 *
 * fonte:
 * http://www.ibge.gov.br/home/geociencias/areaterritorial/principal.shtm
 */

tamanhos([
    ('distrito federal'    - 5779.997),
    ('sergipe'             - 21918.443),
    ('alagoas'             - 27848.140),
    ('rio de janeiro'      - 43781.588),
    ('espírito santo'      - 46086.907),
    ('rio grande do norte' - 52811.107),
    ('paraíba'             - 56468.435),
    ('santa catarina'      - 95737.954),
    ('pernambuco'          - 98076.021),
    ('amapá'               - 142828.521),
    ('ceará'               - 148887.633),
    ('acre'                - 164123.737),
    ('paraná'              - 199307.939),
    ('roraima'             - 224300.805),
    ('rondônia'            - 237765.293),
    ('são paulo'           - 248219.627),
    ('piauí'               - 251611.929),
    ('tocantins'           - 277720.412),
    ('rio grande do sul'   - 281737.888),
    ('maranhão'            - 331936.949),
    ('goiás'               - 340106.492),
    ('mato grosso do sul'  - 357145.531),
    ('bahia'               - 564732.450),
    ('minas gerais'        - 586520.732),
    ('mato grosso'         - 903202.446),
    ('pará'                - 1247955.238),
    ('amazonas'            - 1559146.876)
]).
% tamanhos(List), sort(2, @<, List, Sorted). %% ordenar por tamanho
