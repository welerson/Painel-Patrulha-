import { db } from '../firebaseConfig';
import { collection, doc, setDoc, onSnapshot, query } from 'firebase/firestore';
import { ActivePatrol, Visit } from '../types';

// Coleções no Firestore
const PATROLS_COLLECTION = 'patrols';
const VISITS_COLLECTION = 'visits';

// --- Funções de Escrita ---

export const savePatrol = async (patrol: ActivePatrol): Promise<void> => {
  try {
    const patrolRef = doc(db, PATROLS_COLLECTION, patrol.id);
    // Use merge true to update existing patrol without overwriting everything if fields differ
    await setDoc(patrolRef, patrol, { merge: true });
  } catch (e: any) {
    if (e.code === 'permission-denied') {
        // Apenas aviso no console para não poluir, pois a UI do Gestor já avisa
        console.warn("SavePatrol: Permissão negada (Verifique regras do Firestore).");
    } else {
        console.error("Erro ao salvar patrulha:", e);
    }
  }
};

export const saveVisit = async (visit: Visit): Promise<void> => {
  try {
    const visitRef = doc(db, VISITS_COLLECTION, visit.id);
    await setDoc(visitRef, visit);
  } catch (e: any) {
    if (e.code === 'permission-denied') {
        console.warn("SaveVisit: Permissão negada (Verifique regras do Firestore).");
    } else {
        console.error("Erro ao salvar visita:", e);
    }
  }
};

// --- Funções de Leitura em Tempo Real ---

export const subscribeToPatrols = (
  callback: (patrols: ActivePatrol[]) => void, 
  onError?: (error: any) => void
) => {
  const q = query(collection(db, PATROLS_COLLECTION));
  
  return onSnapshot(q, (snapshot) => {
    const patrols: ActivePatrol[] = [];
    snapshot.forEach((doc) => {
      patrols.push(doc.data() as ActivePatrol);
    });
    // console.log(`Recebidas ${patrols.length} patrulhas do Firebase`);
    callback(patrols);
  }, (error) => {
    if (error.code === 'permission-denied') {
        console.warn("SubscribePatrols: Permissão negada.");
    } else {
        console.error("Erro ao assinar patrulhas:", error);
    }
    if (onError) onError(error);
  });
};

export const subscribeToVisits = (
  callback: (visits: Visit[]) => void,
  onError?: (error: any) => void
) => {
  const q = query(collection(db, VISITS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const visits: Visit[] = [];
    snapshot.forEach((doc) => {
      visits.push(doc.data() as Visit);
    });
    // console.log(`Recebidas ${visits.length} visitas do Firebase`);
    callback(visits);
  }, (error) => {
    if (error.code === 'permission-denied') {
        console.warn("SubscribeVisits: Permissão negada.");
    } else {
        console.error("Erro ao assinar visitas:", error);
    }
    if (onError) onError(error);
  });
};

// --- Métodos Legados (Compatibilidade) ---
export const getPatrols = (): ActivePatrol[] => [];
export const getVisits = (): Visit[] => [];
export const clearData = () => console.log("Limpeza local solicitada.");