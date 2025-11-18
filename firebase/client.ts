declare global {
  interface Window {
    db: ReturnType<typeof getFirestore>;
    auth: ReturnType<typeof getAuth>;
  }
}

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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

// Lazy initialization - only initialize when actually used in browser
let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

function initializeFirebaseClient() {
  // Skip initialization during build/SSR
  if (typeof window === 'undefined') {
    return;
  }

  if (!app) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      console.log('Firebase client initialized successfully');
    } catch (error) {
      console.error('Firebase client initialization error:', error);
      throw error;
    }
  }
}

// Getter for auth - initializes on first access
export const getAuthInstance = (): Auth => {
  if (typeof window === 'undefined') {
    throw new Error('Auth can only be used in the browser');
  }
  
  if (!authInstance) {
    initializeFirebaseClient();
    if (!app) {
      throw new Error('Firebase app failed to initialize');
    }
    authInstance = getAuth(app);
    window.auth = authInstance;
  }
  return authInstance;
};

// Getter for db - initializes on first access
export const getDbInstance = (): Firestore => {
  if (typeof window === 'undefined') {
    throw new Error('Firestore can only be used in the browser');
  }
  
  if (!dbInstance) {
    initializeFirebaseClient();
    if (!app) {
      throw new Error('Firebase app failed to initialize');
    }
    dbInstance = getFirestore(app);
    window.db = dbInstance;
  }
  return dbInstance;
};

// Export getters with same names for backward compatibility
export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    return getAuthInstance()[prop as keyof Auth];
  }
});

export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    return getDbInstance()[prop as keyof Firestore];
  }
});
