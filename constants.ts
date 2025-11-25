import { Proprio, RoutePoint } from './types';

// Version control to force update
export const DB_VERSION = "3.0-FULL-DATA-LESTE";

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
  // --- LESTE (GPS REAL - 156 REGISTROS) ---
  { cod: "3001", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL EMIDIO BERUTTO", lat: -19.8801599, lng: -43.9110276 },
  { cod: "3002", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL FERNANDO DIAS COSTA", lat: -19.9196589, lng: -43.8778978 },
  { cod: "3003", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL GEORGE RICARDO SALUM", lat: -19.9186433, lng: -43.8877613 },
  { cod: "3004", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL ISRAEL PINHEIRO", lat: -19.911372, lng: -43.8896368 },
  { cod: "3005", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL LEVINDO LOPES", lat: -19.9234386, lng: -43.9046582 },
  { cod: "3007", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL MONSENHOR JOAO RODRIGUES DE OLIVEIRA", lat: -19.8981604, lng: -43.8972112 },
  { cod: "3008", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PADRE FRANCISCO CARVALHO MOREIRA", lat: -19.8993181, lng: -43.9037889 },
  { cod: "3009", reg: "LESTE", tipo: "EMEI", nome: "EMEI PROFESSORA MARILIA TANURE PEREIRA", lat: -19.9020426, lng: -43.9051264 },
  { cod: "3011", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR DOMICIANO VIEIRA", lat: -19.9027944, lng: -43.9158332 },
  { cod: "3012", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSOR LOURENCO DE OLIVEIRA", lat: -19.9132542, lng: -43.9111927 },
  { cod: "3013", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL PROFESSORA ALCIDA TORRES", lat: -19.9164219, lng: -43.8842742 },
  { cod: "3014", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SANTOS DUMONT", lat: -19.9223825, lng: -43.9116856 },
  { cod: "3015", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL SAO RAFAEL", lat: -19.9137492, lng: -43.9066101 },
  { cod: "3016", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL WLADIMIR DE PAULA GOMES", lat: -19.8992303, lng: -43.8905861 },
  { cod: "3019", reg: "LESTE", tipo: "ESCOLA", nome: "ESCOLA MUNICIPAL DOUTOR JULIO SOARES", lat: -19.907657, lng: -43.8835283 },
  { cod: "3061", reg: "LESTE", tipo: "EMEI", nome: "EMEI CAETANO FURQUIM", lat: -19.8990862, lng: -43.8896978 },
  { cod: "3062", reg: "LESTE", tipo: "EMEI", nome: "EMEI GRANJA DE FREITAS", lat: -19.9086102, lng: -43.8845785 },
  { cod: "3063", reg: "LESTE", tipo: "EMEI", nome: "EMEI TAQUARIL", lat: -19.9219855, lng: -43.8814892 },
  { cod: "3064", reg: "LESTE", tipo: "EMEI", nome: "EMEI PARAISO", lat: -19.9181183, lng: -43.9049914 },
  { cod: "3065", reg: "LESTE", tipo: "EMEI", nome: "EMEI ALTO VERA CRUZ", lat: -19.9180498, lng: -43.8882021 },
  { cod: "3066", reg: "LESTE", tipo: "EMEI", nome: "EMEI BALEIA", lat: -19.9210126, lng: -43.8993128 },
  { cod: "3067", reg: "LESTE", tipo: "EMEI", nome: "EMEI POMPEIA", lat: -19.9166234, lng: -43.9032265 },
  { cod: "3068", reg: "LESTE", tipo: "EMEI", nome: "EMEI SAGRADA FAMILIA", lat: -19.9036727, lng: -43.9225225 },
  { cod: "3100", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE ALTO VERA CRUZ", lat: -19.9104894, lng: -43.8893905 },
  { cod: "3101", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE BOA VISTA", lat: -19.8923498, lng: -43.8971455 },
  { cod: "3102", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE GRANJA DE FREITAS", lat: -19.9086522, lng: -43.8848994 },
  { cod: "3103", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "ANEXO DO CENTRO DE SAUDE HORTO", lat: -19.9077616, lng: -43.9312503 },
  { cod: "3104", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE MARIANO DE ABREU", lat: -19.9009453, lng: -43.8867438 },
  { cod: "3105", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE NOVO HORIZONTE", lat: -19.9193184, lng: -43.877233 },
  { cod: "3106", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE PARAISO", lat: -19.9243904, lng: -43.9082817 },
  { cod: "3107", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE POMPEIA", lat: -19.9125141, lng: -43.9043777 },
  { cod: "3108", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAGRADA FAMILIA - MARCO ANTONIO DE MENEZES", lat: -19.9055617, lng: -43.9156235 },
  { cod: "3109", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SANTA INES", lat: -19.8877624, lng: -43.9062766 },
  { cod: "3110", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAO GERALDO", lat: -19.8967104, lng: -43.9022093 },
  { cod: "3111", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE SAO JOSE OPERARIO", lat: -19.8876521, lng: -43.8983525 },
  { cod: "3112", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE TAQUARIL", lat: -19.9183002, lng: -43.8878769 },
  { cod: "3113", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE VERA CRUZ", lat: -19.9119192, lng: -43.8964058 },
  { cod: "3114", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "CENTRO DE SAUDE HORTO", lat: -19.9130499, lng: -43.9204496 },
  { cod: "3115", reg: "LESTE", tipo: "CENTRO DE SAUDE", nome: "ANEXO DO CENTRO DE SAUDE TAQUARIL", lat: -19.9209575, lng: -43.8820843 },
  { cod: "3152", reg: "LESTE", tipo: "CEM", nome: "CENTRO DE ESPECIALIDADES MEDICAS LESTE", lat: -19.9081672, lng: -43.927929 },
  { cod: "3155", reg: "LESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL GRANJA DE FREITAS", lat: -19.9069359, lng: -43.8828904 },
  { cod: "3156", reg: "LESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL MARIANO DE ABREU", lat: -19.8959525, lng: -43.8901643 },
  { cod: "3157", reg: "LESTE", tipo: "CIAME", nome: "CENTRO INTEGRADO DE ATENDIMENTO AO MENOR FLAMENGO", lat: -19.9103645, lng: -43.8910548 },
  { cod: "3158", reg: "LESTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL SAO GERALDO", lat: -19.899086, lng: -43.8979238 },
  { cod: "3159", reg: "LESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA  SOCIAL TAQUARIL", lat: -19.9177258, lng: -43.8835348 },
  { cod: "3160", reg: "LESTE", tipo: "CENTRAL DE ESTERILIZAÇAO", nome: "CENTRAL DE ESTERILIZAÇAO LESTE", lat: -19.9081672, lng: -43.927929 },
  { cod: "3161", reg: "LESTE", tipo: "CENTRO CULTURAL", nome: "CENTRO CULTURAL ALTO VERA CRUZ", lat: -19.9146652, lng: -43.8893959 },
  { cod: "3163", reg: "LESTE", tipo: "CC", nome: "CENTRO DE CONVIVENCIA ARTHUR BISPO DO ROSARIO", lat: -19.9118348, lng: -43.9201237 },
  { cod: "3164", reg: "LESTE", tipo: "CREAS", nome: "CENTRO DE REFERENCIA ESPECIALIZADO DE ASSISTENCIA SOCIAL LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3165", reg: "LESTE", tipo: "COAS", nome: "CENTRO DE TESTAGEM E ACONSELHAMENTO SAGRADA FAMILIA", lat: -19.9078292, lng: -43.9278223 },
  { cod: "3166", reg: "LESTE", tipo: "CREAB", nome: "CENTRO DE REFERENCIA EM REABILITACAO LESTE", lat: -19.90764, lng: -43.9279863 },
  { cod: "3167", reg: "LESTE", tipo: "CREAR", nome: "CENTRO DE REFERENCIA EM AREA DE RISCO TAQUARIL", lat: -19.919028, lng: -43.8770193 },
  { cod: "3168", reg: "LESTE", tipo: "CERSAM", nome: "CENTRO DE REFERENCIA EM SAUDE MENTAL LESTE", lat: -19.912222, lng: -43.9113695 },
  { cod: "3170", reg: "LESTE", tipo: "CEVAE", nome: "CEVAE TAQUARIL", lat: -19.9087779, lng: -43.8859117 },
  { cod: "3171", reg: "LESTE", tipo: "CMAS", nome: "CONSELHO MUNICIPAL DE ASSISTENCIA SOCIAL", lat: -19.9170066, lng: -43.9173949 },
  { cod: "3173", reg: "LESTE", tipo: "CMDCA", nome: "CONSELHO MUNICIPAL DOS DIREITOS DA CRIANCA E DO ADOLESCENTE", lat: -19.9170066, lng: -43.9173949 },
  { cod: "3175", reg: "LESTE", tipo: "CONSELHO TUTELAR", nome: "CONSELHO TUTELAR LESTE", lat: -19.9105043, lng: -43.9028381 },
  { cod: "3176", reg: "LESTE", tipo: "CAC", nome: "CENTRO DE APOIO COMUNITARIO ESPLANADA", lat: -19.902057, lng: -43.9064229 },
  { cod: "3181", reg: "LESTE", tipo: "FARMACIA", nome: "FARMACIA REGIONAL LESTE", lat: -19.9078292, lng: -43.9278223 },
  { cod: "3186", reg: "LESTE", tipo: "DIRETORIA", nome: "DIRETORIA DE PLANEJAMENTO", lat: -19.9262341, lng: -43.9184085 },
  { cod: "3189", reg: "LESTE", tipo: "GERENCIA", nome: "GERENCIA DE ASSISTENCIA EPIDEMIOLOGIA E REGULAÇAO LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3191", reg: "LESTE", tipo: "DIRE", nome: "DIRETORIA REGIONAL DE EDUCACAO LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3192", reg: "LESTE", tipo: "GERENCIA", nome: "GERENCIA DE GESTAO DO TRABALHO", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3196", reg: "LESTE", tipo: "DRAS", nome: "DIRETORIA REGIONAL DE ASSISTENCIA SOCIAL LESTE", lat: -19.9142603, lng: -43.9208371 },
  { cod: "3197", reg: "LESTE", tipo: "DRES", nome: "DIRETORIA REGIONAL DE SAUDE LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3199", reg: "LESTE", tipo: "GERENCIA", nome: "GERENCIA  DE VIGILANCIA SANITARIA LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3200", reg: "LESTE", tipo: "CARE", nome: "COORDENADORIA DE ATENDIMENTO REGIONAL LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3201", reg: "LESTE", tipo: "GERAT", nome: "GERENCIA REGIONAL DE ATENDIMENTO AO CIDADAO LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3202", reg: "LESTE", tipo: "GERENCIA", nome: "GERENCIA REGIONAL DE LIMPEZA URBANA LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3205", reg: "LESTE", tipo: "GCMBH", nome: "GUARDA CIVIL MUNICIPAL DE BELO HORIZONTE - QUARTA INSPETORIA", lat: -19.9146478, lng: -43.9071642 },
  { cod: "3206", reg: "LESTE", tipo: "GERMA", nome: "GERENCIA REGIONAL DE MANUTENÇAO LESTE", lat: -19.9146478, lng: -43.9071642 },
  { cod: "3208", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA COMENDADOR NEGRAO DE LIMA", lat: -19.9106789, lng: -43.9304727 },
  { cod: "3217", reg: "LESTE", tipo: "CEMITERIO", nome: "CEMITERIO DA SAUDADE", lat: -19.9176709, lng: -43.9006446 },
  { cod: "3218", reg: "LESTE", tipo: "LABORATORIO", nome: "LABORATORIO REGIONAL LESTE-NORDESTE E CENTRO SUL-PAMPULHA", lat: -19.90764, lng: -43.9279863 },
  { cod: "3219", reg: "LESTE", tipo: "MERCADO", nome: "MERCADO DISTRITAL SANTA TEREZA", lat: -19.9135141, lng: -43.9115647 },
  { cod: "3220", reg: "LESTE", tipo: "CRAS", nome: "CENTRO DE REFERENCIA DE ASSISTENCIA SOCIAL ALTO VERA CRUZ", lat: -19.9150122, lng: -43.8895918 },
  { cod: "3221", reg: "LESTE", tipo: "HOSPITAL", nome: "UNIDADE HOSPITAL DIA CIRURGICO", lat: -19.9081672, lng: -43.927929 },
  { cod: "3222", reg: "LESTE", tipo: "PARQUE", nome: "PARQUE LINEAR DO VALE DO ARRUDAS", lat: -19.9005287, lng: -43.9009009 },
  { cod: "3223", reg: "LESTE", tipo: "PARQUE", nome: "PARQUE FLORESTAL ESTADUAL DA BALEIA", lat: -19.9254778, lng: -43.8942199 },
  { cod: "3235", reg: "LESTE", tipo: "SLU", nome: "SUPERINTENDENCIA DE LIMPEZA URBANA", lat: -19.9262341, lng: -43.9184085 },
  { cod: "3237", reg: "LESTE", tipo: "URS", nome: "UNIDADE DE REFERENCIA SECUNDARIA SAGRADA FAMILIA", lat: -19.9081672, lng: -43.927929 },
  { cod: "3238", reg: "LESTE", tipo: "URS", nome: "UNIDADE DE REFERENCIA SECUNDARIA SAUDADE", lat: -19.9040914, lng: -43.9060894 },
  { cod: "3239", reg: "LESTE", tipo: "ABRIGO", nome: "ABRIGO GRANJA DE FREITAS", lat: -19.9144137, lng: -43.8867633 },
  { cod: "3240", reg: "LESTE", tipo: "ABRIGO", nome: "ABRIGO POMPEIA", lat: -19.9138862, lng: -43.906315 },
  { cod: "3241", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA DUQUE DE CAXIAS", lat: -19.9160711, lng: -43.9177178 },
  { cod: "3243", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA LOUIS BRAILLE", lat: -19.9187186, lng: -43.9005743 },
  { cod: "3244", reg: "LESTE", tipo: "CENTRO DE APOIO A MULHER", nome: "CENTRO ESPECIALIZADO DE ATENDIMENTO A MULHER - BENVINDA", lat: -19.9173882, lng: -43.9259464 },
  { cod: "3245", reg: "LESTE", tipo: "CENTRO POLIESPORTIVO", nome: "BH CIDADANIA JOAO AMAZONAS", lat: -19.8952913, lng: -43.8904901 },
  { cod: "3246", reg: "LESTE", tipo: "REFEITORIO POPULAR", nome: "REFEITORIO POPULAR TAQUARIL", lat: -19.9195956, lng: -43.8806044 },
  { cod: "3247", reg: "LESTE", tipo: "QUALIFICARTE", nome: "CENTRO DE QUALIFICACAO PROFISSIONAL OPP MARIANO DE ABREU", lat: -19.8935337, lng: -43.8886888 },
  { cod: "3248", reg: "LESTE", tipo: "CENTRO DE OPORTUNIDADE", nome: "CENTRO DE OPORTUNIDADE CONJUNTO TAQUARIL", lat: -19.9202228, lng: -43.8755415 },
  { cod: "3249", reg: "LESTE", tipo: "UPA", nome: "UNIDADE DE PRONTO ATENDIMENTO LESTE", lat: -19.9055872, lng: -43.8967904 },
  { cod: "3250", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA PROFESSOR ALBERTO MAZONI", lat: -19.9087486, lng: -43.9366361 },
  { cod: "3253", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA BRASILINA", lat: -19.9002848, lng: -43.9186127 },
  { cod: "3254", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO BOA VISTA", lat: -19.8892803, lng: -43.8923781 },
  { cod: "3255", reg: "LESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE MARIANO DE ABREU", lat: -19.8953852, lng: -43.8901014 },
  { cod: "3256", reg: "LESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE SAO GERALDO", lat: -19.8990861, lng: -43.8979237 },
  { cod: "3257", reg: "LESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE BOA VISTA", lat: -19.89495, lng: -43.9066862 },
  { cod: "3258", reg: "LESTE", tipo: "ACADEMIA DA CIDADE", nome: "ACADEMIA DA CIDADE SAGRADA FAMILIA", lat: -19.9002513, lng: -43.9182543 },
  { cod: "3259", reg: "LESTE", tipo: "GALPAO", nome: "GALPAO DE BENEFICIAMENTO DE RESIDUOS GRANJA DE FREITAS", lat: -19.9127039, lng: -43.8876507 },
  { cod: "3262", reg: "LESTE", tipo: "CAMPO", nome: "CAMPO DE FUTEBOL SOCIETY JONAS VEIGA", lat: -19.9176472, lng: -43.8906834 },
  { cod: "3263", reg: "LESTE", tipo: "URPV", nome: "URPV ANDRADAS", lat: -19.9011808, lng: -43.9068826 },
  { cod: "3264", reg: "LESTE", tipo: "ESTAÇAO DE INTEGRAÇAO", nome: "ESTAÇAO INTEGRACAO BHBUS JOSE CANDIDO DA SILVEIRA", lat: -19.8840419, lng: -43.9129951 },
  { cod: "3265", reg: "LESTE", tipo: "GALPAO", nome: "GALPAO DA SECRETARIA MUNICIPAL DE ESPORTES", lat: -19.9182778, lng: -43.9014315 },
  { cod: "3266", reg: "LESTE", tipo: "ZOONOSES", nome: "CASA DE APOIO ZOONOSES - BOA VISTA", lat: -19.8909293, lng: -43.8973819 },
  { cod: "3267", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA ERNESTO CHE GUEVARA", lat: -19.9208484, lng: -43.8810618 },
  { cod: "3268", reg: "LESTE", tipo: "PRAÇA", nome: "PRAÇA SANTUARIO SAO GERALDO", lat: -19.8979198, lng: -43.898457 },
  { cod: "3270", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA DA AVENIDA BELEM", lat: -19.915456, lng: -43.9030781 },
  { cod: "3271", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO AREA DO CAMPO RIVIEIRA", lat: -19.9045331, lng: -43.8902795 },
  { cod: "3272", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO CRAS MARIANO DE ABREU", lat: -19.8947115, lng: -43.8899725 },
  { cod: "3273", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA BELEM", lat: -19.9181941, lng: -43.9021932 },
  { cod: "3274", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA COUNTRY CLUB DE BELO HORIZONTE", lat: -19.9249588, lng: -43.8858534 },
  { cod: "3275", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA AVENIDA MEM DE SA", lat: -19.9180458, lng: -43.9104988 },
  { cod: "3276", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA ANALIA DE MELO", lat: -19.9131529, lng: -43.9077848 },
  { cod: "3278", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA POMPEIA", lat: -19.9114841, lng: -43.879493 },
  { cod: "3279", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA ERCILIA SIQUEIRA", lat: -19.9130279, lng: -43.8799514 },
  { cod: "3280", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA JURAMENTO", lat: -19.9206859, lng: -43.8995091 },
  { cod: "3281", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA MARZAGANIA", lat: -19.9060869, lng: -43.8882451 },
  { cod: "3282", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA OLARIA", lat: -19.9098211, lng: -43.8790101 },
  { cod: "3283", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA RAMIRO SIQUEIRA", lat: -19.9181434, lng: -43.8816028 },
  { cod: "3284", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO DA RUA RAMIRO SIQUEIRA C FILADELFIA", lat: -19.9178477, lng: -43.8750713 },
  { cod: "3285", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PARQUE LINEAR DO ARRUDAS", lat: -19.9053384, lng: -43.8959354 },
  { cod: "3286", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PISTA DE COOPER DA ANDRADAS", lat: -19.9195853, lng: -43.9211931 },
  { cod: "3287", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PISTA DE COOPER DA ANDRADAS", lat: -19.9117226, lng: -43.9091364 },
  { cod: "3288", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ABADIA", lat: -19.906557, lng: -43.9020662 },
  { cod: "3289", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ALBERTO MAZZONI", lat: -19.9087563, lng: -43.9366609 },
  { cod: "3290", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA CHE GUEVARA", lat: -19.9203098, lng: -43.8811328 },
  { cod: "3291", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA BENEDICTO GOMES DA SILVA", lat: -19.9031009, lng: -43.9018417 },
  { cod: "3292", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA CORONEL DUARTE", lat: -19.8885482, lng: -43.9087967 },
  { cod: "3293", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DE ESPORTES SAUDADE", lat: -19.9189412, lng: -43.9005341 },
  { cod: "3294", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DO CARDOSO", lat: -19.916137, lng: -43.9105551 },
  { cod: "3295", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DO SANTUARIO DE SAO GERALDO", lat: -19.8980625, lng: -43.8984221 },
  { cod: "3296", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA DUQUE DE CAXIAS", lat: -19.9157602, lng: -43.9179802 },
  { cod: "3297", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ENGENHEIRO FRITZ", lat: -19.897378, lng: -43.9028094 },
  { cod: "3298", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA EROTILDES JOSE DA SILVA", lat: -19.9180305, lng: -43.8936231 },
  { cod: "3299", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA ESTEVAO LUNARD", lat: -19.9112657, lng: -43.9184109 },
  { cod: "3300", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA FLAMENGO", lat: -19.9070615, lng: -43.891871 },
  { cod: "3301", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA GRANJA DE FREITAS", lat: -19.9085506, lng: -43.8853807 },
  { cod: "3302", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA GUARA", lat: -19.9050602, lng: -43.9131391 },
  { cod: "3303", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA GUARACI", lat: -19.9021015, lng: -43.8971905 },
  { cod: "3304", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA JOSE DE MAGALHAES", lat: -19.8950323, lng: -43.9067696 },
  { cod: "3305", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA MIRANTE DA GLORIA", lat: -19.9105524, lng: -43.9213622 },
  { cod: "3306", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA NOSSA SENHORA DA CONCEICAO", lat: -19.8973361, lng: -43.8895273 },
  { cod: "3307", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA PADRE MARCELO", lat: -19.9102049, lng: -43.889566 },
  { cod: "3308", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA PARAISOPOLIS", lat: -19.9091301, lng: -43.9145184 },
  { cod: "3309", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA LEO VERHERYEN", lat: -19.9121425, lng: -43.8966141 },
  { cod: "3310", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA REPUBLICA DO IRAQUE", lat: -19.8932294, lng: -43.921087 },
  { cod: "3311", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA SANTA ALBERTINA", lat: -19.9010031, lng: -43.8869689 },
  { cod: "3312", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA TUNEL DA LAGOINHA", lat: -19.9097935, lng: -43.9379314 },
  { cod: "3313", reg: "LESTE", tipo: "ACADEMIA A CEU ABERTO", nome: "ACADEMIA A CEU ABERTO PRAÇA VEREADOR MARCO ANTONIO DE MENEZES", lat: -19.9002154, lng: -43.9185658 },
  { cod: "3314", reg: "LESTE", tipo: "GERENCIA", nome: "GERENCIA DE ZOONOSES LESTE", lat: -19.9148778, lng: -43.9213271 },
  { cod: "3318", reg: "LESTE", tipo: "DPMP", nome: "DEPARTAMENTO DE MANUTENÇAO DE PROPRIOS", lat: -19.9094371, lng: -43.9132538 },
  { cod: "3319", reg: "LESTE", tipo: "CAMARA", nome: "CAMARA MUNICIPAL DE BELO HORIZONTE", lat: -19.9209567, lng: -43.9164152 },
  { cod: "3320", reg: "LESTE", tipo: "PISTA", nome: "PISTA DE COOPER", lat: -19.9202399, lng: -43.9231415 },
  { cod: "3321", reg: "LESTE", tipo: "MIGUILIM", nome: "CENTRO POP MIGUILIM", lat: -19.912011, lng: -43.936545 },
  { cod: "3322", reg: "LESTE", tipo: "PROCON", nome: "COORDENADORIA DE PROTECAO E DEFESA DO CONSUMIDOR - CAMARA MUNICIPAL", lat: -19.9209567, lng: -43.9164152 },
  { cod: "ET07", reg: "LESTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE SAGRADA FAMILIA", lat: -19.9004741, lng: -43.9282273 },
  { cod: "ET08", reg: "LESTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE SILVIANO BRANDAO", lat: -19.9035779, lng: -43.9322833 },
  { cod: "ET15", reg: "LESTE", tipo: "ESTAÇAO DE TRANSFERENCIA BRT-MOVE", nome: "ESTAÇAO TRANSFERENCIA MOVE SAO JUDAS TADEU", lat: -19.8971924, lng: -43.9276611 },

  // ... (Mocks for other regions to avoid empty map - Centro-Sul e Leste ja inseridos, Norte, Noroeste, Venda Nova, Oeste, Barreiro tambem. Faltam Nordeste e Pampulha completos)
  { cod: "4001", reg: "NORDESTE", tipo: "ESCOLA", nome: "Escola M. Nordeste Mock 1", end: "Rua NE 1", num: "10", bairro: "União" },
  { cod: "8001", reg: "PAMPULHA", tipo: "ESCOLA", nome: "Escola M. Pampulha Mock 1", end: "Rua Pampulha 1", num: "10", bairro: "Santa Amélia" },
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