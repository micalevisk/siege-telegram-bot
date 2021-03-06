:- encoding(utf8).

/**
 * estado(?Nome, ?Sigla, ?NomeRegiao, ?NomeCapital)
 * "estado do/de ..."
 *
 * Nome        = nome de uma das 27 unidades federativas brasileiras
 * Sigla       = sigla do estado
 * NomeRegiao  = nome da região em que está localizado
 * NomeCapital = nome da sua cidade/município capital
 *
 * fontes:
 * https://github.com/chandez/Estados-Cidades-IBGE
 * http://www.suapesquisa.com/geografia/estados_capitais_brasil.htm
 */

estado('acre',      'ac', 'norte', 'rio branco').
estado('amapá',     'ap', 'norte', 'macapá').
estado('amazonas',  'am', 'norte', 'manaus').
estado('pará',      'pa', 'norte', 'belém').
estado('rondônia',  'ro', 'norte', 'porto velho').
estado('roraima',   'rr', 'norte', 'boa vista').
estado('tocantins', 'to', 'norte', 'palmas').

estado('alagoas',             'al', 'nordeste', 'maceió').
estado('bahia',               'ba', 'nordeste', 'salvador').
estado('ceará',               'ce', 'nordeste', 'fortaleza').
estado('maranhão',            'ma', 'nordeste', 'são luís').
estado('paraíba',             'pb', 'nordeste', 'joão pessoa').
estado('pernambuco',          'pe', 'nordeste', 'recife').
estado('piauí',               'pi', 'nordeste', 'teresina').
estado('rio grande do norte', 'rn', 'nordeste', 'natal').
estado('sergipe',             'se', 'nordeste', 'aracaju').

estado('paraná',            'pr', 'sul', 'curitiba').
estado('rio grande do sul', 'rs', 'sul', 'porto alegre').
estado('santa catarina',    'sc', 'sul', 'florianópolis').

estado('espírito santo', 'es', 'sudeste', 'vitória').
estado('minas gerais',   'mg', 'sudeste', 'belo horizontal').
estado('rio de janeiro', 'rj', 'sudeste', 'rio de janeiro').
estado('são paulo',      'sp', 'sudeste', 'são paulo').

estado('distrito federal',   'df', 'centro-oeste', 'brasília').
estado('goiás',              'go', 'centro-oeste', 'goiânia').
estado('mato grosso',        'mt', 'centro-oeste', 'cuibá').
estado('mato grosso do sul', 'ms', 'centro-oeste', 'campo grande').