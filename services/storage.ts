import { ActivePatrol, Visit } from '../types';

// In a real scenario, these functions would call Firestore directly.
// For this "functional code" output without API keys, we simulate persistence via localStorage.

const PATROLS_KEY = 'ppbh_patrols';
const VISITS_KEY = 'ppbh_visits';

export const savePatrol = (patrol: ActivePatrol): void => {
  const patrols = getPatrols();
  const index = patrols.findIndex(p => p.id === patrol.id);
  if (index >= 0) {
    patrols[index] = patrol;
  } else {
    patrols.push(patrol);
  }
  localStorage.setItem(PATROLS_KEY, JSON.stringify(patrols));
};

export const getPatrols = (): ActivePatrol[] => {
  const data = localStorage.getItem(PATROLS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveVisit = (visit: Visit): void => {
  const visits = getVisits();
  visits.push(visit);
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
};

export const getVisits = (): Visit[] => {
  const data = localStorage.getItem(VISITS_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearData = () => {
  localStorage.removeItem(PATROLS_KEY);
  localStorage.removeItem(VISITS_KEY);
}