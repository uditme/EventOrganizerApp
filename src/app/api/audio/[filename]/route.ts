import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  try {
    // In production, you would serve files from cloud storage
    // For now, we'll serve from a local uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadsDir, filename);
    
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    let contentType = 'audio/wav';
    if (filename.endsWith('.webm')) {
      contentType = 'audio/webm';
    } else if (filename.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving audio file:', error);
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
  }
}
