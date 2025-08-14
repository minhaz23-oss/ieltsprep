import {cert, getApps, initializeApp} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const initFirebaseAdmin = () => {
    const apps = getApps()
    
    if (apps.length === 0) {
        // Check if all required environment variables are present
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.error('Missing Firebase Admin environment variables:', {
                hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
                hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
                hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
            });
            throw new Error('Missing required Firebase Admin environment variables');
        }

        try {
            console.log('Initializing Firebase Admin with project:', process.env.FIREBASE_PROJECT_ID);
            
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
            
            console.log('Firebase Admin initialized successfully');
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
            throw error;
        }
    } else {
        console.log('Firebase Admin already initialized');
    }

    return {
        auth: getAuth(),
        db: getFirestore()
    }
}

export const { auth, db } = initFirebaseAdmin()
