import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5L4YL_zRbH1xvLkKeASNDAEfZ7HNLK9E",
  authDomain: "ieltsprep-a76b4.firebaseapp.com",
  projectId: "ieltsprep-a76b4",
  storageBucket: "ieltsprep-a76b4.firebasestorage.app",
  messagingSenderId: "803053889738",
  appId: "1:803053889738:web:c1f72df098760fb99eac33",
  measurementId: "G-8H576C2WZ2"
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('Firebase client initialized successfully');
} catch (error) {
  console.error('Firebase client initialization error:', error);
  throw error;
}

export const auth = getAuth(app);
export const db = getFirestore(app);