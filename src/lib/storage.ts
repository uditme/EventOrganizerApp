// Simple file storage utility
// In a production environment, you would integrate with a service like AWS S3, Google Cloud Storage, etc.

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function uploadToStorage(file: File): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename with correct extension
    const extension = file.name.endsWith('.webm') ? 'webm' : 'wav';
    const fileName = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = join(uploadsDir, fileName);
    
    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);
    
    console.log('File uploaded successfully:', fileName, 'Size:', file.size);
    
    // Return the URL that can be used to access the file
    return `/api/audio/${fileName}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
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
