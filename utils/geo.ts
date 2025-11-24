// Haversine formula to calculate distance between two points
export const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR');
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// --- Daily Logic Helpers ---

export const getStartOfDay = (): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

export const getDaysSince = (timestamp: number): number => {
  const now = Date.now();
  const diff = now - timestamp;
  const oneDayMs = 1000 * 60 * 60 * 24;
  return diff / oneDayMs; 
};

export const isQualitativeTarget = (nomeEquipamento: string): boolean => {
  const upper = nomeEquipamento.toUpperCase();
  return (
    upper.includes("ESCOLA") ||
    upper.includes("EMEI") ||
    upper.includes("CENTRO DE SAUDE") ||
    upper.includes("UPA") ||
    upper.includes("HOSPITAL")
  );
};

/**
 * Lógica Híbrida de Prioridade:
 * 
 * ALTA (Escolas/Saúde):
 * - Verde: Feito HOJE (após 00:00).
 * - Azul: Feito recentemente (1-2 dias), mas precisa refazer hoje (Planejamento).
 * - Vermelho: Atrasado (> 3 dias).
 * 
 * PADRAO (Praças):
 * - Verde: Válido por 48h (Rotação).
 * - Azul: 48h-72h (Atenção).
 * - Vermelho: > 72h (Atrasado).
 */
export const getProprioStatus = (lastVisitTs: number | undefined, priority: 'ALTA' | 'PADRAO'): 'green' | 'orange' | 'red' => {
  if (!lastVisitTs) return 'red'; // Nunca visitado

  const startOfToday = getStartOfDay();
  const daysSince = getDaysSince(lastVisitTs);

  if (priority === 'ALTA') {
    // Alta Prioridade: Verde só se foi HOJE
    if (lastVisitTs >= startOfToday) return 'green';
    // Se foi ontem ou anteontem, é AZUL (Planejamento do dia, não crítico)
    if (daysSince < 3) return 'orange';
    // Se faz mais tempo, é VERMELHO (Crítico)
    return 'red';
  } else {
    // Padrão: Rotação de equipes
    if (daysSince < 2) return 'green'; // Verde por 48h
    if (daysSince < 3) return 'orange'; // Azul entre 2 e 3 dias
    return 'red'; // Crítico após 3 dias
  }
};