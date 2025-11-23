import { db } from '../firebaseConfig';
import { collection, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
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

// --- Funções de Leitura em Tempo Real ---

export const subscribeToPatrols = (callback: (patrols: ActivePatrol[]) => void) => {
  // REMOVED orderBy('inicioTurno', 'desc') to prevent "Missing Index" errors on new Firestore instances.
  // Sorting will be done client-side in the component.
  const q = query(collection(db, PATROLS_COLLECTION));
  
  return onSnapshot(q, (snapshot) => {
    const patrols: ActivePatrol[] = [];
    snapshot.forEach((doc) => {
      patrols.push(doc.data() as ActivePatrol);
    });
    console.log(`Recebidas ${patrols.length} patrulhas do Firebase`);
    callback(patrols);
  }, (error) => {
    console.error("Erro ao assinar patrulhas:", error);
  });
};

export const subscribeToVisits = (callback: (visits: Visit[]) => void) => {
  // REMOVED orderBy('timestamp', 'desc') to prevent "Missing Index" errors.
  const q = query(collection(db, VISITS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const visits: Visit[] = [];
    snapshot.forEach((doc) => {
      visits.push(doc.data() as Visit);
    });
    console.log(`Recebidas ${visits.length} visitas do Firebase`);
    callback(visits);
  }, (error) => {
    console.error("Erro ao assinar visitas:", error);
  });
};

// --- Métodos Legados (Compatibilidade) ---
export const getPatrols = (): ActivePatrol[] => [];
export const getVisits = (): Visit[] => [];
export const clearData = () => console.log("Limpeza local solicitada.");