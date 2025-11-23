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
  // Added seconds to make distinct visits clearer
  return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// --- Daily Logic Helpers ---

// Retorna o timestamp das 00:00:00 do dia atual (local time)
export const getStartOfDay = (): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

// Retorna a diferença em dias entre um timestamp e agora
export const getDaysSince = (timestamp: number): number => {
  const now = Date.now();
  const diff = now - timestamp;
  const oneDayMs = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDayMs);
};

// Verifica se o local exige visita qualitativa (foto)
export const isQualitativeTarget = (nomeEquipamento: string): boolean => {
  const upper = nomeEquipamento.toUpperCase();
  return (
    upper.includes("ESCOLA") ||
    upper.includes("EMEI") ||
    upper.includes("CENTRO DE SAUDE") ||
    upper.includes("UPA")
  );
};