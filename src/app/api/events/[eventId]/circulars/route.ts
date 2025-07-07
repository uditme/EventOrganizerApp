import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import { uploadToStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    
    try {
      const auth = getFirebaseAuth();
      await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event.circulars);
  } catch (error) {
    console.error('Get circulars error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    
    let decodedToken;
    try {
      const auth = getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the event organizer can send updates' }, { status: 403 });
    }

    if (request.headers.get('Content-Type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('audio') as File | null;

      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
      }

      const audioUrl = await uploadToStorage(file);

      event.circulars.push({
        type: 'voice',
        audioUrl,
        sentAt: new Date(),
        sentBy: user.name
      });
    } else {
      const { content } = await request.json();

      if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
      }

      event.circulars.push({
        type: 'text',
        content,
        sentAt: new Date(),
        sentBy: user.name
      });
    }

    await event.save();
    return NextResponse.json(event.circulars);
  } catch (error) {
    console.error('Post circular error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
