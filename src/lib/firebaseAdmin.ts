import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (getApps().length > 0) {
    firebaseAdminApp = getApps()[0];
    return firebaseAdminApp;
  }

  try {
    // Check if all required environment variables are present
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('Firebase Admin credentials are missing. Some features may not work.');
      return null;
    }

    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });

    console.log('Firebase Admin initialized successfully');
    return firebaseAdminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}

export function getFirebaseAuth() {
  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error('Firebase Admin is not initialized');
  }
  return getAuth(app);
}

// Initialize Firebase Admin immediately
getFirebaseAdminApp();
