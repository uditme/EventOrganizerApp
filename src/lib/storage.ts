// Simple database storage utility for Vercel deployment
// Stores audio as base64 data in MongoDB

export async function uploadToStorage(file: File): Promise<string> {
  try {
    // Check file size limit (1MB for 1 minute audio)
    const maxSize = 1024 * 1024; // 1MB limit
    if (file.size > maxSize) {
      throw new Error('Audio file too large. Please record a shorter message (max 1 minute).');
    }
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // Determine content type
    const contentType = file.type || (file.name.endsWith('.webm') ? 'audio/webm' : 'audio/wav');
    
    // Create data URL
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    console.log('Audio converted to base64, size:', file.size, 'bytes');
    
    return dataUrl;
  } catch (error) {
    console.error('Error processing audio file:', error);
    throw error;
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
