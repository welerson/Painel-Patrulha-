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
// Updated with full list for Barreiro, Centro-Sul, and Oeste
const RAW_DATA = [
  // ==================== BARREIRO (LISTA COMPLETA) ====================
  { cod: "1001", nome: "ESCOLA MUNICIPAL AIRES DA MATA MACHADO", tipo: "AVE", end: "SENADOR LEVINDO COELHO", num: "632", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1002", nome: "ESCOLA MUNICIPAL ANA ALVES TEIXEIRA", tipo: "RUA", end: "BARAO DO MONTE ALTO", num: "300", bairro: "Cardoso", reg: "BARREIRO" },
  { cod: "1003", nome: "ESCOLA MUNICIPAL ANTONIO ALEIXO", tipo: "AVE", end: "OLINTO MEIRELES", num: "250", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1004", nome: "ESCOLA MUNICIPAL ANTONIO MOURAO GUIMARAES", tipo: "RUA", end: "INTERSINDICAL", num: "270", bairro: "Flávio de Oliveira", reg: "BARREIRO" },
  { cod: "1005", nome: "ESCOLA MUNICIPAL ANTONIO SALLES BARBOSA", tipo: "RUA", end: "SABINO JOSE FERREIRA", num: "5", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1006", nome: "ESCOLA MUNICIPAL AURELIO BUARQUE DE HOLANDA", tipo: "RUA", end: "FORTUNATO BRUNO DINIZ", num: "40", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1007", nome: "ESCOLA MUNICIPAL CIAC LUCAS MONTEIRO MACHADO", tipo: "RUA", end: "OTAVIANO DE CARVALHO", num: "12", bairro: "Vila Pinho", reg: "BARREIRO" },
  { cod: "1008", nome: "ESCOLA MUNICIPAL CONEGO SEQUEIRA", tipo: "RUA", end: "FLOR CHUVA DE PRATA", num: "40", bairro: "Mineirão", reg: "BARREIRO" },
  { cod: "1009", nome: "ESCOLA MUNICIPAL DINORAH MAGALHAES FABRI", tipo: "RUA", end: "PAVAO", num: "295", bairro: "Esperança", reg: "BARREIRO" },
  { cod: "1010", nome: "ESCOLA MUNICIPAL DULCE MARIA HOMEM", tipo: "RUA", end: "TRES MARIAS", num: "221", bairro: "Miramar", reg: "BARREIRO" },
  { cod: "1011", nome: "ESCOLA MUNICIPAL EDITH PIMENTA DA VEIGA", tipo: "ALA", end: "VARGEM GRANDE", num: "38", bairro: "Castanheira", reg: "BARREIRO" },
  { cod: "1012", nome: "ESCOLA MUNICIPAL ELOY HERALDO LIMA", tipo: "RUA", end: "ENGRACIA COSTA E SILVA", num: "56", bairro: "Vale do Jatobá", reg: "BARREIRO" },
  { cod: "1013", nome: "ESCOLA MUNICIPAL HELENA ANTIPOFF", tipo: "RUA", end: "ANTONIO EUSTAQUIO PIAZZA", num: "4020", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1014", nome: "ESCOLA MUNICIPAL JONAS BARCELLOS CORREA", tipo: "RUA", end: "PROFESSORA DIRCE MARIA", num: "240", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1015", nome: "ESCOLA MUNICIPAL LUIZ GATTI", tipo: "RUA", end: "O GARIMPEIRO", num: "45", bairro: "Ademar Maldonado", reg: "BARREIRO" },
  { cod: "1016", nome: "ESCOLA MUNICIPAL LUIZ GONZAGA JUNIOR", tipo: "RUA", end: "MARIA PEREIRA DAMASCENO", num: "65", bairro: "Ernesto do Nascimento", reg: "BARREIRO" },
  { cod: "1017", nome: "ESCOLA MUNICIPAL PADRE FLAVIO GIAMMETTA", tipo: "RUA", end: "SEBASTIAO MARIA DA SILVA", num: "175", bairro: "Átila de Paiva", reg: "BARREIRO" },
  { cod: "1018", nome: "ESCOLA MUNICIPAL PEDRO ALEIXO", tipo: "AVE", end: "MENELICK DE CARVALHO", num: "255", bairro: "Araguaia", reg: "BARREIRO" },
  { cod: "1019", nome: "ESCOLA MUNICIPAL PEDRO NAVA", tipo: "RUA", end: "SAO PEDRO DA ALDEIA", num: "445", bairro: "Serra do Curral", reg: "BARREIRO" },
  { cod: "1020", nome: "ESCOLA MUNICIPAL PROFESSOR HILTON ROCHA", tipo: "RUA", end: "VICENTE SURETTE", num: "215", bairro: "Mangueiras", reg: "BARREIRO" },
  { cod: "1021", nome: "EMEI PROFESSOR JOSÉ BRAZ", tipo: "RUA", end: "JOSE ZUQUIM", num: "210", bairro: "Santa Margarida", reg: "BARREIRO" },
  { cod: "1022", nome: "ESCOLA MUNICIPAL PROFESSOR MELLO CANCADO", tipo: "RUA", end: "DAS PETUNIAS", num: "2058", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1023", nome: "ESCOLA MUNICIPAL PROFESSORA ISAURA SANTOS", tipo: "RUA", end: "HOFFMAN", num: "80", bairro: "Santa Helena", reg: "BARREIRO" },
  { cod: "1024", nome: "ESCOLA MUNICIPAL SEBASTIAO GUILHERME DE OLIVEIRA", tipo: "RUA", end: "CALENDULA", num: "10", bairro: "Olaria", reg: "BARREIRO" },
  { cod: "1025", nome: "ESCOLA MUNICIPAL UNIAO COMUNITARIA", tipo: "RUA", end: "PROFESSOR LUIZ BICALHO", num: "505", bairro: "Brasil Industrial", reg: "BARREIRO" },
  { cod: "1026", nome: "ESCOLA MUNICIPAL DA VILA PINHO", tipo: "RUA", end: "COLETORA", num: "956", bairro: "Vila Pinho", reg: "BARREIRO" },
  { cod: "1027", nome: "ESCOLA MUNICIPAL VINICIUS DE MORAES", tipo: "RUA", end: "SEBASTIAO MOREIRA", num: "409", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1028", nome: "ESCOLA MUNICIPAL PRESIDENTE ITAMAR FRANCO", tipo: "AVE", end: "PERIMETRAL", num: "2911", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1029", nome: "ESCOLA MUNICIPAL SOLAR RUBI", tipo: "AVE", end: "WARLEY APARECIDO MARTINS", num: "854", bairro: "Solar do Barreiro", reg: "BARREIRO" },
  { cod: "1030", nome: "ESCOLA MUNICIPAL POLO DE EDUCAÇÃO INTEGRADA", tipo: "PCA", end: "MODESTINO SALES BARBOSA", num: "50", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1100", nome: "CENTRO DE SAUDE BAIRRO DAS INDUSTRIAS", tipo: "RUA", end: "MARIA DE LOURDES MANSO", num: "80", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1101", nome: "CENTRO DE SAUDE BARREIRO - CARLOS RENATO DIAS", tipo: "RUA", end: "JOSE GONCALVES", num: "375", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1103", nome: "CENTRO DE SAUDE BARREIRO DE CIMA", tipo: "PCA", end: "MODESTINO SALES BARBOSA", num: "100", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1104", nome: "CENTRO DE SAUDE BONSUCESSO", tipo: "RUA", end: "DOUTOR CRISTIANO REZENDE", num: "1875", bairro: "Bonsucesso", reg: "BARREIRO" },
  { cod: "1105", nome: "CENTRO DE SAUDE DIAMANTE", tipo: "RUA", end: "MARIA MARCOLINA SOUZA", num: "40", bairro: "Diamante", reg: "BARREIRO" },
  { cod: "1106", nome: "CENTRO DE SAUDE INDEPENDENCIA", tipo: "RUA", end: "MARIA ANTONIETA FERREIRA", num: "151", bairro: "Independência", reg: "BARREIRO" },
  { cod: "1107", nome: "CENTRO DE SAUDE ITAIPU - JATOBA", tipo: "RUA", end: "WANDERLEY DE SALES BARBOSA", num: "350", bairro: "Marilândia", reg: "BARREIRO" },
  { cod: "1108", nome: "CENTRO DE SAUDE LINDEIA", tipo: "RUA", end: "FLOR DE MAIO", num: "172", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1109", nome: "CENTRO DE SAUDE MANGUEIRAS", tipo: "RUA", end: "CHAFARIZ", num: "4", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1110", nome: "CENTRO DE SAUDE MILIONARIOS", tipo: "RUA", end: "DOS CRUZEIRENSES", num: "30", bairro: "Milionários", reg: "BARREIRO" },
  { cod: "1111", nome: "CENTRO DE SAUDE MIRAMAR", tipo: "RUA", end: "ERIDANO", num: "540", bairro: "Miramar", reg: "BARREIRO" },
  { cod: "1112", nome: "CENTRO DE SAUDE PILAR", tipo: "RUA", end: "SAO PEDRO DA ALDEIA", num: "55", bairro: "Serra do Curral", reg: "BARREIRO" },
  { cod: "1113", nome: "CENTRO DE SAUDE SANTA CECILIA", tipo: "RUA", end: "PAULO DUARTE", num: "280", bairro: "Santa Cecília", reg: "BARREIRO" },
  { cod: "1114", nome: "CENTRO DE SAUDE TIROL", tipo: "AVE", end: "NELIO CERQUEIRA", num: "15", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1115", nome: "CENTRO DE SAUDE LISANDRA ANGELICA DAVID JUSTINO", tipo: "RUA", end: "WALDIR CESAR BRANQUINHO", num: "121", bairro: "Túnel de Ibirité", reg: "BARREIRO" },
  { cod: "1116", nome: "CENTRO DE SAUDE URUCUIA", tipo: "RUA", end: "NELSON DE PAULA PIRES", num: "411", bairro: "Pongelupe", reg: "BARREIRO" },
  { cod: "1117", nome: "CENTRO DE SAUDE VALE DO JATOBA", tipo: "RUA", end: "LUIZ LEITE DE FARIA", num: "171", bairro: "Vale do Jatobá", reg: "BARREIRO" },
  { cod: "1118", nome: "CENTRO DE SAUDE VILA CEMIG", tipo: "RUA", end: "COLETIVO", num: "68", bairro: "Vila CEMIG", reg: "BARREIRO" },
  { cod: "1119", nome: "CENTRO DE SAUDE VILA PINHO", tipo: "RUA", end: "OTAVIANO DE CARVALHO", num: "174", bairro: "Vila Pinho", reg: "BARREIRO" },
  { cod: "1120", nome: "CENTRO DE SAUDE REGINA", tipo: "RUA", end: "ARISTOLINO BASILIO DE OLIVEIRA", num: "467", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1228", nome: "PARQUE ECOLOGICO VIDA E ESPERANCA DO TIROL", tipo: "AVE", end: "EXPEDITO DE FARIA TAVARES", num: "353", bairro: "Tirol", reg: "BARREIRO" },
  { cod: "1229", nome: "PARQUE ECOLOGICO PADRE ALFREDO SABETTA", tipo: "RUA", end: "ANTONIO TEIXEIRA DIAS", num: "1001", bairro: "Teixeira Dias", reg: "BARREIRO" },
  { cod: "1230", nome: "PARQUE CARLOS DE FARIA TAVARES", tipo: "AVE", end: "PERIMETRAL", num: "800", bairro: "Distrito Industrial", reg: "BARREIRO" },
  { cod: "1231", nome: "PARQUE ECOLOGICO ROBERTO BURLE MARX", tipo: "AVE", end: "XIMANGO", num: "900", bairro: "Serra do Curral", reg: "BARREIRO" },
  { cod: "1233", nome: "ESTACAO INTEGRACAO BHBUS BARREIRO", tipo: "AVE", end: "AFONSO VAZ DE MELO", num: "640", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1234", nome: "ESTACAO INTEGRACAO BHBUS DIAMANTE", tipo: "AVE", end: "JOAO ROLLA FILHO", num: "50", bairro: "Diamante", reg: "BARREIRO" },
  { cod: "1438", nome: "CENTRO ESPORTIVO VALE DO JATOBA - CESVJ", tipo: "AVE", end: "SENADOR LEVINDO COELHO", num: "2166", bairro: "Vale do Jatobá", reg: "BARREIRO" },
  { cod: "1439", nome: "GINASIO POLIESPORTIVO LINDEIA", tipo: "RUA", end: "DAS PETUNIAS", num: "547", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1440", nome: "CENTRAL DE ESTERILIZACAO BARREIRO", tipo: "RUA", end: "AZARIAS DUARTE", num: "150", bairro: "Diamante", reg: "BARREIRO" },
  { cod: "1442", nome: "CENTRO CULTURAL LINDEIA REGINA", tipo: "RUA", end: "ARISTOLINO BASILIO DE OLIVEIRA", num: "445", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1443", nome: "CENTRO CULTURAL URUCUIA", tipo: "RUA", end: "W TRES", num: "500", bairro: "Pongelupe", reg: "BARREIRO" },
  { cod: "1444", nome: "CENTRO CULTURAL VILA SANTA RITA", tipo: "RUA", end: "ANA RAFAEL DOS SANTOS", num: "149", bairro: "Santa Rita", reg: "BARREIRO" },
  { cod: "1447", nome: "BIBLIOTECA DO CENTRO CULTURAL BAIRRO DAS INDUSTRIAS", tipo: "RUA", end: "DOS INDUSTRIARIOS", num: "265", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1450", nome: "CONSELHO TUTELAR BARREIRO", tipo: "RUA", end: "LUCIO DOS SANTOS", num: "425", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1460", nome: "COORDENADORIA DE PROTECAO E DEFESA DO CONSUMIDOR BARREIRO", tipo: "RUA", end: "DAVID FONSECA", num: "1147", bairro: "Milionários", reg: "BARREIRO" },
  { cod: "1470", nome: "CRAS INDEPENDENCIA", tipo: "RUA", end: "AGUA DA VIDA", num: "14", bairro: "Independência", reg: "BARREIRO" },
  { cod: "1471", nome: "CRAS PETROPOLIS", tipo: "RUA", end: "FREDERICO BOY PRUSSIANO", num: "137", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1472", nome: "CRAS VILA CEMIG", tipo: "RUA", end: "FAISAO", num: "1071", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1484", nome: "DIRETORIA REGIONAL DE EDUCACAO BARREIRO", tipo: "AVE", end: "OLINTO MEIRELES", num: "327", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1485", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA BARREIRO", tipo: "RUA", end: "VICENTE DE AZEVEDO", num: "301", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1486", nome: "GERENCIA REGIONAL DE MANUTENCAO BARREIRO", tipo: "RUA", end: "DAVID FONSECA", num: "1147", bairro: "Milionários", reg: "BARREIRO" },
  { cod: "1490", nome: "VELORIO MUNICIPAL VICENTE RODRIGUES DE PAULA", tipo: "RUA", end: "VICENTE DE AZEVEDO", num: "393", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1492", nome: "GERENCIA DE ZOONOSES BARREIRO", tipo: "AVE", end: "OLINTO MEIRELES", num: "327", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1493", nome: "GERENCIA DE ASSISTENCIA EPIDEMIOLOGIA E REGULACAO BARREIRO", tipo: "AVE", end: "OLINTO MEIRELES", num: "327", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1494", nome: "GERENCIA DE VIGILANCIA SANITARIA BARREIRO", tipo: "AVE", end: "OLINTO MEIRELES", num: "327", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1495", nome: "GERENCIA DO SINE BARREIRO", tipo: "RUA", end: "BARAO DE COROMANDEL", num: "982", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1497", nome: "GERENCIA DISTRITAL DE GESTAO DO TRABALHO", tipo: "AVE", end: "OLINTO MEIRELES", num: "327", bairro: "Bairro das Indústrias", reg: "BARREIRO" },
  { cod: "1540", nome: "URPV ATILA DE PAIVA", tipo: "AVE", end: "DO CANAL", num: "68", bairro: "Átila de Paiva", reg: "BARREIRO" },
  { cod: "1541", nome: "URPV MILIONARIOS", tipo: "RUA", end: "DONA LUIZA", num: "865", bairro: "Milionários", reg: "BARREIRO" },
  { cod: "1542", nome: "URPV JATOBA", tipo: "AVE", end: "AGENOR NONATO DE SOUZA", num: "710", bairro: "Vale do Jatobá", reg: "BARREIRO" },
  { cod: "1543", nome: "URPV TUNEL DE IBIRITE", tipo: "RUA", end: "MARLY PASSOS", num: "10", bairro: "Túnel de Ibirité", reg: "BARREIRO" },
  { cod: "1544", nome: "URPV LINDEIA", tipo: "RUA", end: "ANTONIO DE SOUZA GOMES", num: "110", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1545", nome: "URPV FLAVIO DE OLIVEIRA", tipo: "RUA", end: "ITAPETININGA", num: "2040", bairro: "Flávio Marques Lisboa", reg: "BARREIRO" },
  { cod: "1550", nome: "ACADEMIA DA CIDADE MILIONARIOS", tipo: "RUA", end: "DAVID FONSECA", num: "1386", bairro: "Milionários", reg: "BARREIRO" },
  { cod: "1551", nome: "ACADEMIA DA CIDADE VILA PINHO", tipo: "AVE", end: "PERIMETRAL", num: "800", bairro: "Distrito Industrial", reg: "BARREIRO" },
  { cod: "1552", nome: "ACADEMIA DA CIDADE PARQUE DAS AGUAS", tipo: "AVE", end: "XIMANGO", num: "809", bairro: "Serra do Curral", reg: "BARREIRO" },
  { cod: "1553", nome: "ACADEMIA DA CIDADE VALE DO JATOBA", tipo: "AVE", end: "SENADOR LEVINDO COELHO", num: "2280", bairro: "Vale do Jatobá", reg: "BARREIRO" },
  { cod: "1554", nome: "ACADEMIA DA CIDADE URUCUIA", tipo: "RUA", end: "ULISSES SURETTE", num: "386", bairro: "Novo Santa Cecília", reg: "BARREIRO" },
  { cod: "1555", nome: "ACADEMIA DA CIDADE LINDEIA", tipo: "RUA", end: "DAS PETUNIAS", num: "547", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1556", nome: "ACADEMIA DA CIDADE JATOBA IV", tipo: "AVE", end: "HAYDEE ABRAS HOMSSI", num: "560", bairro: "CDI Jatobá", reg: "BARREIRO" },
  { cod: "1559", nome: "ACADEMIA DA CIDADE DIAMANTE", tipo: "RUA", end: "MARIA MARCOLINA SOUZA", num: "40", bairro: "Teixeira Dias", reg: "BARREIRO" },
  { cod: "1600", nome: "CENTRO DE APOIO A ESCOLA INTEGRADA (EM ELOY HERALDO)", tipo: "AVE", end: "HAYDEE ABRAS HOMSSI", num: "560", bairro: "CDI Jatobá", reg: "BARREIRO" },
  { cod: "1601", nome: "CURUMIM PARQUE DAS AGUAS", tipo: "RUA", end: "JOSE DO MONTE", num: "147", bairro: "Serra do Curral", reg: "BARREIRO" },
  { cod: "1602", nome: "CASA DE APOIO A ZOONOSES E LEISHMANIOSE", tipo: "RUA", end: "VICENTE DE AZEVEDO", num: "301", bairro: "Barreiro", reg: "BARREIRO" },
  { cod: "1603", nome: "CRAS PETROPOLIS", tipo: "RUA", end: "FREDERICO BOY PRUSSIANO", num: "137", bairro: "Petrópolis", reg: "BARREIRO" },
  { cod: "1605", nome: "CENTRO DE ESTERILIZACAO DE CAES E GATOS", tipo: "RUA", end: "ANTONIO PRACA PIEDADE", num: "105", bairro: "Bonsucesso", reg: "BARREIRO" },
  { cod: "1606", nome: "PRACA DONA ZULMIRA", tipo: "RUA", end: "WILMA DE ANDRADE", num: "301", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1607", nome: "PRACA DOUTORA CRISTIANI MOREIRA", tipo: "RUA", end: "CORONEL DURVAL DE BARROS", num: "20", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1609", nome: "PRACA MINERVA", tipo: "RUA", end: "SERRADOR", num: "89", bairro: "Jatobá", reg: "BARREIRO" },
  { cod: "1610", nome: "PRACA DALIA", tipo: "PCA", end: "DALIA", num: "103", bairro: "Lindéia", reg: "BARREIRO" },
  { cod: "1611", nome: "PRACA MANACA", tipo: "PCA", end: "MANACA", num: "22", bairro: "Lindéia", reg: "BARREIRO" },

  // ==================== CENTRO-SUL (LISTA COMPLETA) ====================
  { cod: "2513", nome: "GERENCIA DOS CANAIS ELETRONICOS DE ATENDIMENTO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2514", nome: "DIRETORIA CENTRAL DE COMPRAS", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2518", nome: "GERENCIA DE ATOS", tipo: "AVE", end: "AFONSO PENA", num: "1212", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2519", nome: "DIRETORIA DE LICENCIAMENTO E CONTROLE DE EDIFICACOES", tipo: "AVE", end: "ALVARES CABRAL", num: "217", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2520", nome: "DIRETORIA REGIONAL DE ASSISTENCIA SOCIAL CENTRO SUL", tipo: "AVE", end: "AFONSO PENA", num: "941", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2521", nome: "DIRETORIA CENTRAL DE PROJETOS ESTRATEGICOS", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2522", nome: "GERENCIA DE ARRECADACAO E CREDITO", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2523", nome: "GERENCIA DE COORDENACAO DE LICITACOES", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2524", nome: "DIRETORIA DE DESENVOLVIMENTO ORGANIZACIONAL", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2527", nome: "GERENCIA DE COBRANCA E INSCRICAO DA DIVIDA ATIVA", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2529", nome: "DIRETORIA DE POLITICAS PARA AS PESSOAS COM DEFICIENCIA", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2531", nome: "ASSESSORIA JURIDICA", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2534", nome: "DIRETORIA DE NECROPOLES", tipo: "RUA", end: "DOS TIMBIRAS", num: "628", bairro: "Funcionários", reg: "CENTRO-SUL" },
  { cod: "2535", nome: "GERENCIA PARQUE MUNICIPAL AMERICO RENNE GIANNETTI", tipo: "AVE", end: "AFONSO PENA", num: "1377", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2536", nome: "DIRETORIA CENTRAL DE PATRIMONIO", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2537", nome: "DIRETORIA DE POLITICAS PARA A PESSOA IDOSA", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2538", nome: "GERENCIA DE LICENCIAMENTO E CONTROLE AMBIENTAL", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2541", nome: "DIRETORIA DE PROTECAO BASICA DO SUAS", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2548", nome: "SUBSECRETARIA DE GESTAO DE PESSOAS", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2558", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA CENTRO SUL", tipo: "AVE", end: "DOS ANDRADAS", num: "1345", bairro: "Santa Efigênia", reg: "CENTRO-SUL" },
  { cod: "2560", nome: "GERENCIA REGIONAL DE MANUTENCAO CENTRO SUL", tipo: "AVE", end: "DOS ANDRADAS", num: "1345", bairro: "Santa Efigênia", reg: "CENTRO-SUL" },
  { cod: "2570", nome: "DIRETORIA REGIONAL DE EDUCACAO CENTRO SUL", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2571", nome: "GERENCIA DE GESTAO DOS SERVICOS DE ALTA COMPLEXIDADE DO SUAS", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2572", nome: "GERENCIA DA CENTRAL DE CAPTACAO DE VAGAS", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2575", nome: "DIRETORIA DE PLANEJAMENTO ORCAMENTO E FINANCAS", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2576", nome: "SUBSECRETARIA DE TRABALHO E EMPREGO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2577", nome: "GERENCIA DE GESTAO DO DESEMPENHO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2578", nome: "DIRETORIA DE LANCAMENTOS E DESONERACOES TRIBUTARIAS", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2579", nome: "DIRETORIA DE TECNOLOGIA DA INFORMACAO E APOIO TECNICO", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2580", nome: "DIRETORIA DE PLANEJAMENTO GESTAO E FINANCAS", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2581", nome: "DIRETORIA DE PLANEJAMENTO GESTAO E FINANCAS (AFONSO PENA)", tipo: "AVE", end: "AFONSO PENA", num: "1212", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2582", nome: "GERENCIA DE CADASTRO TRIBUTARIO", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2583", nome: "DIRETORIA REGIONAL DE SAUDE CENTRO SUL", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2584", nome: "GERENCIA DE ZOONOSES CENTRO SUL", tipo: "RUA", end: "PERNAMBUCO", num: "237", bairro: "Funcionários", reg: "CENTRO-SUL" },
  { cod: "2585", nome: "GERENCIA REGIONAL DE FISCALIZACAO CENTRO SUL", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2586", nome: "DIRETORIA CENTRAL DE GESTAO DE SERVICOS GERAIS", tipo: "RUA", end: "DOS TUPIS", num: "149", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2587", nome: "GERENCIA PARQUE MUNICIPAL DAS MANGABEIRAS", tipo: "RUA", end: "CARACA", num: "840", bairro: "Mangabeiras", reg: "CENTRO-SUL" },
  { cod: "2588", nome: "PROCURADORIA GERAL DO MUNICIPIO", tipo: "AVE", end: "AFONSO PENA", num: "1212", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2590", nome: "CONSELHO ADMINISTRATIVO DE RECURSOS TRIBUTARIOS DO MUNICIPIO", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2591", nome: "SUBCONTROLADORIA DE AUDITORIA", tipo: "AVE", end: "ALVARES CABRAL", num: "200", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2600", nome: "SECRETARIA MUNICIPAL DE SEGURANCA E PREVENCAO", tipo: "RUA", end: "DOS CARIJOS", num: "126", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2601", nome: "SUBSECRETARIA DE PLANEJAMENTO GESTAO E FINANCAS", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2602", nome: "GUARDA CIVIL MUNICIPAL DE BELO HORIZONTE", tipo: "AVE", end: "DOS ANDRADAS", num: "915", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2603", nome: "SUBSECRETARIA DE ESPORTES E LAZER", tipo: "RUA", end: "DOS TIMBIRAS", num: "628", bairro: "Funcionários", reg: "CENTRO-SUL" },
  { cod: "2604", nome: "SECRETARIA MUNICIPAL DE OBRAS E INFRAESTRUTURA", tipo: "RUA", end: "DOS GUAJAJARAS", num: "1107", bairro: "Lourdes", reg: "CENTRO-SUL" },
  { cod: "2605", nome: "URBEL", tipo: "AVE", end: "DO CONTORNO", num: "6664", bairro: "Savassi", reg: "CENTRO-SUL" },
  { cod: "2606", nome: "SECRETARIA MUNICIPAL DE MEIO AMBIENTE", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2608", nome: "SUBSECRETARIA DE REGULACAO URBANA", tipo: "AVE", end: "ALVARES CABRAL", num: "217", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2609", nome: "SECRETARIA MUNICIPAL DE SAUDE", tipo: "AVE", end: "AFONSO PENA", num: "2336", bairro: "Savassi", reg: "CENTRO-SUL" },
  { cod: "2610", nome: "SUBSECRETARIA MUNICIPAL DE DIREITOS DE CIDADANIA", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2611", nome: "SUBSECRETARIA DE GESTAO DE PESSOAS", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2612", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL CENTRO SUL", tipo: "RUA", end: "DOS TUPIS", num: "149", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2613", nome: "SECRETARIA MUNICIPAL DE ASSISTENCIA SOCIAL", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2614", nome: "SECRETARIA MUNICIPAL DE POLITICA URBANA", tipo: "AVE", end: "ALVARES CABRAL", num: "217", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2615", nome: "SECRETARIA MUNICIPAL DE EDUCACAO", tipo: "RUA", end: "CARANGOLA", num: "288", bairro: "Santo Antônio", reg: "CENTRO-SUL" },
  { cod: "2616", nome: "SECRETARIA MUNICIPAL DE FAZENDA", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2617", nome: "DIRETORIA DE ARRECADACAO COBRANCA E DIVIDA ATIVA", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2618", nome: "SUBSECRETARIA DO TESOURO MUNICIPAL", tipo: "RUA", end: "ESPIRITO SANTO", num: "605", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2619", nome: "SUBSECRETARIA DE SEGURANCA ALIMENTAR E NUTRICIONAL", tipo: "AVE", end: "AFONSO PENA", num: "342", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2620", nome: "SECRETARIA MUNICIPAL DE PLANEJAMENTO ORCAMENTO E GESTAO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2621", nome: "CORREGEDORIA DA GUARDA CIVIL MUNICIPAL", tipo: "RUA", end: "DOS CARIJOS", num: "126", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2622", nome: "CONTROLADORIA GERAL DO MUNICIPIO", tipo: "AVE", end: "ALVARES CABRAL", num: "200", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2623", nome: "SECRETARIA MUNICIPAL DE ESPORTE E LAZER", tipo: "RUA", end: "DOS TIMBIRAS", num: "628", bairro: "Funcionários", reg: "CENTRO-SUL" },
  { cod: "2625", nome: "SUBSECRETARIA DE GESTAO PREVIDENCIARIA E DA SAUDE DO SEGURADO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2626", nome: "SUBSECRETARIA DE PLANEJAMENTO E ORCAMENTO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2627", nome: "SUBSECRETARIA DE MODERNIZACAO DA GESTAO", tipo: "AVE", end: "AUGUSTO DE LIMA", num: "30", bairro: "Centro", reg: "CENTRO-SUL" },
  { cod: "2628", nome: "SUDECAP", tipo: "RUA", end: "DOS GUAJAJARAS", num: "1107", bairro: "Lourdes", reg: "CENTRO-SUL" },

  // ==================== OESTE (LISTA COMPLETA) ====================
  { cod: "7067", nome: "EMEI CINQUENTENARIO", tipo: "AVE", end: "DOM JOAO VI", num: "691", bairro: "Cinquentenário", reg: "OESTE" },
  { cod: "7068", nome: "EMEI CAMARGOS", tipo: "RUA", end: "GENTIL PORTUGAL DO BRASIL", num: "61", bairro: "Camargos", reg: "OESTE" },
  { cod: "7069", nome: "EMEI VILA CALAFATE", tipo: "RUA", end: "CONTENDAS", num: "254", bairro: "Alto Barroca", reg: "OESTE" },
  { cod: "7100", nome: "CENTRO DE SAUDE AMILCAR VIANA MARTINS", tipo: "RUA", end: "NELSON DE SENNA", num: "90", bairro: "Cinquentenário", reg: "OESTE" },
  { cod: "7101", nome: "CENTRO DE SAUDE BETANIA", tipo: "RUA", end: "DAS CANOAS", num: "678", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7102", nome: "CENTRO DE SAUDE CABANA", tipo: "RUA", end: "CENTRO SOCIAL", num: "536", bairro: "Nova Gameleira", reg: "OESTE" },
  { cod: "7103", nome: "CENTRO DE SAUDE CICERO IDELFONSO", tipo: "RUA", end: "AGUANIL", num: "238", bairro: "Vista Alegre", reg: "OESTE" },
  { cod: "7104", nome: "CENTRO DE SAUDE CONJUNTO BETANIA", tipo: "RUA", end: "ONA", num: "105", bairro: "Betânia", reg: "OESTE" },
  { cod: "7105", nome: "CENTRO DE SAUDE HAVAI", tipo: "RUA", end: "PAULO DINIZ CARNEIRO", num: "742", bairro: "Havaí", reg: "OESTE" },
  { cod: "7106", nome: "CENTRO DE SAUDE NORALDINO DE LIMA", tipo: "AVE", end: "AMAZONAS", num: "4373", bairro: "Nova Suíça", reg: "OESTE" },
  { cod: "7107", nome: "CENTRO DE SAUDE SALGADO FILHO", tipo: "RUA", end: "CAMPINA VERDE", num: "375", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7108", nome: "CENTRO DE SAUDE SAO JORGE", tipo: "RUA", end: "OSCAR TROMPOWSKY", num: "1698", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7109", nome: "CENTRO DE SAUDE WALDOMIRO LOBO", tipo: "AVE", end: "AMAZONAS", num: "8889", bairro: "Madre Gertrudes", reg: "OESTE" },
  { cod: "7110", nome: "CENTRO DE SAUDE VENTOSA", tipo: "RUA", end: "CONSELHEIRO JOAQUIM CAETANO", num: "1782", bairro: "Jardim América", reg: "OESTE" },
  { cod: "7111", nome: "CENTRO DE SAUDE VILA IMPERIAL", tipo: "RUA", end: "GUILHERME PINTO DA FONSECA", num: "350", bairro: "Madre Gertrudes", reg: "OESTE" },
  { cod: "7112", nome: "CENTRO DE SAUDE VILA LEONINA", tipo: "PCA", end: "DO ENSINO", num: "240", bairro: "Alpes", reg: "OESTE" },
  { cod: "7113", nome: "CENTRO DE SAUDE VISTA ALEGRE", tipo: "RUA", end: "SENECA", num: "9", bairro: "Nova Cintra", reg: "OESTE" },
  { cod: "7114", nome: "CENTRO DE SAUDE PALMEIRAS", tipo: "AVE", end: "DOM JOAO VI", num: "1821", bairro: "Palmeiras", reg: "OESTE" },
  { cod: "7115", nome: "CENTRO DE SAUDE JOAO XXIII", tipo: "RUA", end: "TOLEDO", num: "481", bairro: "Oeste", reg: "OESTE" },
  { cod: "7116", nome: "CENTRO DE SAUDE SANTA MARIA", tipo: "RUA", end: "DAS PEROLAS", num: "123", bairro: "Santa Maria", reg: "OESTE" },
  { cod: "7117", nome: "CENTRO DE SAUDE CAMARGOS", tipo: "RUA", end: "LUIZA EFIGENIA SILVA", num: "413", bairro: "Camargos", reg: "OESTE" },
  { cod: "7150", nome: "UNIDADE DE PRONTO ATENDIMENTO OESTE", tipo: "AVE", end: "BARAO HOMEM DE MELO", num: "1710", bairro: "Jardim América", reg: "OESTE" },
  { cod: "7151", nome: "UNIDADE DE REFERENCIA SECUNDARIA CAMPOS SALES", tipo: "RUA", end: "CAMPOS SALES", num: "472", bairro: "Calafate", reg: "OESTE" },
  { cod: "7201", nome: "FARMACIA DE MANIPULACAO", tipo: "RUA", end: "DO GARIMPO", num: "325", bairro: "Oeste", reg: "OESTE" },
  { cod: "7202", nome: "CENTRO CULTURAL SALGADO FILHO", tipo: "RUA", end: "NOVA PONTE", num: "22", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7204", nome: "CENTRAL DE ESTERILIZACAO OESTE", tipo: "RUA", end: "CAMPOS SALES", num: "472", bairro: "Calafate", reg: "OESTE" },
  { cod: "7207", nome: "CENTRO DE CONVIVENCIA OESTE", tipo: "RUA", end: "GENERAL ANDRADE NEVES", num: "25", bairro: "Gutierrez", reg: "OESTE" },
  { cod: "7210", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL OESTE", tipo: "RUA", end: "OSCAR TROMPOWSKY", num: "1325", bairro: "São Jorge II", reg: "OESTE" },
  { cod: "7211", nome: "CEVAE MORRO DAS PEDRAS", tipo: "RUA", end: "BELFORT ROXO", num: "215", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7213", nome: "ABRIGO REVIVER", tipo: "AVE", end: "AMAZONAS", num: "5801", bairro: "Gameleira", reg: "OESTE" },
  { cod: "7214", nome: "CONSELHO TUTELAR OESTE", tipo: "AVE", end: "BARAO HOMEM DE MELO", num: "382", bairro: "Nova Suíça", reg: "OESTE" },
  { cod: "7217", nome: "BHTRANS", tipo: "AVE", end: "ENGENHEIRO CARLOS GOULART", num: "900", bairro: "Buritis", reg: "OESTE" },
  { cod: "7218", nome: "CENTRO DE OPERACOES DA PBH", tipo: "AVE", end: "ENGENHEIRO CARLOS GOULART", num: "900", bairro: "Buritis", reg: "OESTE" },
  { cod: "7219", nome: "ESTACIONAMENTO", tipo: "RUA", end: "CACUI", num: "75", bairro: "Nova Suíça", reg: "OESTE" },
  { cod: "7220", nome: "FARMACIA DISTRITAL OESTE", tipo: "RUA", end: "CAMPOS SALES", num: "472", bairro: "Calafate", reg: "OESTE" },
  { cod: "7225", nome: "GERENCIA ARRECADACAO REGIONAL OESTE", tipo: "AVE", end: "BARAO HOMEM DE MELO", num: "282", bairro: "Nova Suíça", reg: "OESTE" },
  { cod: "7229", nome: "GERENCIA DE PARQUES BARREIRO E OESTE", tipo: "RUA", end: "AUGUSTO JOSE DOS SANTOS", num: "366", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7230", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7232", nome: "HOSPITAL PUBLICO VETERINARIO DE BELO HORIZONTE", tipo: "RUA", end: "PEDRO BIZZOTO", num: "79", bairro: "Madre Gertrudes", reg: "OESTE" },
  { cod: "7236", nome: "DIRETORIA REGIONAL DE EDUCACAO OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7247", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA OESTE", tipo: "RUA", end: "CONSELHEIRO PIRES DA MOTA", num: "151", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7248", nome: "GERENCIA REGIONAL DE MANUTENCAO OESTE", tipo: "RUA", end: "AUGUSTO JOSE DOS SANTOS", num: "36", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7261", nome: "CENTRO MUNICIPAL DE AGROECOLOGIA", tipo: "RUA", end: "NILO ANTONIO GAZIRE", num: "147", bairro: "Estoril", reg: "OESTE" },
  { cod: "7262", nome: "GERENCIA DE VIGILANCIA SANITARIA OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7264", nome: "GERENCIA DE ASSISTENCIA EPIDEMIOLOGIA E REGULACAO OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7267", nome: "DIRETORIA REGIONAL DE SAUDE OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7269", nome: "GERENCIA DE ZOONOSES OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7270", nome: "LABORATORIO DISTRITAL OESTE BARREIRO", tipo: "AVE", end: "AMAZONAS", num: "8889", bairro: "Madre Gertrudes", reg: "OESTE" },
  { cod: "7271", nome: "CRAS HAVAI VENTOSA", tipo: "AVE", end: "COSTA DO MARFIM", num: "480", bairro: "Havaí", reg: "OESTE" },
  { cod: "7272", nome: "CRAS MORRO DAS PEDRAS GRACA SABOIA", tipo: "AVE", end: "SILVA LOBO", num: "2379", bairro: "Grajaú", reg: "OESTE" },
  { cod: "7273", nome: "PARQUE AGGEO PIO SOBRINHO", tipo: "AVE", end: "PROFESSOR MARIO WERNECK", num: "2691", bairro: "Buritis", reg: "OESTE" },
  { cod: "7274", nome: "PARQUE HALLEY ALVES BESSA", tipo: "RUA", end: "AUSTRIA", num: "22", bairro: "Havaí", reg: "OESTE" },
  { cod: "7275", nome: "PARQUE JACQUES COUSTEAU", tipo: "RUA", end: "AUGUSTO JOSE DOS SANTOS", num: "366", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7276", nome: "PARQUE VILA PANTANAL", tipo: "RUA", end: "GERALDO VASCONCELLOS", num: "865", bairro: "Estoril", reg: "OESTE" },
  { cod: "7277", nome: "PARQUE CONJUNTO ESTRELA DALVA", tipo: "AVE", end: "COSTA DO MARFIM", num: "400", bairro: "Havaí", reg: "OESTE" },
  { cod: "7280", nome: "PARQUE BANDEIRANTE SILVA ORTIZ", tipo: "RUA", end: "JOSE CLAUDIO REZENDE", num: "328", bairro: "Estoril", reg: "OESTE" },
  { cod: "7281", nome: "PRACA SALGADO FILHO", tipo: "AVE", end: "TERESA CRISTINA", num: "5214", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7282", nome: "PRACA DA SAUDE", tipo: "AVE", end: "SILVA LOBO", num: "1571", bairro: "Grajaú", reg: "OESTE" },
  { cod: "7283", nome: "PRACA CARDEAL ARCO VERDE", tipo: "PCA", end: "CARDEAL ARCO VERDE", num: "44", bairro: "Nova Cintra", reg: "OESTE" },
  { cod: "7284", nome: "PRACA DO ENSINO", tipo: "PCA", end: "DO ENSINO", num: "230", bairro: "Alpes", reg: "OESTE" },
  { cod: "7285", nome: "GERENCIA REGIONAL DE ATENDIMENTO AO CIDADAO OESTE", tipo: "AVE", end: "SILVA LOBO", num: "1280", bairro: "Nova Granada", reg: "OESTE" },
  { cod: "7304", nome: "PARQUE ECOLOGICO NOVA GRANADA", tipo: "RUA", end: "INDUSTRIAL JOSE COSTA", num: "1100", bairro: "São Jorge III", reg: "OESTE" },
  { cod: "7305", nome: "PARQUE ECOLOGICO PEDRO MACHADO", tipo: "RUA", end: "CASTRO MENEZES", num: "110", bairro: "Santa Maria", reg: "OESTE" },
  { cod: "7307", nome: "GUARDA CIVIL MUNICIPAL SEDE REGIONAL OESTE", tipo: "RUA", end: "AUGUSTO JOSE DOS SANTOS", num: "36", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7308", nome: "GERENCIA DE LOGISTICA APOIO A REDE E ALMOXARIFADO", tipo: "RUA", end: "DO GARIMPO", num: "325", bairro: "Oeste", reg: "OESTE" },
  { cod: "7309", nome: "PRACA LEONARDO GUTIERREZ", tipo: "PCA", end: "LEONARDO GUTIERREZ", num: "100", bairro: "Gutierrez", reg: "OESTE" },
  { cod: "7310", nome: "PRACA CARLOS VILLANI", tipo: "RUA", end: "PEDRA BONITA", num: "343", bairro: "Prado", reg: "OESTE" },
  { cod: "7311", nome: "PRACA DA AMIZADE", tipo: "RUA", end: "MARIO JOSE FRANCISCO", num: "46", bairro: "Betânia", reg: "OESTE" },
  { cod: "7313", nome: "CRAS VISTA ALEGRE", tipo: "RUA", end: "AGUANIL", num: "425", bairro: "Vista Alegre", reg: "Oeste" },
  { cod: "7314", nome: "RUA CARLOS SCHETTINO", tipo: "RUA", end: "CENTRO SOCIAL", num: "535", bairro: "Jardinópolis", reg: "OESTE" },
  { cod: "7315", nome: "RUA SAO JOSE", tipo: "RUA", end: "CENTRAL", num: "33", bairro: "Vila Antena", reg: "OESTE" },
  { cod: "7316", nome: "CEFET", tipo: "RUA", end: "JOSE DE ALENCAR", num: "720", bairro: "Nova Suíça", reg: "OESTE" },
  { cod: "7317", nome: "CONJUNTO HENRICAO", tipo: "RUA", end: "VEREADOR JULIO FERREIRA", num: "111", bairro: "Nova Gameleira", reg: "OESTE" },
  { cod: "7318", nome: "AVENIDA PROTASIO DE OLIVEIRA PENNA", tipo: "AVE", end: "PROTASIO DE OLIVEIRA PENNA", num: "11", bairro: "Buritis", reg: "OESTE" },
  { cod: "7319", nome: "AVENIDA RAUL MOURAO GUIMARAES", tipo: "RUA", end: "DEPUTADO SEBASTIAO NASCIMENTO", num: "395", bairro: "Buritis", reg: "OESTE" },
  { cod: "7320", nome: "PRACA DA SAUDE", tipo: "AVE", end: "SILVA LOBO", num: "1575", bairro: "Grajaú", reg: "OESTE" },
  { cod: "7321", nome: "ASSOCIAÇÃO ATLETICA GRAJAU", tipo: "RUA", end: "POLONIA", num: "20", bairro: "São Jorge II", reg: "OESTE" },
  { cod: "7322", nome: "RUA INDEPENDENCIA", tipo: "RUA", end: "JOSE MARTINS SOBRINHO", num: "653", bairro: "Cabana do Pai Tomás", reg: "OESTE" },
  { cod: "7323", nome: "PRACA PADRE JOSE LUIZ", tipo: "RUA", end: "IBIRACI", num: "198", bairro: "Salgado Filho", reg: "OESTE" },
  { cod: "7324", nome: "PRACA PARQUE 2", tipo: "RUA", end: "ONZE DE SETEMBRO", num: "203", bairro: "Leonina", reg: "OESTE" },
  { cod: "7325", nome: "PARQUE 4", tipo: "BEC", end: "PIATA", num: "75", bairro: "Vila Antena", reg: "OESTE" },
  { cod: "7326", nome: "PARQUE AGGEO PIO SOBRINHO", tipo: "AVE", end: "PROFESSOR MARIO WERNECK", num: "2691", bairro: "Buritis", reg: "OESTE" },
  { cod: "7328", nome: "PARQUE ESTRELA DALVA", tipo: "AVE", end: "COSTA DO MARFIM", num: "400", bairro: "Havaí", reg: "OESTE" },
  { cod: "7329", nome: "PARQUE ECOLOGICO PEDRO MACHADO", tipo: "RUA", end: "GILKA MACHADO", num: "150", bairro: "Santa Maria", reg: "OESTE" },
  { cod: "7330", nome: "PARQUE HARLLEY ALVES BESSA", tipo: "PCA", end: "MARCIO DE ALMEIDA MENIN", num: "40", bairro: "Havaí", reg: "OESTE" },
  { cod: "7331", nome: "PARQUE JACQUES COUSTEAU", tipo: "RUA", end: "AUGUSTO JOSE DOS SANTOS", num: "366", bairro: "Estrela do Oriente", reg: "OESTE" },
  { cod: "7332", nome: "PARQUE DA VILA PANTANAL", tipo: "RUA", end: "GERALDO VASCONCELLOS", num: "1003", bairro: "Estoril", reg: "OESTE" },

  // ==================== DEMAIS REGIONAIS (DADOS ANTERIORES) ====================
  // LESTE
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

  // NORDESTE
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
  
  // NOROESTE
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

  // NORTE
  { cod: "6001", nome: "ESCOLA MUNICIPAL ACADEMICO VIVALDI MOREIRA", tipo: "RUA", end: "AGENOR DE PAULA ESTRELA", num: "393", bairro: "Jaqueline", reg: "NORTE" },
  { cod: "6004", nome: "ESCOLA MUNICIPAL FLORESTAN FERNANDES", tipo: "RUA", end: "PAU-FERRO", num: "360", bairro: "Solimões", reg: "NORTE" },
  { cod: "6065", nome: "EMEI JARDIM GUANABARA", tipo: "RUA", end: "JOAO ALVARES CABRAL", num: "77", bairro: "Jardim Guanabara", reg: "NORTE" },
  { cod: "6100", nome: "CENTRO DE SAUDE AARAO REIS", tipo: "RUA", end: "WALDOMIRO LOBO", num: "177", bairro: "Aarão Reis", reg: "NORTE" },
  { cod: "6103", nome: "CENTRO DE SAUDE FLORAMAR", tipo: "RUA", end: "IGARAUNAS", num: "15", bairro: "Floramar", reg: "NORTE" },
  { cod: "6118", nome: "CENTRO DE SAUDE JARDIM GUANABARA", tipo: "RUA", end: "FANNY MARTINS DE BARROS", num: "71", bairro: "Jardim Guanabara", reg: "NORTE" },
  { cod: "6150", nome: "UNIDADE DE PRONTO ATENDIMENTO NORTE", tipo: "AVE", end: "RISOLETA NEVES", num: "2580", bairro: "Guarani", reg: "NORTE" },
  { cod: "6205", nome: "CENTRO DE CONTROLE DE ZOONOSES", tipo: "RUA", end: "EDNA QUENTEL", num: "225", bairro: "São Bernardo", reg: "NORTE" },
  { cod: "6213", nome: "CENTRO CULTURAL JARDIM GUANABARA", tipo: "RUA", end: "JOAO ALVARES CABRAL", num: "277", bairro: "Jardim Guanabara", reg: "NORTE" },

  // PAMPULHA
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

  // VENDA NOVA
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