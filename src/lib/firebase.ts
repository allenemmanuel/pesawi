import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAcIi-wvVidoG5ChmnBji8MfMSprCJCAgY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "pesawi-14e45.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "pesawi-14e45",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "pesawi-14e45.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "22154616514",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:22154616514:web:ceb067d39a2474f968a55b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-2MMN1D9KLK",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const functions = getFunctions(firebaseApp);
