import { Proprio, RoutePoint } from './types';

// Helper to generate random coordinates around a center point to simulate geocoding
const generateCoord = (centerLat: number, centerLng: number, spread: number = 0.025) => {
  return {
    lat: centerLat + (Math.random() - 0.5) * spread,
    lng: centerLng + (Math.random() - 0.5) * spread
  };
};

// Regional Centers in BH (Calibrated for better distribution)
const REGIONAL_CENTERS: Record<string, { lat: number, lng: number }> = {
  "BARREIRO": { lat: -19.977, lng: -44.014 },
  "CENTRO-SUL": { lat: -19.935, lng: -43.937 },
  "LESTE": { lat: -19.915, lng: -43.915 },
  "NORDESTE": { lat: -19.875, lng: -43.925 },
  "NOROESTE": { lat: -19.908, lng: -44.002 },
  "NORTE": { lat: -19.833, lng: -43.933 },
  "OESTE": { lat: -19.933, lng: -43.983 },
  "PAMPULHA": { lat: -19.866, lng: -43.970 },
  "VENDA NOVA": { lat: -19.816, lng: -43.983 }
};

// Extracted Data from PDF (Massive Dataset)
const RAW_DATA = [
  // --- BARREIRO ---
  { cod: "1001", nome: "ESCOLA MUNICIPAL AIRES DA MATA MACHADO", tipo: "AVE", end: "SENADOR LEVINDO COELHO", num: "632", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1002", nome: "ESCOLA MUNICIPAL ANA ALVES TEIXEIRA", tipo: "RUA", end: "BARAO DO MONTE ALTO", num: "300", bairro: "Cardoso", reg: "BARREIRO" },
  { cod: "1003", nome: "ESCOLA MUNICIPAL ANTONIO ALEIXO", tipo: "AVE", end: "OLINTO MEIRELES", num: "250", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1004", nome: "ESCOLA MUNICIPAL ANTONIO MOURAO GUIMARAES", tipo: "RUA", end: "INTERSINDICAL", num: "270", bairro: "Flávio de Oliveira", reg: "BARREIRO" },
  { cod: "1005", nome: "ESCOLA MUNICIPAL ANTONIO SALLES BARBOSA", tipo: "RUA", end: "SABINO JOSE FERREIRA", num: "5", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1006", nome: "ESCOLA MUNICIPAL AURELIO BUARQUE DE HOLANDA", tipo: "RUA", end: "FORTUNATO BRUNO DINIZ", num: "40", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1008", nome: "ESCOLA MUNICIPAL CONEGO SEQUEIRA", tipo: "RUA", end: "FLOR CHUVA DE PRATA", num: "40", bairro: "Mineirão", reg: "BARREIRO" },
  { cod: "1009", nome: "ESCOLA MUNICIPAL DINORAH MAGALHAES FABRI", tipo: "RUA", end: "PAVAO", num: "295", bairro: "Esperança", reg: "BARREIRO" },
  { cod: "1010", nome: "ESCOLA MUNICIPAL DULCE MARIA HOMEM", tipo: "RUA", end: "TRES MARIAS", num: "221", bairro: "Miramar", reg: "BARREIRO" },
  { cod: "1013", nome: "ESCOLA MUNICIPAL HELENA ANTIPOFF", tipo: "RUA", end: "ANTONIO EUSTAQUIO PIAZZA", num: "4020", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1014", nome: "ESCOLA MUNICIPAL JONAS BARCELLOS CORREA", tipo: "RUA", end: "PROFESSORA DIRCE MARIA", num: "240", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1019", nome: "ESCOLA MUNICIPAL PEDRO NAVA", tipo: "RUA", end: "SAO PEDRO DA ALDEIA", num: "445", bairro: "Serra do Curral", reg: "BARREIRO" },
  { cod: "1028", nome: "ESCOLA MUNICIPAL PRESIDENTE ITAMAR FRANCO", tipo: "AVE", end: "PERIMETRAL", num: "2911", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1030", nome: "ESCOLA MUNICIPAL POLO DE EDUCAÇÃO INTEGRADA", tipo: "PCA", end: "MODESTINO SALES BARBOSA", num: "50", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1064", nome: "EMEI MALDONADO", tipo: "RUA", end: "ALCINDO GONCALVES COTTA", num: "105", bairro: "Diamante", reg: "BARREIRO" },
  { cod: "1080", nome: "EMEI BARREIRO", tipo: "RUA", end: "SAO PAULO DA CRUZ", num: "65", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1101", nome: "CENTRO DE SAUDE BARREIRO - CARLOS RENATO DIAS", tipo: "RUA", end: "JOSE GONCALVES", num: "375", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1103", nome: "CENTRO DE SAUDE BARREIRO DE CIMA", tipo: "PCA", end: "MODESTINO SALES BARBOSA", num: "100", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1104", nome: "CENTRO DE SAUDE BONSUCESSO", tipo: "RUA", end: "DOUTOR CRISTIANO REZENDE", num: "1875", bairro: "Bonsucesso", reg: "BARREIRO" },
  { cod: "1160", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL BARREIRO", tipo: "RUA", end: "DESEMBARGADOR RIBEIRO DA LUZ", num: "29", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1200", nome: "FARMACIA DISTRITAL BARREIRO", tipo: "PCA", end: "MODESTINO SALES BARBOSA", num: "100", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1230", nome: "PARQUE CARLOS DE FARIA TAVARES", tipo: "AVE", end: "PERIMETRAL", num: "800", bairro: "Distrito Industrial", reg: "BARREIRO" },
  { cod: "1242", nome: "PARQUE ESTADUAL SERRA DO ROLA MOCA", tipo: "RUA", end: "WILSON DE OLIVEIRA", num: "47", bairro: "Mineirão", reg: "BARREIRO" },
  { cod: "1350", nome: "RESTAURANTE POPULAR DOM MAURO BASTOS", tipo: "AVE", end: "AFONSO VAZ DE MELO", num: "1001", bairro: "Barreiro", reg: "BARREIRO" },

  // --- CENTRO-SUL ---
  { cod: "2001", nome: "ESCOLA MUNICIPAL PAULO MENDES CAMPOS", tipo: "RUA", end: "CARANGOLA", num: "288", bairro: "Santo Antônio", reg: "CENTRO-SUL" },
  { cod: "2002", nome: "ESCOLA MUNICIPAL BENJAMIM JACOB", tipo: "RUA", end: "VENEZUELA", num: "643", bairro: "Sion", reg: "CENTRO-SUL" },
  { cod: "2004", nome: "ESCOLA MUNICIPAL IMACO", tipo: "RUA", end: "GONCALVES DIAS", num: "1180", bairro: "Boa Viagem", reg: "CENTRO-SUL" },
  { cod: "2005", nome: "ESCOLA MUNICIPAL MARCONI", tipo: "AVE", end: "DO CONTORNO", num: "8476", bairro: "Santo Agostinho", reg: "CENTRO-SUL" },
  { cod: "2103", nome: "CENTRO DE SAUDE CONJUNTO SANTA MARIA", tipo: "RUA", end: "PASTOR BENJAMIM MAIA", num: "57", bairro: "Ápia", reg: "CENTRO-SUL" },
  { cod: "2108", nome: "CENTRO DE SAUDE OSWALDO CRUZ", tipo: "RUA", end: "UBERABA", num: "270", bairro: "Barro Preto", reg: "CENTRO-SUL" },
  { cod: "2109", nome: "CENTRO DE SAUDE SANTA LUCIA", tipo: "RUA", end: "MURILLO MORAES DE ANDRADE", num: "140", bairro: "Santo Antônio", reg: "CENTRO-SUL" },
  { cod: "2150", nome: "UNIDADE DE PRONTO ATENDIMENTO CENTRO SUL", tipo: "RUA", end: "DOMINGOS VIEIRA", num: "488", bairro: "Santa Efigênia", reg: "CENTRO-SUL" },
  { cod: "2200", nome: "FARMACIA DISTRITAL CENTRO SUL", tipo: "RUA", end: "PERNAMBUCO", num: "237", bairro: "Funcionários", reg: "CENTRO-SUL" },
  { cod: "2230", nome: "PARQUE MUNICIPAL AMÉRICO RENNÉ GIANNETTI", tipo: "AVE", end: "AFONSO PENA", num: "1377", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2238", nome: "PARQUE MUNICIPAL DAS MANGABEIRAS", tipo: "AVE", end: "JOSE DE PATROCINIO PONTES", num: "580", bairro: "Mangabeiras", reg: "CENTRO-SUL" },
  { cod: "2254", nome: "PRAÇA SETE DE SETEMBRO", tipo: "AVE", end: "AFONSO PENA", num: "705", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2258", nome: "PRAÇA DA LIBERDADE", tipo: "PCA", end: "DA LIBERDADE", num: "435", bairro: "Savassi", reg: "CENTRO-SUL" },
  { cod: "2490", nome: "SEDE DA PREFEITURA DE BELO HORIZONTE", tipo: "AVE", end: "AFONSO PENA", num: "1212", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2501", nome: "MUSEU DA IMAGEM E DO SOM", tipo: "AVE", end: "ALVARES CABRAL", num: "560", bairro: "Lourdes", reg: "CENTRO-SUL" },
  { cod: "2602", nome: "GUARDA CIVIL MUNICIPAL DE BELO HORIZONTE", tipo: "AVE", end: "DOS ANDRADAS", num: "915", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2685", nome: "TEATRO FRANCISCO NUNES", tipo: "AVE", end: "AFONSO PENA", num: "1377", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2688", nome: "MUSEU DE ARTES E OFICIOS", tipo: "PCA", end: "RUI BARBOSA", num: "600", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2704", nome: "MERCADO CENTRAL (TURISTICA)", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "744", bairro: "Centro", reg: "CENTRO-SUL" },

  // --- LESTE ---
  { cod: "3005", nome: "ESCOLA MUNICIPAL LEVINDO LOPES", tipo: "RUA", end: "FLUORINA", num: "1460", bairro: "Paraíso", reg: "LESTE" },
  { cod: "3014", nome: "ESCOLA MUNICIPAL SANTOS DUMONT", tipo: "AVE", end: "MEM DE SA", num: "600", bairro: "Santa Efigênia", reg: "LESTE" },
  { cod: "3015", nome: "ESCOLA MUNICIPAL SAO RAFAEL", tipo: "RUA", end: "CORONEL OTAVIO DINIZ", num: "31", bairro: "Pompéia", reg: "LESTE" },
  { cod: "3065", nome: "EMEI ALTO VERA CRUZ", tipo: "RUA", end: "FOSFORO", num: "75", bairro: "Taquaril", reg: "LESTE" },
  { cod: "3100", nome: "CENTRO DE SAUDE ALTO VERA CRUZ", tipo: "RUA", end: "GENERAL OSORIO", num: "959", bairro: "Alto Vera Cruz", reg: "LESTE" },
  { cod: "3114", nome: "CENTRO DE SAUDE HORTO", tipo: "RUA", end: "ANHANGUERA", num: "224", bairro: "Santa Tereza", reg: "LESTE" },
  { cod: "3219", nome: "MERCADO DISTRITAL SANTA TEREZA", tipo: "RUA", end: "SAO GOTARDO", num: "273", bairro: "Santa Tereza", reg: "LESTE" },
  { cod: "3241", nome: "PRAÇA DUQUE DE CAXIAS", tipo: "RUA", end: "MARMORE", num: "145", bairro: "Santa Tereza", reg: "LESTE" },
  { cod: "3249", nome: "UNIDADE DE PRONTO ATENDIMENTO LESTE", tipo: "AVE", end: "DOS ANDRADAS", num: "7450", bairro: "Vera Cruz", reg: "LESTE" },
  { cod: "3263", nome: "URPV ANDRADAS", tipo: "AVE", end: "DOS ANDRADAS", num: "5965", bairro: "Camponesa III", reg: "LESTE" },
  { cod: "3223", nome: "PARQUE FLORESTAL ESTADUAL DA BALEIA", tipo: "RUA", end: "JURAMENTO", num: "1464", bairro: "Baleia", reg: "LESTE" },

  // --- NORDESTE ---
  { cod: "4006", nome: "ESCOLA MUNICIPAL FRANCISCO BRESSANE", tipo: "RUA", end: "AIURUOCA", num: "501", bairro: "Sao Paulo", reg: "NORDESTE" },
  { cod: "4009", nome: "ESCOLA MUNICIPAL HENRIQUETA LISBOA", tipo: "RUA", end: "GEORGINA PADUA", num: "297", bairro: "Penha", reg: "NORDESTE" },
  { cod: "4011", nome: "ESCOLA MUNICIPAL HUGO PINHEIRO SOARES", tipo: "RUA", end: "JUNDIAI", num: "567", bairro: "Concórdia", reg: "NORDESTE" },
  { cod: "4063", nome: "EMEI SÃO GABRIEL", tipo: "RUA", end: "SAO JOAO DA SERRA", num: "140", bairro: "São Gabriel", reg: "NORDESTE" },
  { cod: "4071", nome: "EMEI OURO MINAS", tipo: "RUA", end: "DAS URSULINAS", num: "98", bairro: "Ouro Minas", reg: "NORDESTE" },
  { cod: "4100", nome: "CENTRO DE SAUDE ALCIDES LINS", tipo: "RUA", end: "PANEMA", num: "275", bairro: "Concórdia", reg: "NORDESTE" },
  { cod: "4101", nome: "CENTRO DE SAUDE CACHOEIRINHA", tipo: "RUA", end: "BORBOREMA", num: "1325", bairro: "Cachoeirinha", reg: "NORDESTE" },
  { cod: "4117", nome: "CENTRO DE SAUDE SAO PAULO", tipo: "RUA", end: "AIURUOCA", num: "455", bairro: "Sao Paulo", reg: "NORDESTE" },
  { cod: "4150", nome: "UNIDADE DE PRONTO ATENDIMENTO NORDESTE", tipo: "RUA", end: "JOAQUIM GOUVEIA", num: "560", bairro: "Sao Paulo", reg: "NORDESTE" },
  { cod: "4201", nome: "CENTRAL DE ABASTECIMENTO SAO PAULO", tipo: "RUA", end: "MARIA PIETRA MACHADO", num: "125", bairro: "Sao Paulo", reg: "NORDESTE" },
  { cod: "4237", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA NORDESTE", tipo: "RUA", end: "PRINCESA LEOPOLDINA", num: "485", bairro: "Ipiranga", reg: "NORDESTE" },
  { cod: "4283", nome: "ESTAÇÃO INTEGRACAO SAO GABRIEL", tipo: "AVE", end: "CRISTIANO MACHADO", num: "5600", bairro: "São Gabriel", reg: "NORDESTE" },
  
  // --- NOROESTE ---
  { cod: "5001", nome: "ESCOLA PROFISSIONALIZANTE RAIMUNDA DA SILVA", tipo: "RUA", end: "CARMO DO RIO CLARO", num: "411", bairro: "Pedreira Prado Lopes", reg: "NOROESTE" },
  { cod: "5005", nome: "ESCOLA MUNICIPAL DOM JAIME DE BARROS CAMARA", tipo: "RUA", end: "FREDERICO BRACHER JUNIOR", num: "123", bairro: "Carlos Prates", reg: "NOROESTE" },
  { cod: "5007", nome: "ESCOLA MUNICIPAL HONORINA DE BARROS", tipo: "PCA", end: "PROFESSOR CORREA NETO", num: "200", bairro: "São Cristóvão", reg: "NOROESTE" },
  { cod: "5103", nome: "CENTRO DE SAUDE CARLOS PRATES", tipo: "RUA", end: "RIACHUELO", num: "35", bairro: "Carlos Prates", reg: "NOROESTE" },
  { cod: "5104", nome: "CENTRO DE SAUDE DOM BOSCO", tipo: "RUA", end: "OLINTO MAGALHAES", num: "1939", bairro: "Dom Bosco", reg: "NOROESTE" },
  { cod: "5113", nome: "CENTRO DE SAUDE PADRE EUSTAQUIO", tipo: "RUA", end: "HUMAITA", num: "1125", bairro: "Padre Eustáquio", reg: "NOROESTE" },
  { cod: "5151", nome: "COMPLEXO MUNICIPAL DE ATENÇAO A SAUDE", tipo: "RUA", end: "FREDERICO BRACHER JUNIOR", num: "144", bairro: "Padre Eustáquio", reg: "NOROESTE" },
  { cod: "5216", nome: "CENTRO CULTURAL PADRE EUSTAQUIO", tipo: "RUA", end: "JACUTINGA", num: "550", bairro: "Padre Eustáquio", reg: "NOROESTE" },
  { cod: "5230", nome: "HOSPITAL ODILON BHERENS", tipo: "RUA", end: "PEDRO LESSA", num: "50", bairro: "São Cristóvão", reg: "NOROESTE" },
  { cod: "5347", nome: "FEIRA COBERTA DO PADRE EUSTÁQUIO", tipo: "RUA", end: "PARA DE MINAS", num: "815", bairro: "Padre Eustáquio", reg: "NOROESTE" },

  // --- NORTE ---
  { cod: "6001", nome: "ESCOLA MUNICIPAL ACADEMICO VIVALDI MOREIRA", tipo: "RUA", end: "AGENOR DE PAULA ESTRELA", num: "393", bairro: "Jaqueline", reg: "NORTE" },
  { cod: "6004", nome: "ESCOLA MUNICIPAL FLORESTAN FERNANDES", tipo: "RUA", end: "PAU-FERRO", num: "360", bairro: "Solimões", reg: "NORTE" },
  { cod: "6065", nome: "EMEI JARDIM GUANABARA", tipo: "RUA", end: "JOAO ALVARES CABRAL", num: "77", bairro: "Jardim Guanabara", reg: "NORTE" },
  { cod: "6100", nome: "CENTRO DE SAUDE AARAO REIS", tipo: "RUA", end: "WALDOMIRO LOBO", num: "177", bairro: "Aarão Reis", reg: "NORTE" },
  { cod: "6103", nome: "CENTRO DE SAUDE FLORAMAR", tipo: "RUA", end: "IGARAUNAS", num: "15", bairro: "Floramar", reg: "NORTE" },
  { cod: "6118", nome: "CENTRO DE SAUDE JARDIM GUANABARA", tipo: "RUA", end: "FANNY MARTINS DE BARROS", num: "71", bairro: "Jardim Guanabara", reg: "NORTE" },
  { cod: "6150", nome: "UNIDADE DE PRONTO ATENDIMENTO NORTE", tipo: "AVE", end: "RISOLETA NEVES", num: "2580", bairro: "Guarani", reg: "NORTE" },
  { cod: "6205", nome: "CENTRO DE CONTROLE DE ZOONOSES", tipo: "RUA", end: "EDNA QUENTEL", num: "225", bairro: "São Bernardo", reg: "NORTE" },
  { cod: "6213", nome: "CENTRO CULTURAL JARDIM GUANABARA", tipo: "RUA", end: "JOAO ALVARES CABRAL", num: "277", bairro: "Jardim Guanabara", reg: "NORTE" },

  // --- OESTE ---
  { cod: "7001", nome: "EMEI PROFESSOR CHRISTOVAM COLOMBO DOS SANTOS", tipo: "RUA", end: "VEREADOR NELSON CUNHA", num: "137", bairro: "Estoril", reg: "OESTE" },
  { cod: "7002", nome: "ESCOLA MUNICIPAL DEPUTADO MILTON SALLES", tipo: "RUA", end: "TEOFILO FILHO", num: "222", bairro: "Jardim América", reg: "OESTE" },
  { cod: "7013", nome: "ESCOLA MUNICIPAL SALGADO FILHO", tipo: "RUA", end: "CLOVIS CYRILO LIMONGE", num: "151", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7061", nome: "EMEI GAMELEIRA", tipo: "AVE", end: "AMAZONAS", num: "5855", bairro: "Gameleira", reg: "OESTE" },
  { cod: "7101", nome: "CENTRO DE SAUDE BETANIA", tipo: "RUA", end: "DAS CANOAS", num: "678", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7103", nome: "CENTRO DE SAUDE CICERO IDELFONSO", tipo: "RUA", end: "AGUANIL", num: "238", bairro: "Vista Alegre", reg: "OESTE" },
  { cod: "7107", nome: "CENTRO DE SAUDE SALGADO FILHO", tipo: "RUA", end: "CAMPINA VERDE", num: "375", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7217", nome: "EMPRESA DE TRANSPORTE E TRANSITO DE BELO HORIZONTE", tipo: "AVE", end: "ENGENHEIRO CARLOS GOULART", num: "900", bairro: "Buritis", reg: "OESTE" },
  { cod: "7273", nome: "PARQUE AGGEO PIO SOBRINHO", tipo: "AVE", end: "PROFESSOR MARIO WERNECK", num: "2691", bairro: "Buritis", reg: "OESTE" },

  // --- PAMPULHA ---
  { cod: "8003", nome: "EM CARMELITA CARVALHO GARCIA", tipo: "PCA", end: "OLGA GATTI BARBOSA", num: "10", bairro: "Ouro Preto", reg: "PAMPULHA" },
  { cod: "8005", nome: "EMEI HENFIL", tipo: "RUA", end: "BOAVENTURA", num: "844", bairro: "Indaiá", reg: "PAMPULHA" },
  { cod: "8011", nome: "ESCOLA MUNICIPAL PROFESSORA ALICE NACIF", tipo: "RUA", end: "EXPEDICIONARIO PAULO DE SOUZA", num: "721", bairro: "Confisco", reg: "PAMPULHA" },
  { cod: "8100", nome: "CENTRO DE SAUDE CONFISCO", tipo: "RUA", end: "POLYCARPO DE MAGALHAES VIOTTI", num: "261", bairro: "Bandeirantes", reg: "PAMPULHA" },
  { cod: "8101", nome: "CENTRO DE SAUDE DOM ORIONE", tipo: "AVE", end: "OTACILIO NEGRAO DE LIMA", num: "2220", bairro: "São Luíz", reg: "PAMPULHA" },
  { cod: "8117", nome: "CASA DE PASSAGEM DOM BOSCO", tipo: "RUA", end: "BARAO DE PETROPOLIS", num: "211", bairro: "Itatiaia", reg: "PAMPULHA" },
  { cod: "8276", nome: "AEROPORTO DA PAMPULHA", tipo: "PCA", end: "BAGATELLE", num: "204", bairro: "Aeroporto", reg: "PAMPULHA" },
  { cod: "8277", nome: "IGREJA DE SAO FRANCISCO DE ASSIS", tipo: "AVE", end: "OTACILIO NEGRAO DE LIMA", num: "3000", bairro: "Lagoa da Pampulha", reg: "PAMPULHA" },
  { cod: "8284", nome: "MUSEU CASA KUBITSCHEK", tipo: "AVE", end: "OTACILIO NEGRAO DE LIMA", num: "4188", bairro: "Bandeirantes", reg: "PAMPULHA" },
  { cod: "8213", nome: "JARDIM ZOOLÓGICO", tipo: "AVE", end: "OTACILIO NEGRAO DE LIMA", num: "8000", bairro: "Bandeirantes", reg: "PAMPULHA" },
  { cod: "8200", nome: "CENTRO CULTURAL PAMPULHA", tipo: "RUA", end: "EXPEDICIONARIO PAULO DE SOUZA", num: "185", bairro: "Urca", reg: "PAMPULHA" },
  { cod: "8075", nome: "EMEI ENGENHO NOGUEIRA", tipo: "RUA", end: "ENGENHO DO MAR", num: "10", bairro: "Engenho Nogueira", reg: "PAMPULHA" },

  // --- VENDA NOVA ---
  { cod: "9001", nome: "CONSELHO TUTELAR VENDA NOVA", tipo: "RUA", end: "BOA VISTA", num: "189", bairro: "São João Batista", reg: "VENDA NOVA" },
  { cod: "9003", nome: "ESCOLA MUNICIPAL ADAUTO LUCIO CARDOSO", tipo: "RUA", end: "ERNESTO GAZZOLLI", num: "164", bairro: "Céu Azul", reg: "VENDA NOVA" },
  { cod: "9006", nome: "ESCOLA MUNICIPAL ARMANDO ZILLER", tipo: "RUA", end: "GERALDO ILIDIO TEIXEIRA", num: "283", bairro: "Mantiqueira", reg: "VENDA NOVA" },
  { cod: "9009", nome: "ESCOLA MUNICIPAL CORA CORALINA", tipo: "RUA", end: "LISBOA", num: "54", bairro: "Copacabana", reg: "VENDA NOVA" },
  { cod: "9030", nome: "EMEI ALESSANDRA SALUM CADAR", tipo: "RUA", end: "BUDAPESTE", num: "68", bairro: "Europa", reg: "VENDA NOVA" },
  { cod: "9102", nome: "CENTRO DE SAUDE CEU AZUL", tipo: "RUA", end: "ALICE MARQUES", num: "187", bairro: "Céu Azul", reg: "VENDA NOVA" },
  { cod: "9108", nome: "CENTRO DE SAUDE MINAS CAIXA", tipo: "RUA", end: "CAPITAO SERGIO PIRES", num: "226", bairro: "Minascaixa", reg: "VENDA NOVA" },
  { cod: "9212", nome: "FARMACIA DISTRITAL VENDA NOVA", tipo: "RUA", end: "HAIA", num: "148", bairro: "Europa", reg: "VENDA NOVA" },
  { cod: "9207", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL VENDA NOVA", tipo: "RUA", end: "BOA VISTA", num: "228", bairro: "São João Batista", reg: "VENDA NOVA" },
  { cod: "9355", nome: "PRAÇA TRES MIL SETECENTOS E DEZENOVE", tipo: "RUA", end: "REPUBLICA TCHECA", num: "165", bairro: "Letícia", reg: "VENDA NOVA" },
  { cod: "9255", nome: "DIRETORIA REGIONAL DE SAUDE VENDA NOVA", tipo: "AVE", end: "VILARINHO", num: "1300", bairro: "Parque São Pedro", reg: "VENDA NOVA" }
];

// Generate Proprios with Mock Coords
export const MOCK_PROPRIOS: Proprio[] = RAW_DATA.map(data => {
  const center = REGIONAL_CENTERS[data.reg] || { lat: -19.9167, lng: -43.9345 };
  // Spread increased slightly to cover more neighborhood area
  const coord = generateCoord(center.lat, center.lng, 0.04);
  return {
    cod: data.cod,
    nome_equipamento: data.nome,
    tipo_logradouro: data.tipo,
    nome_logradouro: data.end,
    numero_imovel: data.num,
    bairro: data.bairro,
    regional: data.reg,
    lat: coord.lat,
    lng: coord.lng
  };
});

// Function to generate a logical simulation route based on the selected regional
// It finds points in that regional and connects them
export const getSimulationRoute = (regional: string): RoutePoint[] => {
  // Filter proprios for the region, or fallback to everything if invalid
  let targets = MOCK_PROPRIOS.filter(p => p.regional === regional);
  
  // If regional has few points (or none in mock), use random ones from whole list
  if (targets.length < 2) {
    targets = MOCK_PROPRIOS.slice(0, 5); 
  } else {
    // Shuffle and pick a robust subset (8-12 points) to make the simulation last longer
    // and visit more places
    targets = targets.sort(() => 0.5 - Math.random()).slice(0, 10);
  }

  // Sort targets by proximity to create a "salesman" path (greedy nearest neighbor)
  const path: Proprio[] = [targets[0]];
  const remaining = targets.slice(1);

  while (remaining.length > 0) {
    const last = path[path.length - 1];
    let nearestIdx = 0;
    let minDist = Number.MAX_VALUE;

    remaining.forEach((p, idx) => {
      const d = Math.sqrt(Math.pow(p.lat - last.lat, 2) + Math.pow(p.lng - last.lng, 2));
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });

    path.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  // Convert to RoutePoints 
  return path.map(p => ({
    lat: p.lat,
    lng: p.lng,
    timestamp: 0
  }));
};

export const REGIONALS = [
  "BARREIRO",
  "CENTRO-SUL",
  "LESTE",
  "NORDESTE",
  "NOROESTE",
  "NORTE",
  "OESTE",
  "PAMPULHA",
  "VENDA NOVA"
];

export const VISITING_RADIUS_METERS = 100; 
// Debounce reduced to 0.1 minute (6 seconds) to allow fast re-visits during simulation
export const DEBOUNCE_MINUTES = 0.1;
