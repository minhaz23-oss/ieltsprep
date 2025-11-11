declare global {
  interface Window {
    db: ReturnType<typeof getFirestore>;
    auth: ReturnType<typeof getAuth>;
  }
}

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase client configuration from environment variables
// These are safe to expose to the browser (NEXT_PUBLIC_ prefix)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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

if (typeof window !== "undefined") {
  window.db = db;
  window.auth = auth;
}
