
export enum UserRole {
  AGENTE = 'AGENTE',
  GESTOR = 'GESTOR'
}

export interface Proprio {
  cod: string;
  nome_equipamento: string;
  tipo_logradouro: string;
  nome_logradouro: string;
  numero_imovel: string;
  bairro: string;
  regional: string;
  lat: number;
  lng: number;
  prioridade?: 'ALTA' | 'PADRAO'; // Opcional para evitar quebra
}

export interface Visit {
  id: string;
  proprioId: string;
  cod: string;
  nome_equipamento: string;
  lat: number;
  lng: number;
  timestamp: number;
  idViatura: string;
  agente: string;
  regional: string;
  photo?: string; // Base64
  photoTimestamp?: number;
  durationSeconds?: number; // Tempo de permanência
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ActivePatrol {
  id: string;
  idViatura: string;
  agente: string;
  regional: string;
  inicioTurno: number;
  fimTurno?: number;
  pontos: RoutePoint[];
}

export interface UserSession {
  email: string;
  role: UserRole;
  name?: string;
}
