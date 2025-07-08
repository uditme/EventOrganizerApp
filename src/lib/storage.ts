// Firebase Storage utility for production deployment

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

export async function uploadToStorage(file: File): Promise<string> {
  try {
    // Generate unique filename with correct extension
    const extension = file.name.endsWith('.webm') ? 'webm' : 'wav';
    const fileName = `voice-messages/voice-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Upload the file
    await uploadBytes(storageRef, buffer, {
      contentType: file.type || `audio/${extension}`
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('File uploaded successfully to Firebase Storage:', fileName, 'Size:', file.size);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
}

// Placeholder for future file management functions
export async function deleteFromStorage(url: string): Promise<void> {
  // Implementation for deleting files from storage
  console.log('Deleting file:', url);
}

export async function getFileUrl(fileName: string): Promise<string> {
  // Implementation for getting file URLs
  return `/api/audio/${fileName}`;
}
