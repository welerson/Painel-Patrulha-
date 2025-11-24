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
  return diff / oneDayMs; // Return float for more precision hours checking
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
 * Lógica Híbrida de Prioridade e Rotação
 * 
 * ALTA (Escolas, Saúde): Requer visita DIÁRIA. Se virou o dia, reseta para Vermelho.
 * PADRAO (Praças, etc): Requer rotação. Válido por 48h.
 */
export const getProprioStatus = (lastVisitTs: number | undefined, priority: 'ALTA' | 'PADRAO'): 'green' | 'orange' | 'red' => {
  if (!lastVisitTs) return 'red'; // Nunca visitado

  if (priority === 'ALTA') {
    // Regra Estrita: Tem que ter sido visitado HOJE (após 00:00)
    const startOfToday = getStartOfDay();
    return lastVisitTs >= startOfToday ? 'green' : 'red';
  } else {
    // Regra de Rotação: Válido por 48h
    const daysSince = getDaysSince(lastVisitTs);
    
    if (daysSince < 2) return 'green'; // Menos de 48h (2 dias)
    if (daysSince < 3) return 'orange'; // Entre 48h e 72h (Atenção/Renovar)
    return 'red'; // Mais de 72h (Crítico)
  }
};