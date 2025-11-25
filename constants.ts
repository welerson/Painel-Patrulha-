import { Proprio, RoutePoint } from './types';

// Version control to force update
export const DB_VERSION = "4.2-FULL-DATA-CONSOLIDATED-7REG";

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

// Neighborhood Centers (Normalized keys to Uppercase for matching fallback)
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
  "TUPI": { lat: -19.835, lng: -43.920 },
  "CAIÇARAS": { lat: -19.905, lng: -43.965 },
  "PADRE EUSTAQUIO": { lat: -19.915, lng: -43.980 },
  "CARLOS PRATES": { lat: -19.915, lng: -43.955 },
  "ALIPIO DE MELO": { lat: -19.895, lng: -44.000 },
  "DOM BOSCO": { lat: -19.915, lng: -44.000 },
  "SAVASSI": { lat: -19.933, lng: -43.937 },
  "LOURDES": { lat: -19.928, lng: -43.944 },
  "SANTO ANTONIO": { lat: -19.941, lng: -43.942 },
  "SION": { lat: -19.957, lng: -43.933 },
  "MANGABEIRAS": { lat: -19.949, lng: -43.917 },
  "SERRA": { lat: -19.939, lng: -43.919 },
  "SAO GERALDO": { lat: -19.895, lng: -43.900 },
  "ESPLANADA": { lat: -19.905, lng: -43.910 },
  "SAGRADA FAMILIA": { lat: -19.905, lng: -43.920 },
  "TAQUARIL": { lat: -19.920, lng: -43.885 },
  "SANTA EFIGENIA": { lat: -19.925, lng: -43.925 },
  "POMPEIA": { lat: -19.915, lng: -43.905 },
  "CASA BRANCA": { lat: -19.900, lng: -43.890 },
  "GRANJA DE FREITAS": { lat: -19.910, lng: -43.885 },
  "PARAISO": { lat: -19.920, lng: -43.905 },
  "ALTO VERA CRUZ": { lat: -19.915, lng: -43.890 },
  "BOA VISTA": { lat: -19.895, lng: -43.900 },
  "FLORESTA": { lat: -19.915, lng: -43.935 },
  "NOVA VISTA": { lat: -19.890, lng: -43.900 },
  "VERA CRUZ": { lat: -19.915, lng: -43.900 },
  "HORTO": { lat: -19.915, lng: -43.920 },
  "MARIANO DE ABREU": { lat: -19.900, lng: -43.890 },
  "SAO LUCAS": { lat: -19.930, lng: -43.920 },
  "SANTA INES": { lat: -19.885, lng: -43.910 },
  "JONAS VEIGA": { lat: -19.920, lng: -43.895 },
  "PIRINEUS": { lat: -19.925, lng: -43.885 }
};

// DADOS COMPLETOS
const RAW_DATA: any[] = [
  // --- NORTE (GPS REAL) ---
  { cod: "6001", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ACADEMICO VIVALDI MOREIRA", lat: -19.8060083, lng: -43.9402896 },
  { cod: "6002", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL CONSUL ANTONIO CADAR", lat: -19.8507495, lng: -43.9271002 },
  { cod: "6003", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DESEMBARGADOR LORETO RIBEIRO DE ABREU", lat: -19.8174493, lng: -43.9018121 },
  { cod: "6004", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL FLORESTAN FERNANDES", lat: -19.8214542, lng: -43.9245686 },
  { cod: "6005", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL FRANCISCO CAMPOS", lat: -19.8344928, lng: -43.9224607 },
  { cod: "6006", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL FRANCISCO MAGALHAES GOMES", lat: -19.8213056, lng: -43.9497688 },
  { cod: "6007", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL HELIO PELLEGRINO", lat: -19.8451035, lng: -43.9248666 },
  { cod: "6008", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL HERBERT JOSE DE SOUZA", lat: -19.8406695, lng: -43.9077336 },
  { cod: "6009", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL HILDA RABELLO MATTA", lat: -19.8448536, lng: -43.9344151 },
  { cod: "6010", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL JARDIM FELICIDADE", lat: -19.8240903, lng: -43.9307107 },
  { cod: "6011", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL JOSE MARIA DOS MARES GUIA", lat: -19.8435469, lng: -43.9417456 },
  { cod: "6012", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL JOSEFINA SOUZA LIMA", lat: -19.856441, lng: -43.9308609 },
  { cod: "6013", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL MARIA SILVEIRA", lat: -19.8479098, lng: -43.9444447 },
  { cod: "6014", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL MINERVINA AUGUSTA", lat: -19.8298071, lng: -43.9470568 },
  { cod: "6015", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR DANIEL ALVARENGA", lat: -19.8034382, lng: -43.9289471 },
  { cod: "6016", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL RUI DA COSTA VAL", lat: -19.8296816, lng: -43.9281314 },
  { cod: "6017", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SEBASTIANA NOVAIS", lat: -19.8419561, lng: -43.9193881 },
  { cod: "6018", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SECRETARIO HUMBERTO ALMEIDA", lat: -19.822128, lng: -43.902682 },
  { cod: "6019", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL TRISTAO DA CUNHA", lat: -19.8378764, lng: -43.9430409 },
  { cod: "6020", reg: "NORTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SERGIO MIRANDA", lat: -19.8310328, lng: -43.9137983 },
  { cod: "6061", reg: "NORTE", tipo: "EMEI", nome: "EMEI AARAO REIS", lat: -19.8473965, lng: -43.9217127 },
  { cod: "6062", reg: "NORTE", tipo: "EMEI", nome: "EMEI MONTE AZUL", lat: -19.8177762, lng: -43.8938506 },
  { cod: "6063", reg: "NORTE", tipo: "EMEI", nome: "EMEI JULIANA", lat: -19.8170535, lng: -43.942598 },
  { cod: "6064", reg: "NORTE", tipo: "EMEI", nome: "EMEI BETINHO", lat: -19.8447565, lng: -43.9135057 },
  { cod: "6065", reg: "NORTE", tipo: "EMEI", nome: "EMEI JARDIM GUANABARA", lat: -19.8291208, lng: -43.933616 },
  { cod: "6066", reg: "NORTE", tipo: "EMEI", nome: "EMEI MARIQUINHAS", lat: -19.8121918, lng: -43.9397534 },
  { cod: "6067", reg: "NORTE", tipo: "EMEI", nome: "EMEI PRIMEIRO DE MAIO", lat: -19.8588218, lng: -43.9275652 },
  { cod: "6068", reg: "NORTE", tipo: "EMEI HELIOPOLIS", lat: -19.8427573, lng: -43.9414569 },
  { cod: "6069", reg: "NORTE", tipo: "EMEI", nome: "EMEI SAO BERNARDO", lat: -19.8461873, lng: -43.944331 },
  { cod: "6070", reg: "NORTE", tipo: "EMEI", nome: "EMEI ZILAH SPOSITO", lat: -19.8046017, lng: -43.9283447 },
  { cod: "6071", reg: "NORTE", tipo: "EMEI", nome: "EMEI CURUMINS", lat: -19.8303113, lng: -43.9279613 },
  { cod: "6072", reg: "NORTE", tipo: "EMEI", nome: "EMEI MINASLANDIA", lat: -19.8516406, lng: -43.931878 },
  { cod: "6073", reg: "NORTE", tipo: "EMEI", nome: "EMEI VILA CLORIS", lat: -19.8244647, lng: -43.9421529 },
  { cod: "6074", reg: "NORTE", tipo: "EMEI", nome: "EMEI GUARANI", lat: -19.8413545, lng: -43.9234781 },
  { cod: "6075", reg: "NORTE", tipo: "EMEI", nome: "EMEI JAQUELINE", lat: -19.8044344, lng: -43.9434419 },
  { cod: "6076", reg: "NORTE", tipo: "EMEI", nome: "EMEI PLANALTO", lat: -19.8394345, lng: -43.9454256 },
  { cod: "6077", reg: "NORTE", tipo: "EMEI", nome: "EMEI XODO MARIZE", lat: -19.8207627, lng: -43.9388726 },
  { cod: "6078", reg: "NORTE", tipo: "EMEI", nome: "EMEI SOLIMOES", lat: -19.8236553, lng: -43.9294869 },
  { cod: "6079", reg: "NORTE", tipo: "EMEI", nome: "EMEI LAJEDO", lat: -19.834032, lng: -43.9130011 },
  { cod: "6080", reg: "NORTE", tipo: "EMEI", nome: "EMEI FLORAMAR", lat: -19.8352006, lng: -43.9332583 },
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
  { cod: "6120", reg: "NORTE", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL NORTE", lat: -19.8510055, lng: -43.9326519 },
  { cod: "6150", reg: "NORTE", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO NORTE", lat: -19.8456369, lng: -43.9143925 },
  { cod: "6200", reg: "NORTE", tipo: "ABRIGO", nome: "ABRIGO SAO PAULO", lat: -19.8624211, lng: -43.9280985 },
  { cod: "6201", reg: "NORTE", tipo: "CASA DO IDOSO", nome: "CASA TRANSITORIA DO IDOSO", lat: -19.857709, lng: -43.9298328 },
  { cod: "6202", reg: "NORTE", tipo: "CENTRAL DE ESTERILIZAÇAO", nome: "CENTRAL DE ESTERILIZAÇAO NORTE", lat: -19.845628, lng: -43.9143905 },
  { cod: "6203", reg: "NORTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL SAO BERNARDO", lat: -19.8463515, lng: -43.9453916 },
  { cod: "6205", reg: "NORTE", tipo: "ZOONOSES", nome: "CENTRO DE CONTROLE ZOONOSES", lat: -19.8471036, lng: -43.94474 },
  { cod: "6206", reg: "NORTE", tipo: "CC", nome: "CENTRO DE CONVIVENCIA ROSIMERE SILVA", lat: -19.853249, lng: -43.9311953 },
  { cod: "6207", reg: "NORTE", tipo: "CENTRO POLIESPORTIVO", nome: "GINASIO POLIESPOTIVO JAIR FLOSINO DOS REIS", lat: -19.8179663, lng: -43.8942209 },
  { cod: "6210", reg: "NORTE", tipo: "CONSELHO TUTELAR", nome: "CONSELHO TUTELAR NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6213", reg: "NORTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL JARDIM GUANABARA", lat: -19.8288458, lng: -43.9330799 },
  { cod: "6214", reg: "NORTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL ZILAH SPOSITO", lat: -19.8010234, lng: -43.9228542 },
  { cod: "6215", reg: "NORTE", tipo: "FARMACIA", nome: "FARMACIA REGIONAL NORTE", lat: -19.844379, lng: -43.9571081 },
  { cod: "6220", reg: "NORTE", tipo: "DRES", nome: "DIRETORIA REGIONAL DE SAUDE NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6228", reg: "NORTE", tipo: "DIRE", nome: "DIRETORIA REGIONAL DE EDUCACAO NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6230", reg: "NORTE", tipo: "CARE", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6231", reg: "NORTE", tipo: "GERAT", nome: "GERENCIA REGIONAL DE ATENDIMENTO AO CIDADAO NORTE", lat: -19.8499102, lng: -43.9345068 },
  { cod: "6232", reg: "NORTE", tipo: "CREAS", nome: "CENTRO DE REFERENCIA ESPECIALIZADO EM ASSISTENCIA SOCIAL NORTE", lat: -19.8499102, lng: -43.9345068 },
  { cod: "6260", reg: "NORTE", tipo: "GERENCIA ZOONOSES", nome: "GERENCIA DE ZOONOSES NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6261", reg: "NORTE", tipo: "GERENCIA", nome: "GERENCIA DE ASSISTENCIA EPIDEMIOLOGIA E REGULAÇAO NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6262", reg: "NORTE", tipo: "GERENCIA", nome: "GERENCIA DE VIGILANCIA SANITARIA NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "6264", reg: "NORTE", tipo: "LABORATORIO ZOONOSES", nome: "LABORATORIO DE ZOONOSES", lat: -19.8471036, lng: -43.94474 },
  { cod: "6265", reg: "NORTE", tipo: "GERMA", nome: "GERENCIA REGIONAL DE MANUTENCAO NORTE", lat: -19.8511191, lng: -43.935122 },
  { cod: "6266", reg: "NORTE", tipo: "PLA", nome: "PROGRAMA LIBERDADE ASSISTIDA", lat: -19.853249, lng: -43.9311953 },
  { cod: "6274", reg: "NORTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA  SOCIAL JARDIM FELICIDADE - NORTE", lat: -19.830682, lng: -43.9286977 },
  { cod: "6278", reg: "NORTE", tipo: "VOO PARA CIDADANIA", nome: "VOO PARA CIDADANIA", lat: -19.8440519, lng: -43.9458778 },
  { cod: "6279", reg: "NORTE", tipo: "RESIDENCIA TERAPEUTICA", nome: "RESIDENCIA TERAPEUTICA", lat: -19.8408113, lng: -43.9313862 },
  { cod: "6280", reg: "NORTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL NOVO AARAO REIS - BRASILINA MARIA DE OLIVEIRA", lat: -19.8464787, lng: -43.9154845 },
  { cod: "6281", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE JAQUELINE", lat: -19.8024442, lng: -43.9402617 },
  { cod: "6282", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE PROVIDENCIA", lat: -19.853249, lng: -43.9311953 },
  { cod: "6283", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE SAO BERNARDO", lat: -19.8440407, lng: -43.9459126 },
  { cod: "6284", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE ZILAH SPOSITO", lat: -19.8048723, lng: -43.9280808 },
  { cod: "6285", reg: "NORTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL ZILAH SPOSITO", lat: -19.8048614, lng: -43.9280784 },
  { cod: "6286", reg: "NORTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA  SOCIAL VILA BIQUINHAS", lat: -19.8424724, lng: -43.9402684 },
  { cod: "6287", reg: "NORTE", tipo: "URPV", nome: "URPV BACURAUS", lat: -19.8299696, lng: -43.9480326 },
  { cod: "6288", reg: "NORTE", tipo: "URPV", nome: "URPV SARAMENHA", lat: -19.8417886, lng: -43.9202929 },
  { cod: "6289", reg: "NORTE", tipo: "URPV", nome: "URPV AEROPORTO", lat: -19.8489883, lng: -43.94393 },
  { cod: "6290", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE VILA BIQUINHAS", lat: -19.8424723, lng: -43.9402686 },
  { cod: "6291", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE VIA 240", lat: -19.8464787, lng: -43.9154842 },
  { cod: "6292", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE MONTE AZUL", lat: -19.8178316, lng: -43.8941833 },
  { cod: "6295", reg: "NORTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE CAMPO ALEGRE", lat: -19.8275376, lng: -43.9452885 },
  { cod: "6298", reg: "NORTE", tipo: "URPV", nome: "URPV JARDIM GUANABARA", lat: -19.8215365, lng: -43.9361719 },
  { cod: "6299", reg: "NORTE", tipo: "PRAÇA", nome: "PRAÇA JORGE ALVES", lat: -19.842683, lng: -43.9306546 },
  { cod: "6300", reg: "NORTE", tipo: "PISTA", nome: "PISTA DE COOPER", lat: -19.8464907, lng: -43.9155173 },
  { cod: "6301", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO CAMPO ALEGRE", lat: -19.8322241, lng: -43.9457615 },
  { cod: "6302", reg: "NORTE", tipo: "PRAÇA", nome: "PRAÇA DO CAMPO SAO BERNARDO", lat: -19.8468062, lng: -43.9452026 },
  { cod: "6303", reg: "NORTE", tipo: "PRAÇA", nome: "PRAÇA QUATRO MIL DUZENTOS E NOVENTA E UM", lat: -19.8187447, lng: -43.9022117 },
  { cod: "6309", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA AO LADO DO CAMPO MADALENA", lat: -19.8289527, lng: -43.9263402 },
  { cod: "6310", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA DA AMELIA CLEMENTE ROCHA", lat: -19.8276272, lng: -43.9148546 },
  { cod: "6311", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO CAMPO TUPINENSE", lat: -19.83625, lng: -43.9225754 },
  { cod: "6312", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO CENTRO ESPORTIVO ATHAYDE ALVES VIANNA", lat: -19.8396715, lng: -43.9334592 },
  { cod: "6313", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA DESEMBARGADOR CANDIDO MARTINS", lat: -19.8331379, lng: -43.9122106 },
  { cod: "6314", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA PROFESSOR RUBENS GUELLI", lat: -19.8297554, lng: -43.9345462 },
  { cod: "6315", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA CINCO", lat: -19.8405848, lng: -43.91135 },
  { cod: "6316", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA DAS CLARISSAS", lat: -19.8398044, lng: -43.9430563 },
  { cod: "6317", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA VEREDA TROPICAL", lat: -19.7994613, lng: -43.9329289 },
  { cod: "6318", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO GINASIO POLIESPORTIVO JAIR FLOSINO DOS REIS", lat: -19.817887, lng: -43.8943442 },
  { cod: "6319", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PARQUE ECOLOGICO JARDINS DAS NASCENTES", lat: -19.8126098, lng: -43.935245 },
  { cod: "6320", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PARQUE NOSSA SENHORA DA PIEDADE", lat: -19.8476153, lng: -43.9266606 },
  { cod: "6321", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PARQUE PLANALTO", lat: -19.8358505, lng: -43.9520035 },
  { cod: "6322", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PARQUE PRIMEIRO DE MAIO", lat: -19.8548664, lng: -43.9296938 },
  { cod: "6323", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA CANDIDO PORTINARI", lat: -19.8401471, lng: -43.9228879 },
  { cod: "6324", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DA INCONFIDENCIA MINEIRA", lat: -19.8486895, lng: -43.9431308 },
  { cod: "6325", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DA RUA AGENOR DE PAULA ESTRELA", lat: -19.7974184, lng: -43.9320442 },
  { cod: "6326", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DA RUA BENEDITO XAVIER", lat: -19.8613398, lng: -43.9265745 },
  { cod: "6327", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DA RUA CAMPO VERDE", lat: -19.8179719, lng: -43.944253 },
  { cod: "6328", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DA RUA CHEFLERA", lat: -19.8089246, lng: -43.9338119 },
  { cod: "6329", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DA QUATRO MIL DUZENTOS E NOVENTA E UM", lat: -19.8191427, lng: -43.9026712 },
  { cod: "6330", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DAS ANDORINHAS", lat: -19.8258322, lng: -43.9465041 },
  { cod: "6331", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DO CAMPO DO SAO BERNARDO", lat: -19.8468062, lng: -43.9452026 },
  { cod: "6333", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA JORGE ALVES", lat: -19.8425513, lng: -43.9305014 },
  { cod: "6334", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA SILVINO PINHEIRO DA SILVA", lat: -19.8242197, lng: -43.937115 },
  { cod: "6335", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA NOSSA SENHORA DA PAZ", lat: -19.8297845, lng: -43.9565581 },
  { cod: "6336", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA PADRE LAGE", lat: -19.8444511, lng: -43.9369343 },
  { cod: "6337", reg: "NORTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA RISOLETA NEVES", lat: -19.8461569, lng: -43.9156091 },
  { cod: "6338", reg: "NORTE", tipo: "GERENCIA", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA NORTE", lat: -19.8511191, lng: -43.935122 },
  { cod: "6339", reg: "NORTE", tipo: "URPV", nome: "URPV BOTAO DE ROSAS", lat: -19.8092628, lng: -43.9319045 },
  { cod: "6340", reg: "NORTE", tipo: "DRAS", nome: "DIRETORIA REGIONAL DE ASSISTENCIA SOCIAL NORTE", lat: -19.8499102, lng: -43.9345068 },
  { cod: "6341", reg: "NORTE", tipo: "GCMBH", nome: "GUARDA CIVIL MUNICIPAL - INSPETORIA REGIONAL NORTE", lat: -19.8503179, lng: -43.9346947 },
  { cod: "ET24", reg: "NORTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE PLANALTO", lat: -19.8250302, lng: -43.9556537 },
  { cod: "ET38", reg: "NORTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE CRISTIANO GUIMARAES", lat: -19.8225318, lng: -43.9537006 },
  { cod: "ET39", reg: "NORTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE SAO JOAO BATISTA", lat: -19.8271514, lng: -43.9586434 },
  { cod: "G615", reg: "NORTE", tipo: "GPU", nome: "GPU NORTE", lat: -19.845, lng: -43.94 },
  { cod: "G619", reg: "NORTE", tipo: "CEPRON", nome: "CENTRAL DE PRONTO N-VN", lat: -19.85, lng: -43.98 },
  { cod: "G622", reg: "NORTE", tipo: "SUOPE", nome: "SUOPE NORTE / VENDA NOVA", lat: -19.85, lng: -43.98 },
  { cod: "G624", reg: "NORTE", tipo: "FISCOPE", nome: "FISCOPE NORTE", lat: -19.85, lng: -43.98 },
  { cod: "G625", reg: "NORTE", tipo: "GETMO", nome: "GETMO NORTE", lat: -19.85, lng: -43.98 },
  { cod: "G631", reg: "NORTE", tipo: "GPE", nome: "GPE - N", lat: -19.845, lng: -43.94 },
  { cod: "G636", reg: "NORTE", tipo: "SUS", nome: "PATRULHA SUS NORTE", lat: -19.85, lng: -43.98 },
  { cod: "G656", reg: "NORTE", tipo: "PROTOCOLO", nome: "PROTOCOLO NORTE VENDA NOVA", lat: -19.85, lng: -43.98 },
  { cod: "G663", reg: "NORTE", tipo: "ESPECIALIZADAS", nome: "EQUIPE FISCALIZA BH NORTE", lat: -19.85, lng: -43.935 },
  { cod: "5001", reg: "NOROESTE", tipo: "ESCOLA PROFISSIONALIZANTE", nome: "ESCOLA PROFISSIONALIZANTE RAIMUNDA DA SILVA SOARES", lat: -19.9024012, lng: -43.9483794 },
  { cod: "5002", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ARTHUR GUIMARAES", lat: -19.8981215, lng: -43.9616121 },
  { cod: "5003", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL AUGUSTA MEDEIROS", lat: -19.891199, lng: -44.014918 },
  { cod: "5004", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL CARLOS GOIS", lat: -19.9024898, lng: -43.9520301 },
  { cod: "5005", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DOM JAIME DE BARROS CAMARA", lat: -19.9153959, lng: -43.9680421 },
  { cod: "5007", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL HONORINA DE BARROS", lat: -19.9025745, lng: -43.9463486 },
  { cod: "5009", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL JOAO PINHEIRO", lat: -19.9335447, lng: -43.9999632 },
  { cod: "5011", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL LUIGI TONIOLO", lat: -19.9024335, lng: -44.0173569 },
  { cod: "5012", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL MARIA DE REZENDE COSTA", lat: -19.9063346, lng: -43.9998994 },
  { cod: "5014", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL MONSENHOR ARTUR DE OLIVEIRA", lat: -19.9061062, lng: -43.9651314 },
  { cod: "5015", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL NOSSA SENHORA DO AMPARO", lat: -19.8894762, lng: -43.9509293 },
  { cod: "5016", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PADRE EDEIMAR MASSOTE", lat: -19.8983764, lng: -44.0217407 },
  { cod: "5017", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PREFEITO OSWALDO PIERUCCETTI", lat: -19.9100049, lng: -44.0090204 },
  { cod: "5018", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR CLAUDIO BRANDAO", lat: -19.8900946, lng: -43.9527351 },
  { cod: "5019", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR JOAO CAMILO DE OLIVEIRA", lat: -19.9293144, lng: -44.009357 },
  { cod: "5022", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL BELO HORIZONTE", lat: -19.9035114, lng: -43.9474314 },
  { cod: "5024", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI MARIA DA GLORIA LOMMEZ", lat: -19.9037735, lng: -43.9499745 },
  { cod: "5025", reg: "NOROESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DOM BOSCO", lat: -19.9166073, lng: -44.0001271 },
  { cod: "5062", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI CORNELIO VAZ DE MELO", lat: -19.8944984, lng: -43.9577664 },
  { cod: "5065", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI CARLOS PRATES", lat: -19.9147452, lng: -43.9523167 },
  { cod: "5069", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI VILA SAO VICENTE", lat: -19.9208725, lng: -43.983337 },
  { cod: "5070", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI VILA SENHOR DOS PASSOS", lat: -19.9058688, lng: -43.9486778 },
  { cod: "5071", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI PITUCHINHA", lat: -19.9289673, lng: -44.0027499 },
  { cod: "5072", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI PEDREIRA PRADO LOPES", lat: -19.9030185, lng: -43.9499487 },
  { cod: "5073", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI PINDORAMA", lat: -19.91092, lng: -44.0209793 },
  { cod: "5074", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI SABINOPOLIS", lat: -19.9108589, lng: -43.9603166 },
  { cod: "5075", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI NOVA ESPERANÇA", lat: -19.8996788, lng: -43.9620629 },
  { cod: "5076", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI CALIFORNIA", lat: -19.9212871, lng: -44.0089158 },
  { cod: "5077", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI COQUEIROS", lat: -19.8987633, lng: -44.0212677 },
  { cod: "5078", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI JARDIM MONTANHES", lat: -19.9049639, lng: -43.9814968 },
  { cod: "5079", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI CALIFORNIA II", lat: -19.9274572, lng: -44.0157152 },
  { cod: "5080", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI MARFIM", lat: -19.9069914, lng: -44.0235431 },
  { cod: "5101", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BOM JESUS", lat: -19.8947754, lng: -43.9556437 },
  { cod: "5102", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CALIFORNIA", lat: -19.9229895, lng: -44.0098991 },
  { cod: "5103", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE CARLOS PRATES", lat: -19.9146123, lng: -43.9633952 },
  { cod: "5104", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE DOM BOSCO", lat: -19.9120792, lng: -43.9995891 },
  { cod: "5105", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE DOM CABRAL", lat: -19.9232251, lng: -43.9998167 },
  { cod: "5106", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ERMELINDA", lat: -19.8903675, lng: -43.9583237 },
  { cod: "5107", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE GLORIA", lat: -19.9015933, lng: -44.016833 },
  { cod: "5109", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM FILADELFIA", lat: -19.9098162, lng: -44.0090571 },
  { cod: "5110", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JARDIM MONTANHES", lat: -19.9040504, lng: -43.9817198 },
  { cod: "5111", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE JOAO PINHEIRO", lat: -19.9276741, lng: -44.0037335 },
  { cod: "5113", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PADRE EUSTAQUIO", lat: -19.9208887, lng: -43.9830325 },
  { cod: "5114", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PEDREIRA PRADO LOPES", lat: -19.9018257, lng: -43.950479 },
  { cod: "5115", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PINDORAMA ELZA MARTINS", lat: -19.9083944, lng: -44.0208472 },
  { cod: "5117", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTOS ANJOS", lat: -19.9049863, lng: -43.9565056 },
  { cod: "5118", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAO CRISTOVAO", lat: -19.908531, lng: -43.9444291 },
  { cod: "5120", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE COQUEIROS", lat: -19.8977758, lng: -44.0222683 },
  { cod: "5123", reg: "NOROESTE", tipo: "URS", nome: "UNIDADE DE REFERENCIA SECUNDARIA PADRE EUSTAQUIO", lat: -19.9151287, lng: -43.9707146 },
  { cod: "5124", reg: "NOROESTE", tipo: "CENTRO DE SAUDE", nome: "ANEXO DO CENTRO DE SAUDE PADRE EUSTAQUIO", lat: -19.9197968, lng: -43.9795791 },
  { cod: "5150", reg: "NOROESTE", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO NOROESTE", lat: -19.9045098, lng: -43.9475017 },
  { cod: "5151", reg: "NOROESTE", tipo: "CMS", nome: "COMPLEXO MUNICIPAL DE ATENÇAO A SAUDE E EDUCAÇAO DO SUS", lat: -19.9150632, lng: -43.9685985 },
  { cod: "5160", reg: "NOROESTE", tipo: "GERENCIA ZOONOSES", nome: "GERENCIA DE ZOONOSES NOROESTE", lat: -19.913847, lng: -43.9464562 },
  { cod: "5161", reg: "NOROESTE", tipo: "ZOONOSES", nome: "CASA DE APOIO A ZOONOSES E LEISHMANIOSE - PINDORAMA", lat: -19.909792, lng: -44.0219735 },
  { cod: "5170", reg: "NOROESTE", tipo: "CRE", nome: "CENTRO DE REFERENCIA ESPORTIVO PARA PORTADORES DE DEFICIENCIA", lat: -19.9146585, lng: -43.9523558 },
  { cod: "5190", reg: "NOROESTE", tipo: "CIAME", nome: "CENTRO INTEGRADO DE ATENDIMENTO AO MENOR PINDORAMA", lat: -19.9103522, lng: -44.0204789 },
  { cod: "5192", reg: "NOROESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA  SOCIAL VILA SENHOR DOS PASSOS", lat: -19.9058688, lng: -43.9486778 },
  { cod: "5193", reg: "NOROESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA  SOCIAL VILA COQUEIRAL", lat: -19.916133, lng: -44.0248321 },
  { cod: "5195", reg: "NOROESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA  SOCIAL VILA SUMARE", lat: -19.8902655, lng: -43.9645567 },
  { cod: "5201", reg: "NOROESTE", tipo: "CENTRAL DE ESTERILIZAÇAO", nome: "CENTRAL DE ESTERILIZAÇAO NOROESTE", lat: -19.9151287, lng: -43.9707146 },
  { cod: "5202", reg: "NOROESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL CALIFORNIA", lat: -19.9190633, lng: -44.007875 },
  { cod: "5203", reg: "NOROESTE", tipo: "CENTRAL DE ESTERILIZAÇAO/ZOONOSES", nome: "CENTRAL DE ESTERILIZAÇAO DE CAES E GATOS NOROESTE", lat: -19.9122804, lng: -43.9741519 },
  { cod: "5204", reg: "NOROESTE", tipo: "CENTRO POP", nome: "CENTRO DE REFERENCIA DE ATENDIMENTO A POP. DE - CENTRO POP CENTRO SUL", lat: -19.9181153, lng: -43.948651 },
  { cod: "5205", reg: "NOROESTE", tipo: "CERSAMI", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL INFANTO-JUVENIL NOROESTE", lat: -19.9148899, lng: -43.969358 },
  { cod: "5207", reg: "NOROESTE", tipo: "CRIA", nome: "CENTRO DE REFERENCIA A INFANCIA E ADOLESCENCIA NOROESTE", lat: -19.9149762, lng: -43.9702862 },
  { cod: "5208", reg: "NOROESTE", tipo: "UNIDADE DE ACOLHIMENTO", nome: "UNIDADE DE ACOLHIMENTO LAR TIA BRANCA", lat: -19.9057372, lng: -43.9623437 },
  { cod: "5209", reg: "NOROESTE", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL NOROESTE", lat: -19.915263, lng: -43.9696732 },
  { cod: "5210", reg: "NOROESTE", tipo: "CMO", nome: "CENTRO MUNICIPAL DE OFTALMOLOGIA", lat: -19.9150633, lng: -43.9685985 },
  { cod: "5212", reg: "NOROESTE", tipo: "CONSELHO TUTELAR", nome: "CONSELHO TUTELAR NOROESTE", lat: -19.9138469, lng: -43.9464562 },
  { cod: "5213", reg: "NOROESTE", tipo: "BIBLIOTECA", nome: "CENTRO CULTURAL LIBERALINO ALVES DE OLIVEIRA", lat: -19.9047204, lng: -43.945256 },
  { cod: "5215", reg: "NOROESTE", tipo: "PRODABEL", nome: "EMPRESA DE INFORMATICA E INFORMACAO DO MUNICIPIO DE BELO HORIZONTE", lat: -19.8954639, lng: -43.9658565 },
  { cod: "5216", reg: "NOROESTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL PADRE EUSTAQUIO", lat: -19.9148669, lng: -43.9886694 },
  { cod: "5217", reg: "NOROESTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL LIBERALINO ALVES DE OLIVEIRA", lat: -19.9047204, lng: -43.945256 },
  { cod: "5219", reg: "NOROESTE", tipo: "FARMACIA", nome: "FARMACIA REGIONAL NOROESTE", lat: -19.9151287, lng: -43.9707146 },
  { cod: "5220", reg: "NOROESTE", tipo: "CARE", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL NOROESTE", lat: -19.913847, lng: -43.9464562 },
  { cod: "5221", reg: "NOROESTE", tipo: "GERAT", nome: "GERENCIA REGIONAL DE ATENDIMENTO AO CIDADAO NOROESTE", lat: -19.913847, lng: -43.9464562 },
  { cod: "5224", reg: "NOROESTE", tipo: "GERENCIA", nome: "BANCO DE ALIMENTOS", lat: -19.9178658, lng: -43.9768285 },
  { cod: "5230", reg: "NOROESTE", tipo: "HOSPITAL", nome: "HOSPITAL METROPOLITANO ODILON BEHRENS", lat: -19.90476, lng: -43.9463163 },
  { cod: "5231", reg: "NOROESTE", tipo: "SAMU", nome: "SERVICO DE ATENDIMENTO MOVEL DE URGENCIA E TRANSPORTE EM SAUDE", lat: -19.9278578, lng: -43.9906481 },
  { cod: "5233", reg: "NOROESTE", tipo: "DRAS", nome: "DIRETORIA REGIONAL DE ASSISTENCIA SOCIAL NOROESTE", lat: -19.9138469, lng: -43.9464562 },
  { cod: "5240", reg: "NOROESTE", tipo: "DIRE", nome: "DIRETORIA REGIONAL DE EDUCACAO NOROESTE", lat: -19.9138469, lng: -43.9464562 },
  { cod: "5247", reg: "NOROESTE", tipo: "GERENCIA", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA NOROESTE", lat: -19.8944064, lng: -43.9657463 },
  { cod: "5248", reg: "NOROESTE", tipo: "GERMA", nome: "GERENCIA REGIONAL DE MANUTENCAO NOROESTE", lat: -19.8944064, lng: -43.9657463 },
  { cod: "5265", reg: "NOROESTE", tipo: "GCMBH", nome: "GERENCIA DE DEPARTAMENTO DE MISSOES ESPECIAIS", lat: -19.9220843, lng: -43.9833032 },
  { cod: "5267", reg: "NOROESTE", tipo: "GERENCIA/GRAFICA", nome: "GERENCIA DE SERVICOS GRAFICOS E REPOGRAFIA (GRAFICA PBH)", lat: -19.9107178, lng: -43.9674045 },
  { cod: "5268", reg: "NOROESTE", tipo: "DIRETORIA", nome: "DIRETORIA DE DESTINAÇAO FINAL DE RESIDUOS", lat: -19.9230595, lng: -44.0181283 },
  { cod: "5269", reg: "NOROESTE", tipo: "GERENCIA", nome: "GERENCIA DE ASSISTENCIA EPIDEMIOLOGIA E REGULAÇAO NOROESTE", lat: -19.913847, lng: -43.9464562 },
  { cod: "5270", reg: "NOROESTE", tipo: "GERENCIA", nome: "GERENCIA VIGILANCIA SANITARIA NOROESTE", lat: -19.913847, lng: -43.9464562 },
  { cod: "5276", reg: "NOROESTE", tipo: "LABORATORIO", nome: "LABORATORIO MUNICIPAL DE REFERENCIA DE ANALISES CLINICAS E CITOPATOLOGIA", lat: -19.9150633, lng: -43.9685985 },
  { cod: "5278", reg: "NOROESTE", tipo: "LABORATORIO", nome: "LABORATORIO REGIONAL NOROESTE", lat: -19.9151287, lng: -43.9707146 },
  { cod: "5279", reg: "NOROESTE", tipo: "LAVANDERIA", nome: "LAVANDERIA MUNICIPAL", lat: -19.9234682, lng: -44.0000364 },
  { cod: "5280", reg: "NOROESTE", tipo: "MERCADO", nome: "MERCADO DA LAGOINHA", lat: -19.9047204, lng: -43.945256 },
  { cod: "5285", reg: "NOROESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL PEDREIRA PRADO LOPES", lat: -19.9035114, lng: -43.9474314 },
  { cod: "5286", reg: "NOROESTE", tipo: "CRPI", nome: "CENTRO DE REFERENCIA DA PESSOA IDOSA", lat: -19.9122422, lng: -43.9728773 },
  { cod: "5287", reg: "NOROESTE", tipo: "ABRIGO", nome: "ABRIGO FABIO ALVES DOS SANTOS", lat: -19.9180748, lng: -43.9600421 },
  { cod: "5291", reg: "NOROESTE", tipo: "URPV", nome: "URPV DA PAZ", lat: -19.8979178, lng: -43.9622013 },
  { cod: "5292", reg: "NOROESTE", tipo: "ALMOXARIFADO", nome: "SETOR DE ALMOXARIFADO", lat: -19.928238, lng: -43.9892436 },
  { cod: "5293", reg: "NOROESTE", tipo: "URPV", nome: "URPV DELTA", lat: -19.9298532, lng: -43.9932749 },
  { cod: "5295", reg: "NOROESTE", tipo: "URPV", nome: "URPV PINDORAMA", lat: -19.9103721, lng: -44.0150326 },
  { cod: "5297", reg: "NOROESTE", tipo: "CEVAE", nome: "CEVAE COQUEIROS", lat: -19.8983664, lng: -44.0226897 },
  { cod: "5298", reg: "NOROESTE", tipo: "CENTRO POLIESPORTIVO", nome: "CENTRO POLIESPORTIVO DOM BOSCO", lat: -19.9122863, lng: -44.0000174 },
  { cod: "5299", reg: "NOROESTE", tipo: "CASA DO IDOSO", nome: "CASA TRANSITORIA DO IDOSO", lat: -19.912357, lng: -43.9996281 },
  { cod: "5300", reg: "NOROESTE", tipo: "CASA DO IDOSO", nome: "CENTRO DIA DO IDOSO DOM CABRAL", lat: -19.9239987, lng: -43.9994786 },
  { cod: "5305", reg: "NOROESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE CALIFORNIA", lat: -19.9205282, lng: -44.0072149 },
  { cod: "5306", reg: "NOROESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE MERCADO DA LAGOINHA", lat: -19.9047204, lng: -43.945256 },
  { cod: "5307", reg: "NOROESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE CENTRO DE REFERENCIA DO IDOSO", lat: -19.9120626, lng: -43.9729422 },
  { cod: "5308", reg: "NOROESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE ERMELINDA", lat: -19.8887875, lng: -43.9601787 },
  { cod: "5309", reg: "NOROESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE FAZENDINHA", lat: -19.8983764, lng: -44.0217407 },
  { cod: "5310", reg: "NOROESTE", tipo: "PRAÇA", nome: "PRAÇA SAO VICENTE DE PAULO", lat: -19.9136497, lng: -43.9930144 },
  { cod: "5311", reg: "NOROESTE", tipo: "PRAÇA", nome: "PRAÇA JOSE AUGUSTO DIAS COSTA", lat: -19.8990887, lng: -43.9617423 },
  { cod: "5312", reg: "NOROESTE", tipo: "PRAÇA", nome: "PRAÇA TRES MIL NOVECENTOS E SESSENTA E CINCO", lat: -19.9073545, lng: -43.9473633 },
  { cod: "5313", reg: "NOROESTE", tipo: "PRAÇA", nome: "PRAÇA PROFESSOR JOSE AMERICANO", lat: -19.9047475, lng: -43.9707353 },
  { cod: "5315", reg: "NOROESTE", tipo: "PRAÇA", nome: "PRAÇA BERNARDO DA VEIGA", lat: -19.8835205, lng: -43.9582735 },
  { cod: "5316", reg: "NOROESTE", tipo: "FEIRA", nome: "FEIRA COBERTA DO PADRE EUSTAQUIO", lat: -19.914416, lng: -43.9886357 },
  { cod: "5317", reg: "NOROESTE", tipo: "CASA DE PASSAGEM", nome: "CASA DE PASSAGEM VILA EUNICE", lat: -19.9033762, lng: -44.0145478 },
  { cod: "5318", reg: "NOROESTE", tipo: "GALPAO", nome: "GALPAO DE ARMAZENAMENTO DA PRODABEL", lat: -19.8956739, lng: -43.9673936 },
  { cod: "5330", reg: "NOROESTE", tipo: "GCMBH", nome: "GUARDA CIVIL MUNICIPAL DE BELO HORIZONTE - SEGUNDA INSPETORIA", lat: -19.9079823, lng: -43.9618356 },
  { cod: "5331", reg: "NOROESTE", tipo: "ATERRO SANITARIO", nome: "CENTRAL DE TRATAMENTO DE RESIDUOS SOLIDOS DA SLU", lat: -19.9230595, lng: -44.0181283 },
  { cod: "5332", reg: "NOROESTE", tipo: "EMEI", nome: "EMEI PEDRO LESSA", lat: -19.9041071, lng: -43.9505658 },
  { cod: "5334", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA DA AVENIDA AVAI", lat: -19.9189157, lng: -44.007847 },
  { cod: "5335", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA DO CAMPO HUMAITA", lat: -19.9208473, lng: -43.9834135 },
  { cod: "5336", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA DO CAMPO SANTO ANDRE", lat: -19.9027622, lng: -43.956594 },
  { cod: "5337", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO CANTEIRO CENTRAL DA AVENIDA AMINTAS JACQUES DE MORAES", lat: -19.9071079, lng: -44.0169472 },
  { cod: "5338", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO CENTRO DE REFERENCIA DA PESSOA IDOSA", lat: -19.9118826, lng: -43.9720798 },
  { cod: "5339", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA IVAI", lat: -19.9145444, lng: -43.9962896 },
  { cod: "5340", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA AMERICO VESPUCIO", lat: -19.8875002, lng: -43.954343 },
  { cod: "5341", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA AVAI", lat: -19.9151344, lng: -44.0038151 },
  { cod: "5342", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA DOS CLARINS", lat: -19.9238294, lng: -44.0066723 },
  { cod: "5343", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA PRESIDENTE JUSCELINO KUBITSCHEK", lat: -19.9243432, lng: -43.9854125 },
  { cod: "5344", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA CORONEL ASCENDINO COSTA", lat: -19.8902642, lng: -43.9657613 },
  { cod: "5345", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA PARANAIBA", lat: -19.8933742, lng: -43.950949 },
  { cod: "5346", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO ESPACO ESPORTIVO DOM BOSCO", lat: -19.9120714, lng: -43.999903 },
  { cod: "5347", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO FEIRA COBERTA DO PADRE EUSTAQUIO", lat: -19.9144759, lng: -43.9891991 },
  { cod: "5348", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PARQUE MARIA DO SOCORRO", lat: -19.9121699, lng: -43.987697 },
  { cod: "5349", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ADALMO PASSOS", lat: -19.9119504, lng: -44.0190923 },
  { cod: "5350", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA AUGUSTO DIAS COSTA", lat: -19.8990458, lng: -43.9616908 },
  { cod: "5351", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA BERNARDO DA VEIGA", lat: -19.8833928, lng: -43.9582305 },
  { cod: "5352", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA CHUI", lat: -19.9270034, lng: -44.0015317 },
  { cod: "5353", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DO CONJUNTO IAPI", lat: -19.9022096, lng: -43.9467363 },
  { cod: "5354", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA EM FRENTE A IGREJA SAO MIGUEL", lat: -19.9112283, lng: -44.0218687 },
  { cod: "5355", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ITAJU", lat: -19.9105499, lng: -44.0243889 },
  { cod: "5356", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA MADECAUS", lat: -19.8848261, lng: -43.9614766 },
  { cod: "5357", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA MARECHAL ZENOBIO", lat: -19.890785, lng: -44.0156579 },
  { cod: "5358", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ORLANDO SILVA", lat: -19.9145444, lng: -43.9962896 },
  { cod: "5359", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA PROFESSOR JOSE AMERICANO", lat: -19.9044705, lng: -43.970721 },
  { cod: "5360", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA RAMATIS", lat: -19.8908799, lng: -43.9522641 },
  { cod: "5361", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA TEJO", lat: -19.9121699, lng: -43.987697 },
  { cod: "5362", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO QUADRA DE ESPORTE BECO 21", lat: -19.9066188, lng: -43.9490783 },
  { cod: "5363", reg: "NOROESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO SAO FRANCISCO DAS CHAGAS", lat: -19.9123379, lng: -43.9601078 },
  { cod: "5364", reg: "NOROESTE", tipo: "ALBERGUE", nome: "ALBERGUE LAR ESPERANCA", lat: -19.9012421, lng: -43.9558139 },
  { cod: "5366", reg: "NOROESTE", tipo: "PRAÇA", nome: "PRAÇA CORONEL GUILHERME VAZ DE MELO", lat: -19.9106315, lng: -43.9419808 },
  { cod: "5367", reg: "NOROESTE", tipo: "CIAM", nome: "CENTRO INTEGRADO DE ATENDIMENTO A MULHER", lat: -19.9063918, lng: -43.9453411 },
  { cod: "5368", reg: "NOROESTE", tipo: "CASA DE PASSAGEM", nome: "CASA DE PASSAGEM ESPERANCA I", lat: -19.8898752, lng: -44.0125292 },
  { cod: "5369", reg: "NOROESTE", tipo: "PISTA", nome: "PRAÇA DOS ESPORTES", lat: -19.9243197, lng: -43.9858023 },
  { cod: "5370", reg: "NOROESTE", tipo: "CREAB", nome: "CENTRO DE REFERENCIA EM REABILITACAO NOROESTE", lat: -19.9151287, lng: -43.9707146 },
  { cod: "ET22", reg: "NOROESTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE HOSP. ODILON BEHRENS", lat: -19.9041593, lng: -43.9445486 },
  { cod: "G062", reg: "NOROESTE", tipo: "CODAFE", nome: "CODAFE 2ª INSPETORIA", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G157", reg: "NOROESTE", tipo: "EQUIPE", nome: "EQUIPE FERISTA 2ª INSPETORIA", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G158", reg: "NOROESTE", tipo: "APOIO", nome: "APOIO 2ª INSPETORIA", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G175", reg: "NOROESTE", tipo: "SUOPE", nome: "SUOPE 2", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G516", reg: "NOROESTE", tipo: "GPU", nome: "GRUPAMENTO DE PATRULHAMENTO UPA MACRO II", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G517", reg: "NOROESTE", tipo: "GPU", nome: "GPU 2ª INSPETORIA - A", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G518", reg: "NOROESTE", tipo: "GPU", nome: "GPU 2ª INSPETORIA - B", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G520", reg: "NOROESTE", tipo: "COORDENADORIA", nome: "COORDENADORIA REGIONAL 5", lat: -19.912, lng: -43.950 },
  { cod: "G522", reg: "NOROESTE", tipo: "SUOPE", nome: "SUOPE NOROESTE / OESTE", lat: -19.912, lng: -43.950 },
  { cod: "G524", reg: "NOROESTE", tipo: "FISCOPE", nome: "FISCOPE NOROESTE", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G525", reg: "NOROESTE", tipo: "GETMO", nome: "GETMO NOROESTE", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G526", reg: "NOROESTE", tipo: "RONDA", nome: "RONDA MOVE (TRECHO 2)", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G528", reg: "NOROESTE", tipo: "GPE", nome: "GPE - NO", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G535", reg: "NOROESTE", tipo: "LICENÇA", nome: "LICENÇA MÉDICA 2ª INSPETORIA", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G536", reg: "NOROESTE", tipo: "SUS", nome: "PATRULHA SUS NOROESTE", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G552", reg: "NOROESTE", tipo: "SEGURANÇA", nome: "SEGURANÇA BASE MACRO II", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G556", reg: "NOROESTE", tipo: "PROTOCOLO", nome: "PROTOCOLO GMBH MACRO II", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G559", reg: "NOROESTE", tipo: "INTENDENCIA", nome: "INTENDÊNCIA 2ª INSPETORIA", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G560", reg: "NOROESTE", tipo: "TRANSPORTE", nome: "COORDENADORIA DE TRANSPORTE 2ª INSPETORIA", lat: -19.8944064, lng: -43.9657463 },
  { cod: "G563", reg: "NOROESTE", tipo: "ESPECIALIZADAS", nome: "EQUIPE FISCALIZA BH NOROESTE", lat: -19.9138469, lng: -43.9464562 },
  { cod: "G566", reg: "NOROESTE", tipo: "APOIO", nome: "GRUPAMENTO DE APOIO PREVENTIVO NOROESTE", lat: -19.9208887, lng: -43.9830325 },

  // ... (Mocks for other regions to avoid empty map)
  { cod: "4001", reg: "NORDESTE", tipo: "ESCOLA", nome: "Escola M. Nordeste Mock 1", end: "RUA NE 1", num: "10", bairro: "UNIAO", lat: -19.875, lng: -43.925 },
  { cod: "8001", reg: "PAMPULHA", tipo: "ESCOLA", nome: "Escola M. Pampulha Mock 1", end: "RUA PAMPULHA 1", num: "10", bairro: "SANTA AMELIA", lat: -19.866, lng: -43.970 },
];

// --- Mapeamento Correto ---

export const mapRawToProprio = (data: any): Proprio => {
  let lat = 0;
  let lng = 0;

  // 1. Se tiver coordenada real (GPS Exato), usa
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