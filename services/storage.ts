import { db } from '../firebaseConfig';
import { collection, doc, setDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { ActivePatrol, Visit } from '../types';

// Coleções no Firestore
const PATROLS_COLLECTION = 'patrols';
const VISITS_COLLECTION = 'visits';

// --- Funções de Escrita (Usadas pelo Agente) ---

export const savePatrol = async (patrol: ActivePatrol): Promise<void> => {
  try {
    // Salva ou atualiza o documento da patrulha usando o ID como chave
    const patrolRef = doc(db, PATROLS_COLLECTION, patrol.id);
    await setDoc(patrolRef, patrol, { merge: true });
  } catch (e) {
    console.error("Erro ao salvar patrulha no Firebase:", e);
  }
};

export const saveVisit = async (visit: Visit): Promise<void> => {
  try {
    const visitRef = doc(db, VISITS_COLLECTION, visit.id);
    await setDoc(visitRef, visit);
  } catch (e) {
    console.error("Erro ao salvar visita no Firebase:", e);
  }
};

// --- Funções de Leitura em Tempo Real (Usadas pelo Gestor/Agente) ---

// Inscreve-se para receber atualizações de TODAS as patrulhas
export const subscribeToPatrols = (callback: (patrols: ActivePatrol[]) => void) => {
  const q = query(collection(db, PATROLS_COLLECTION), orderBy('inicioTurno', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const patrols: ActivePatrol[] = [];
    snapshot.forEach((doc) => {
      patrols.push(doc.data() as ActivePatrol);
    });
    callback(patrols);
  });
};

// Inscreve-se para receber atualizações de TODAS as visitas
export const subscribeToVisits = (callback: (visits: Visit[]) => void) => {
  const q = query(collection(db, VISITS_COLLECTION), orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const visits: Visit[] = [];
    snapshot.forEach((doc) => {
      visits.push(doc.data() as Visit);
    });
    callback(visits);
  });
};

// --- Métodos Legados/Sincronos (Mantidos para compatibilidade com inicialização, mas agora retornam vazio se não inscritos) ---
// O GestorView e AgenteView devem usar os subscribers acima.

export const getPatrols = (): ActivePatrol[] => {
  // Em uma arquitetura puramente Firebase, não usamos leitura síncrona do localStorage.
  // Retornamos vazio para evitar erros, mas o componente deve usar o hook de subscrição.
  return [];
};

export const getVisits = (): Visit[] => {
  return [];
};

export const clearData = () => {
  // Limpeza local, se necessário. No Firebase, precisaria de uma cloud function ou lógica admin.
  console.log("Limpeza de dados locais solicitada.");
}