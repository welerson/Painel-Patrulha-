import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACqs07qHveg2OcEZ9qSRs1g0CGQYiINtk",
  authDomain: "gcmbh-escala.firebaseapp.com",
  projectId: "gcmbh-escala",
  storageBucket: "gcmbh-escala.firebasestorage.app",
  messagingSenderId: "407968527589",
  appId: "1:407968527589:web:9bb3e0c7fc8fba398ed00c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);