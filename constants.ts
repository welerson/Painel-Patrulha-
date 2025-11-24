
import { Proprio, RoutePoint } from './types';

// Version control to force update
export const DB_VERSION = "2.1-FINAL-CORRECTED";

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
  "TUPI": { lat: -19.835, lng: -43.920 }
};

// DADOS COMPLETOS
const RAW_DATA: any[] = [
  // --- NORTE (GPS REAL) ---
  { cod: "4283", reg: "NORDESTE", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS/MOVE/METROPOLITANO SAO GABRIEL", lat: -19.8632747, lng: -43.9264397 },
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

  // --- BARREIRO (GPS REAL) ---
  { cod: "1001", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL AIRES DA MATA MACHADO", lat: -19.9940697, lng: -44.034994 },
  { cod: "1002", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANA ALVES TEIXEIRA", lat: -19.9990917, lng: -44.00669 },
  { cod: "1003", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANTONIO ALEIXO", lat: -19.9735033, lng: -44.0138383 },
  { cod: "1004", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANTONIO MOURAO GUIMARAES", lat: -20.001513, lng: -44.0024825 },
  { cod: "1005", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ANTONIO SALLES BARBOSA", lat: -19.9843028, lng: -44.045529 },
  { cod: "1006", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL AURELIO BUARQUE DE HOLANDA", lat: -19.9771125, lng: -44.0580069 },
  { cod: "1007", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL CIAC LUCAS MONTEIRO MACHADO", lat: -19.9999321, lng: -44.0265396 },
  { cod: "1008", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL CONEGO SEQUEIRA", lat: -20.0231316, lng: -44.0294385 },
  { cod: "1009", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DINORAH MAGALHAES FABRI", lat: -19.9940478, lng: -43.9905986 },
  { cod: "1010", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DULCE MARIA HOMEM", lat: -19.9948765, lng: -44.0127769 },
  { cod: "1011", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL EDITH PIMENTA DA VEIGA", lat: -19.996237, lng: -44.0313665 },
  { cod: "1012", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ELOY HERALDO LIMA", lat: -20.0048856, lng: -44.0415678 },
  { cod: "1013", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL HELENA ANTIPOFF", lat: -19.9905536, lng: -44.0451666 },
  { cod: "1014", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL JONAS BARCELLOS CORREA", lat: -20.0155031, lng: -44.0298661 },
  { cod: "1015", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL LUIZ GATTI", lat: -19.9820836, lng: -44.0261995 },
  { cod: "1016", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL LUIZ GONZAGA JUNIOR", lat: -20.0086472, lng: -44.0322619 },
  { cod: "1017", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PADRE FLAVIO GIAMMETTA", lat: -19.9777467, lng: -44.0273211 },
  { cod: "1018", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PEDRO ALEIXO", lat: -19.9939721, lng: -44.0020563 },
  { cod: "1019", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PEDRO NAVA", lat: -19.9995205, lng: -43.9666311 },
  { cod: "1020", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR HILTON ROCHA", lat: -20.012919, lng: -44.0374242 },
  { cod: "1021", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI PROFESSOR JOSE BRAZ", lat: -19.9713961, lng: -44.0185479 },
  { cod: "1022", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR MELLO CANCADO", lat: -19.9810643, lng: -44.0531442 },
  { cod: "1023", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSORA ISAURA SANTOS", lat: -19.9893056, lng: -44.0091074 },
  { cod: "1024", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SEBASTIAO GUILHERME DE OLIVEIRA", lat: -19.9894889, lng: -44.029872 },
  { cod: "1025", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL UNIAO COMUNITARIA", lat: -20.0004243, lng: -44.0145011 },
  { cod: "1026", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DA VILA PINHO", lat: -20.0034861, lng: -44.0233127 },
  { cod: "1027", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL VINICIUS DE MORAES", lat: -19.9900047, lng: -44.0391204 },
  { cod: "1028", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PRESIDENTE ITAMAR FRANCO", lat: -20.0123117, lng: -44.0266079 },
  { cod: "1029", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SOLAR RUBI", lat: -20.0115024, lng: -44.0143763 },
  { cod: "1030", reg: "BARREIRO", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL POLO DE EDUCAÇAO INTEGRADA", lat: -19.9961129, lng: -44.0058855 },
  { cod: "1061", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI LUCAS MONTEIRO MACHADO", lat: -19.9993565, lng: -44.0272142 },
  { cod: "1062", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI SOLAR RUBI", lat: -20.0103109, lng: -44.0147866 },
  { cod: "1063", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI TIROL", lat: -19.9944887, lng: -44.0351712 },
  { cod: "1064", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI MALDONADO", lat: -19.983958, lng: -44.0243478 },
  { cod: "1065", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI CARDOSO", lat: -20.0012401, lng: -44.0027675 },
  { cod: "1066", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI JATOBA IV", lat: -20.0046256, lng: -44.036289 },
  { cod: "1068", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI PILAR OLHOS D´AGUA", lat: -19.9995955, lng: -43.9711123 },
  { cod: "1069", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI SOL NASCENTE", lat: -19.9770279, lng: -43.9944889 },
  { cod: "1070", reg: "BARREIRO", tipo: "EMEI", nome: "EMEI JOSE ISIDORO FILHO", lat: -19.9934177, lng: -43.9899 },
  { cod: "1071", reg: "BARREIRO", tipo: "EMEI AGUAS CLARAS", lat: -20.0113284, lng: -44.0227523 },
  { cod: "1072", reg: "BARREIRO", tipo: "EMEI MANGUEIRAS", lat: -20.0124515, lng: -44.0370576 },
  { cod: "1073", reg: "BARREIRO", tipo: "EMEI MIRAMAR", lat: -19.99477, lng: -44.0122204 },
  { cod: "1075", reg: "BARREIRO", tipo: "EMEI DIAMANTE", lat: -19.9968183, lng: -44.0193742 },
  { cod: "1077", reg: "BARREIRO", tipo: "EMEI PETROPOLIS", lat: -20.0127804, lng: -44.0275568 },
  { cod: "1078", reg: "BARREIRO", tipo: "EMEI SOLAR URUCUIA", lat: -20.0099657, lng: -44.0093866 },
  { cod: "1079", reg: "BARREIRO", tipo: "EMEI BAIRRO DAS INDUSTRIAS", lat: -19.9658415, lng: -44.0005786 },
  { cod: "1080", reg: "BARREIRO", tipo: "EMEI BARREIRO", lat: -19.9806637, lng: -44.0111104 },
  { cod: "1081", reg: "BARREIRO", tipo: "EMEI ITAIPU", lat: -19.9950028, lng: -44.0431999 },
  { cod: "1082", reg: "BARREIRO", tipo: "EMEI LINDEIA", lat: -19.9772099, lng: -44.0512917 },
  { cod: "1100", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BAIRRO DAS INDUSTRIAS", lat: -19.963648, lng: -44.0008818 },
  { cod: "1101", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BARREIRO - CARLOS RENATO DIAS", lat: -19.9756561, lng: -44.0226573 },
  { cod: "1103", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BARREIRO DE CIMA", lat: -19.9958176, lng: -44.0052423 },
  { cod: "1104", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BONSUCESSO", lat: -19.9871417, lng: -43.9888727 },
  { cod: "1105", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE DIAMANTE - TEIXEIRA DIAS", lat: -19.9919205, lng: -44.0159339 },
  { cod: "1106", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE INDEPENDENCIA", lat: -20.0197906, lng: -44.0315046 },
  { cod: "1107", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ITAIPU - JATOBA", lat: -19.9962467, lng: -44.0484536 },
  { cod: "1108", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE LINDEIA - MARIA MADALENA TEODORO", lat: -19.9791706, lng: -44.0466863 },
  { cod: "1109", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MANGUEIRAS", lat: -20.013883, lng: -44.030918 },
  { cod: "1110", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MILIONARIOS", lat: -19.9811138, lng: -43.9992947 },
  { cod: "1111", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MIRAMAR - EDUARDO MAURO DE ARAUJO", lat: -19.9976211, lng: -44.0116343 },
  { cod: "1112", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PILAR - OLHOS DAGUA", lat: -19.9996512, lng: -43.9669155 },
  { cod: "1113", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTA CECILIA", lat: -19.9996089, lng: -44.0327123 },
  { cod: "1114", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE TIROL - FRANCISCO GOMES BARBOSA", lat: -19.9851687, lng: -44.0354666 },
  { cod: "1115", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE LISANDRA ANGELICA DAVID JUSTINO - TUNEL DE IBIRITE", lat: -19.9880033, lng: -44.0465155 },
  { cod: "1116", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE URUCUIA", lat: -20.0096024, lng: -44.0081478 },
  { cod: "1117", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VALE DO JATOBA", lat: -20.0102569, lng: -44.0362125 },
  { cod: "1118", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VILA CEMIG", lat: -19.9979283, lng: -43.992439 },
  { cod: "1119", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VILA PINHO", lat: -20.0007951, lng: -44.0262291 },
  { cod: "1120", reg: "BARREIRO", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE REGINA", lat: -19.9825551, lng: -44.0547504 },
  { cod: "1150", reg: "BARREIRO", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO BARREIRO", lat: -19.9959269, lng: -44.0201514 },
  { cod: "1160", reg: "BARREIRO", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL BARREIRO", lat: -19.9735499, lng: -44.0143017 },
  { cod: "1161", reg: "BARREIRO", tipo: "CERSAMAD", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL ALCOOL E DROGAS BARREIRO", lat: -19.9984003, lng: -44.0064395 },
  { cod: "1162", reg: "BARREIRO", tipo: "UNIDADE DE ACOLHIMENTO", nome: "UNIDADE DE ACOLHIMENTO ADULTO CASA DA TRAVESSIA", lat: -20.0058662, lng: -44.0104405 },
  { cod: "1170", reg: "BARREIRO", tipo: "CEM", nome: "CENTRO DE ESPECIALIDADES MEDICAS BARREIRO", lat: -19.9958176, lng: -44.0052423 },
  { cod: "1171", reg: "BARREIRO", tipo: "CREAB", nome: "CENTRO DE REFERENCIA EM REABILITAçAO BARREIRO", lat: -19.995755, lng: -44.00496 },
  { cod: "1180", reg: "BARREIRO", tipo: "CERSAT", nome: "CENTRO DE REFERENCIA EM SAUDE DO TRABALHADOR BARREIRO", lat: -19.9779653, lng: -44.0134124 },
  { cod: "1190", reg: "BARREIRO", tipo: "CEO", nome: "CENTRO DE ESPECIALIDADES ODONTOLOGICAS BARREIRO", lat: -19.9958176, lng: -44.0052423 },
  { cod: "1200", reg: "BARREIRO", tipo: "FARMACIA", nome: "FARMACIA REGIONAL BARREIRO", lat: -19.9958176, lng: -44.0052423 },
  { cod: "1210", reg: "BARREIRO", tipo: "GCMBH", nome: "GUARDA CIVIL MUNICIPAL - INSPETORIA REGIONAL BARREIRO", lat: -20.0079859, lng: -44.0087414 },
  { cod: "1233", reg: "BARREIRO", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS BARREIRO", lat: -19.9735562, lng: -44.0201585 },
  { cod: "1234", reg: "BARREIRO", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS DIAMANTE", lat: -19.9942954, lng: -44.0240108 },
  { cod: "1350", reg: "BARREIRO", tipo: "RESTAURANTE", nome: "RESTAURANTE POPULAR DOM MAURO BASTOS", lat: -19.9761133, lng: -44.023685 },
  { cod: "1438", reg: "BARREIRO", tipo: "CENTRO POLIESPORTIVO", nome: "CENTRO ESPORTIVO VALE DO JATOBA - CESVJ", lat: -20.0080228, lng: -44.0347673 },

  // --- VENDA NOVA (GPS REAL) ---
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

  // --- OESTE (GPS REAL) ---
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
