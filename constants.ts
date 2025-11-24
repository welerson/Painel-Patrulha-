
import { Proprio, RoutePoint } from './types';

// Version control to force update
export const DB_VERSION = "1.5-FULL-DATA-FIXED";

// Helper to generate random coordinates around a center point to simulate geocoding
const generateCoord = (centerLat: number, centerLng: number, spread: number = 0.025) => {
  return {
    lat: centerLat + (Math.random() - 0.5) * spread,
    lng: centerLng + (Math.random() - 0.5) * spread
  };
};

// Helper to determine priority based on name/type
const determinePriority = (nome: string): 'ALTA' | 'PADRAO' => {
  if (!nome) return 'PADRAO'; 
  const n = nome.toUpperCase();
  // Escolas, Saúde, UPA, CERSAM exigem visita diária (ALTA)
  if (
    n.includes('ESCOLA') || 
    n.includes('EMEI') || 
    n.includes('CENTRO DE SAUDE') || 
    n.includes('UPA') || 
    n.includes('HOSPITAL') ||
    n.includes('CERSAM')
  ) {
    return 'ALTA';
  }
  return 'PADRAO';
};

// Regional Centers in BH
export const REGIONAL_CENTERS: Record<string, { lat: number, lng: number }> = {
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

// Neighborhood Centers (Normalized keys to Uppercase for matching)
const NEIGHBORHOOD_CENTERS: Record<string, { lat: number, lng: number }> = {
  "MANTIQUEIRA": { lat: -19.795, lng: -43.985 },
  "CEU AZUL": { lat: -19.820, lng: -44.000 },
  "SERRA VERDE": { lat: -19.795, lng: -43.955 },
  "RIO BRANCO": { lat: -19.815, lng: -43.975 },
  "JARDIM LEBLON": { lat: -19.830, lng: -43.990 },
  "SAO JOAO BATISTA": { lat: -19.820, lng: -43.960 },
  "PIRATININGA": { lat: -19.810, lng: -43.990 },
  "LETICIA": { lat: -19.805, lng: -43.975 },
  "EUROPA": { lat: -19.800, lng: -43.965 },
  "LAGOA": { lat: -19.810, lng: -44.000 },
  "VENDA NOVA": { lat: -19.815, lng: -43.955 },
  "JAQUELINE": { lat: -19.820, lng: -43.935 },
  "JULIANA": { lat: -19.825, lng: -43.930 },
  "SAO BERNARDO": { lat: -19.835, lng: -43.940 },
  "TIROL": { lat: -19.990, lng: -44.035 },
  "CARDOSO": { lat: -19.999, lng: -44.006 },
  "LINDEIA": { lat: -19.980, lng: -44.050 },
  "MILIONARIOS": { lat: -19.980, lng: -44.000 },
  "DIAMANTE": { lat: -19.990, lng: -44.020 },
  "SANTA TEREZA": { lat: -19.915, lng: -43.915 },
  "CENTRO": { lat: -19.919, lng: -43.938 },
  "ESTORIL": { lat: -19.965, lng: -43.970 },
  "BURITIS": { lat: -19.970, lng: -43.965 },
  "SALGADO FILHO": { lat: -19.945, lng: -43.980 },
  "NOVA CINTRA": { lat: -19.950, lng: -43.990 },
  "BETANIA": { lat: -19.962, lng: -43.990 },
  "AARAO REIS": { lat: -19.845, lng: -43.920 },
  "HELIOPOLIS": { lat: -19.840, lng: -43.935 },
  "TUPI": { lat: -19.835, lng: -43.920 }
};

// DADOS COMPLETOS
const RAW_DATA: any[] = [
  // --- BARREIRO ---
  { cod: "1001", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL AIRES DA MATA MACHADO", lat: -19.9940697, lng: -44.034994 },
  { cod: "1002", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANA ALVES TEIXEIRA", lat: -19.9990917, lng: -44.00669 },
  { cod: "1003", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANTONIO ALEIXO", lat: -19.9735033, lng: -44.0138383 },
  { cod: "1010", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DULCE MARIA HOMEM", lat: -19.9948765, lng: -44.0127769 },
  { cod: "1012", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ELOY HERALDO LIMA", lat: -20.0048856, lng: -44.0415678 },
  { cod: "1026", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DA VILA PINHO", lat: -20.0034861, lng: -44.0233127 },
  { cod: "1030", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL POLO DE EDUCAÇAO INTEGRADA", lat: -19.9961129, lng: -44.0058855 },
  { cod: "1101", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BARREIRO - CARLOS RENATO DIAS", lat: -19.9756561, lng: -44.0226573 },
  { cod: "1103", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BARREIRO DE CIMA", lat: -19.9958176, lng: -44.0052423 },
  { cod: "1104", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BONSUCESSO", lat: -19.9871417, lng: -43.9888727 },
  { cod: "1105", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE DIAMANTE - TEIXEIRA DIAS", lat: -19.9919205, lng: -44.0159339 },
  { cod: "1106", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE INDEPENDENCIA", lat: -20.0197906, lng: -44.0315046 },
  { cod: "1107", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ITAIPU - JATOBA", lat: -19.9962467, lng: -44.0484536 },
  { cod: "1117", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VALE DO JATOBA", lat: -20.0102569, lng: -44.0362125 },
  { cod: "1118", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VILA CEMIG", lat: -19.9979283, lng: -43.992439 },
  { cod: "1119", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VILA PINHO", lat: -20.0007951, lng: -44.0262291 },
  { cod: "1150", reg: "BARREIRO", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO BARREIRO", lat: -19.9959269, lng: -44.0201514 },
  { cod: "1233", reg: "BARREIRO", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS BARREIRO", lat: -19.9735562, lng: -44.0201585 },
  { cod: "1234", reg: "BARREIRO", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS DIAMANTE", lat: -19.9942954, lng: -44.0240108 },
  { cod: "1350", reg: "BARREIRO", tipo: "RESTAURANTE", nome: "RESTAURANTE POPULAR DOM MAURO BASTOS", lat: -19.9761133, lng: -44.023685 },
  { cod: "1438", reg: "BARREIRO", tipo: "CENTRO POLIESPORTIVO", nome: "CENTRO ESPORTIVO VALE DO JATOBA - CESVJ", lat: -20.0080228, lng: -44.0347673 },

  // --- VENDA NOVA ---
  { cod: "9001", reg: "VENDA NOVA", tipo: "CONSELHO TUTELAR", nome: "CONSELHO TUTELAR VENDA NOVA", lat: -19.8189719, lng: -43.9552034 },
  { cod: "9003", reg: "VENDA NOVA", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ADAUTO LUCIO CARDOSO", lat: -19.8159626, lng: -43.9980326 },
  { cod: "9004", reg: "VENDA NOVA", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANTONIA FERREIRA", lat: -19.8187874, lng: -43.9624227 },
  { cod: "9070", reg: "VENDA NOVA", tipo: "EMEI", nome: "EMEI VENDA NOVA", lat: -19.819702, lng: -43.953867 },
  { cod: "9101", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ANDRADAS", lat: -19.8199104, lng: -43.9630504 },
  { cod: "9102", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CEU AZUL", lat: -19.8195272, lng: -43.9984626 },
  { cod: "9103", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE COPACABANA", lat: -19.8342257, lng: -43.9860984 },
  { cod: "9104", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM EUROPA", lat: -19.8004396, lng: -43.9670977 },
  { cod: "9105", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM LEBLON", lat: -19.8299698, lng: -43.98731 },
  { cod: "9106", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE LAGOA", lat: -19.8091975, lng: -44.0010922 },
  { cod: "9107", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MANTIQUEIRA", lat: -19.7995605, lng: -43.9805728 },
  { cod: "9108", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MINAS CAIXA", lat: -19.8053143, lng: -43.9577971 },
  { cod: "9109", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE NOVA YORK", lat: -19.7942221, lng: -43.9680642 },
  { cod: "9110", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PIRATININGA", lat: -19.816426, lng: -43.9928596 },
  { cod: "9111", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VISCONDE DO RIO BRANCO", lat: -19.8147903, lng: -43.9802543 },
  { cod: "9113", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTA MONICA", lat: -19.8295486, lng: -43.976858 },
  { cod: "9114", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SERRA VERDE", lat: -19.7954055, lng: -43.9536417 },
  { cod: "9115", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PARAUNA - VENDA NOVA", lat: -19.8024003, lng: -43.989109 },
  { cod: "9116", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM DOS COMERCIARIOS", lat: -19.7885901, lng: -43.9767253 },
  { cod: "9118", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTO ANTONIO", lat: -19.8177476, lng: -43.9588839 },
  { cod: "9119", reg: "VENDA NOVA", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTA MONICA II - ALAMEDA DOS IPES", lat: -19.8178526, lng: -43.9738749 },
  { cod: "9150", reg: "VENDA NOVA", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO VENDA NOVA", lat: -19.8201728, lng: -43.9533197 },
  { cod: "9201", reg: "VENDA NOVA", tipo: "LABORATORIO", nome: "LABORATORIO REGIONAL NORTE-VENDA NOVA", lat: -19.8092364, lng: -43.9693581 },
  { cod: "9204", reg: "VENDA NOVA", tipo: "CC", nome: "CENTRO DE CONVIVENCIA MARCUS MATRAGA", lat: -19.8234022, lng: -43.9607355 },
  { cod: "9207", reg: "VENDA NOVA", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL VENDA NOVA", lat: -19.8289834, lng: -43.9768977 },
  { cod: "9210", reg: "VENDA NOVA", tipo: "CEM", nome: "CENTRO DE ESPECIALIDADES MEDICAS VENDA NOVA", lat: -19.8200478, lng: -43.9531146 },
  { cod: "9212", reg: "VENDA NOVA", tipo: "FARMACIA", nome: "FARMACIA DISTRITAL VENDA NOVA", lat: -19.8028532, lng: -43.967882 },
  { cod: "9255", reg: "VENDA NOVA", tipo: "DRES", nome: "DIRETORIA REGIONAL DE SAUDE VENDA NOVA", lat: -19.8153447, lng: -43.9541458 },
  { cod: "9271", reg: "VENDA NOVA", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS/MOVE/METROPOLITANO VILARINHO", lat: -19.8209605, lng: -43.9472392 },
  { cod: "ET34", reg: "VENDA NOVA", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE CANDELARIA", lat: -19.8100715, lng: -43.9657996 },
  { cod: "ET35", reg: "VENDA NOVA", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE MINAS CAIXA", lat: -19.812149, lng: -43.9607678 },
  { cod: "ET36", reg: "VENDA NOVA", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE QUADRAS DO VILARINHO", lat: -19.8148572, lng: -43.9550058 },
  { cod: "ET37", reg: "VENDA NOVA", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE UPA VENDA NOVA", lat: -19.8181867, lng: -43.9526248 },
  { cod: "G916", reg: "VENDA NOVA", tipo: "GPU", nome: "GPU VENDA NOVA", lat: -19.85, lng: -43.98 },

  // --- OESTE ---
  { cod: "7100", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE AMILCAR VIANA MARTINS", lat: -19.957651, lng: -43.9843226 },
  { cod: "7101", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BETANIA", lat: -19.9620479, lng: -43.9886455 },
  { cod: "7102", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CABANA", lat: -19.9433335, lng: -43.9966795 },
  { cod: "7103", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CICERO IDELFONSO", lat: -19.954822, lng: -43.9978798 },
  { cod: "7104", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CONJUNTO BETANIA", lat: -19.9643817, lng: -43.9956514 },
  { cod: "7105", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE HAVAI", lat: -19.9664695, lng: -43.9726859 },
  { cod: "7106", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE NORALDINO DE LIMA", lat: -19.9304507, lng: -43.9729258 },
  { cod: "7107", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SALGADO FILHO", lat: -19.944023, lng: -43.9849883 },
  { cod: "7108", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAO JORGE", lat: -19.9449288, lng: -43.9649057 },
  { cod: "7109", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE WALDOMIRO LOBO", lat: -19.9456623, lng: -44.0051199 },
  { cod: "7110", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VENTOSA", lat: -19.9507329, lng: -43.9722289 },
  { cod: "7111", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VILA IMPERIAL", lat: -19.9491, lng: -44.0047335 },
  { cod: "7112", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VILA LEONINA", lat: -19.9559319, lng: -43.9651484 },
  { cod: "7113", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VISTA ALEGRE", lat: -19.9494464, lng: -43.9916482 },
  { cod: "7114", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PALMEIRAS", lat: -19.9721518, lng: -43.9781608 },
  { cod: "7115", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JOAO XXIII", lat: -19.9375066, lng: -44.0057557 },
  { cod: "7116", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTA MARIA", lat: -19.9333373, lng: -44.016996 },
  { cod: "7117", reg: "OESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CAMARGOS", lat: -19.9399732, lng: -44.0181588 },
  { cod: "7150", reg: "OESTE", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO OESTE", lat: -19.9510987, lng: -43.9681199 },
  { cod: "7210", reg: "OESTE", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL OESTE", lat: -19.9423424, lng: -43.962754 },
  { cod: "7220", reg: "OESTE", tipo: "FARMACIA", nome: "FARMACIA REGIONAL OESTE", lat: -19.9273382, lng: -43.9775956 },
  { cod: "7230", reg: "OESTE", tipo: "CARE", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL OESTE", lat: -19.9357076, lng: -43.9710909 },
  { cod: "7232", reg: "OESTE", tipo: "HOSPITAL VETERINARIO", nome: "HOSPITAL PUBLICO VETERINARIO DE BELO HORIZONTE", lat: -19.9493772, lng: -44.0068592 },
  { cod: "7267", reg: "OESTE", tipo: "DRES", nome: "DIRETORIA REGIONAL DE SAUDE OESTE", lat: -19.9357076, lng: -43.9710909 },

  // --- NORTE ---
  { cod: "4283", reg: "NORTE", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS/MOVE/METROPOLITANO SAO GABRIEL", lat: -19.8632747, lng: -43.9264397 },
  { cod: "6001", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ACADEMICO VIVALDI MOREIRA", lat: -19.8060083, lng: -43.9402896 },
  { cod: "6002", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL CONSUL ANTONIO CADAR", lat: -19.8507495, lng: -43.9271002 },
  { cod: "6100", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE AARAO REIS", lat: -19.8459647, lng: -43.920775 },
  { cod: "6101", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CAMPO ALEGRE", lat: -19.8275376, lng: -43.9452885 },
  { cod: "6102", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ETELVINA CARNEIRO", lat: -19.8120223, lng: -43.9318009 },
  { cod: "6103", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE FLORAMAR", lat: -19.8395868, lng: -43.9337817 },
  { cod: "6104", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ZILAH SPOSITO", lat: -19.8047869, lng: -43.9281987 },
  { cod: "6105", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE GUARANI", lat: -19.8426332, lng: -43.924301 },
  { cod: "6106", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE HELIOPOLIS", lat: -19.8441041, lng: -43.9420342 },
  { cod: "6107", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JAQUELINE", lat: -19.8018459, lng: -43.9365938 },
  { cod: "6108", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JAQUELINE II", lat: -19.8051514, lng: -43.9441316 },
  { cod: "6109", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM FELICIDADE", lat: -19.8298265, lng: -43.9276699 },
  { cod: "6110", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE FELICIDADE II", lat: -19.8249947, lng: -43.9307529 },
  { cod: "6111", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE LAJEDO", lat: -19.8341917, lng: -43.9135706 },
  { cod: "6112", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MG-20", lat: -19.8163556, lng: -43.8843171 },
  { cod: "6113", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PRIMEIRO DE MAIO", lat: -19.8625002, lng: -43.9293629 },
  { cod: "6114", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PROVIDENCIA", lat: -19.8532646, lng: -43.9291837 },
  { cod: "6115", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAO BERNARDO - AMELIA ROCHA DE MELO", lat: -19.8481029, lng: -43.9384326 },
  { cod: "6116", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAO TOMAZ", lat: -19.8450483, lng: -43.9533891 },
  { cod: "6117", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE TUPI", lat: -19.8358593, lng: -43.9226827 },
  { cod: "6118", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM GUANABARA", lat: -19.8285014, lng: -43.9328271 },
  { cod: "6119", reg: "NORTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE NOVO AARAO REIS", lat: -19.8412842, lng: -43.9087765 },
  { cod: "6120", reg: "NORTE", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL NORTE", lat: -19.8510055, lng: -43.932652 },
  { cod: "6150", reg: "NORTE", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO NORTE", lat: -19.8456369, lng: -43.9143925 },
  { cod: "6201", reg: "NORTE", tipo: "CASA DO IDOSO", nome: "CASA TRANSITORIA DO IDOSO", lat: -19.857709, lng: -43.9298328 },
  { cod: "6215", reg: "NORTE", tipo: "FARMACIA", nome: "FARMACIA REGIONAL NORTE", lat: -19.844379, lng: -43.9571081 },
  { cod: "6220", reg: "NORTE", tipo: "DRES", nome: "DIRETORIA REGIONAL DE SAUDE NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6230", reg: "NORTE", tipo: "CARE", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "G619", reg: "NORTE", tipo: "CEPRON", nome: "CENTRAL DE PRONTO N-VN", lat: -19.85, lng: -43.98 },

  // ... (Mocks for other regions to avoid empty map)
  { cod: "3001", reg: "LESTE", tipo: "ESCOLA", nome: "Escola M. Leste Mock 1", end: "Rua Leste 1", num: "10", bairro: "Santa Tereza" },
  { cod: "3002", reg: "LESTE", tipo: "CS", nome: "Centro de Saude Leste Mock", end: "Rua Leste 2", num: "20", bairro: "Esplanada" },
  { cod: "4001", reg: "NORDESTE", tipo: "ESCOLA", nome: "Escola M. Nordeste Mock 1", end: "Rua NE 1", num: "10", bairro: "União" },
  { cod: "5001", reg: "NOROESTE", tipo: "ESCOLA", nome: "Escola M. Noroeste Mock 1", end: "Rua NO 1", num: "10", bairro: "Padre Eustáquio" },
  { cod: "8001", reg: "PAMPULHA", tipo: "ESCOLA", nome: "Escola M. Pampulha Mock 1", end: "Rua Pampulha 1", num: "10", bairro: "Santa Amélia" },
  { cod: "2501", reg: "CENTRO-SUL", tipo: "PREFEITURA", nome: "Prefeitura de BH", end: "Av. Afonso Pena", num: "1212", bairro: "Centro" },
];

// --- Mapeamento Correto ---

export const mapRawToProprio = (data: any): Proprio => {
  let lat = 0;
  let lng = 0;

  // 1. Se tiver coordenada real (GPS Exato - Barreiro/Venda Nova/Oeste/Norte), usa
  if (data.lat && data.lng) {
    lat = parseFloat(data.lat);
    lng = parseFloat(data.lng);
  } 
  // 2. Se tiver bairro mapeado, usa centro do bairro + jitter (Simulação Inteligente)
  else if (data.bairro && NEIGHBORHOOD_CENTERS[data.bairro]) {
    const center = NEIGHBORHOOD_CENTERS[data.bairro];
    const coord = generateCoord(center.lat, center.lng, 0.008); 
    lat = coord.lat;
    lng = coord.lng;
  }
  // 3. Fallback para centro da regional (Simulação Genérica)
  else {
    const center = REGIONAL_CENTERS[data.reg] || { lat: -19.9167, lng: -43.9345 };
    const coord = generateCoord(center.lat, center.lng, 0.04);
    lat = coord.lat;
    lng = coord.lng;
  }

  return {
    cod: data.cod,
    nome_equipamento: data.nome || data.nome_equipamento || 'Sem Nome',
    tipo_logradouro: data.tipo || data.tipo_logradouro,
    nome_logradouro: data.end || data.nome_logradouro,
    numero_imovel: data.num || data.numero_imovel,
    bairro: data.bairro,
    regional: data.reg || data.regional,
    lat: lat,
    lng: lng,
    prioridade: determinePriority(data.nome || data.nome_equipamento)
  };
};

// Exportar MOCK_PROPRIOS usando a variável local RAW_DATA
export const MOCK_PROPRIOS: Proprio[] = RAW_DATA.map(mapRawToProprio);

export const getSimulationRoute = (regional: string): RoutePoint[] => {
  const regionalProprios = MOCK_PROPRIOS.filter(p => p.regional === regional);
  
  if (regionalProprios.length < 2) {
    // Fallback to regional center if no proprios
    const center = REGIONAL_CENTERS[regional] || REGIONAL_CENTERS["CENTRO-SUL"];
    return [
      { lat: center.lat, lng: center.lng, timestamp: Date.now() },
      { lat: center.lat + 0.01, lng: center.lng + 0.01, timestamp: Date.now() }
    ];
  }

  // Create a loop visiting some points
  const route: RoutePoint[] = [];
  // Pick up to 5 random points
  for (let i = 0; i < 5; i++) {
    const p = regionalProprios[Math.floor(Math.random() * regionalProprios.length)];
    route.push({
      lat: p.lat,
      lng: p.lng,
      timestamp: Date.now()
    });
  }
  // Close the loop
  route.push(route[0]);
  return route;
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
export const DEBOUNCE_MINUTES = 0.1;
