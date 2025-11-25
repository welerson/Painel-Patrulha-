import { Proprio, RoutePoint } from './types';

// Version control to force update
export const DB_VERSION = "4.0-CLEARED-DATA";

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
  "ALIPÍO DE MELO": { lat: -19.895, lng: -44.000 },
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

// DADOS VAZIOS (CLEARED)
const RAW_DATA: any[] = [];

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