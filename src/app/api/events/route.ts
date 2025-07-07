import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

// Generate a random 6-character event code
function generateEventCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    
    // Check if Firebase Admin is available
    let decodedToken;
    try {
      const auth = getFirebaseAuth();
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json({ error: 'Invalid token or Firebase not configured' }, { status: 401 });
    }
    
    const { name, description, date, location } = await request.json();

    if (!name || !description || !date || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Get organizer user
    const organizer = await User.findOne({ firebaseUid: decodedToken.uid });
    console.log('Create Event - User lookup:', {
      firebaseUid: decodedToken.uid,
      found: !!organizer,
      role: organizer?.role,
      email: organizer?.email
    });
    
    if (!organizer) {
      return NextResponse.json({ error: 'User not found in database. Please log in again.' }, { status: 404 });
    }
    
    if (organizer.role !== 'organizer') {
      return NextResponse.json({ 
        error: 'Only organizers can create events', 
        currentRole: organizer.role,
        userEmail: organizer.email 
      }, { status: 403 });
    }

    // Generate unique event code
    let eventCode;
    let isUnique = false;
    do {
      eventCode = generateEventCode();
      const existingEvent = await Event.findOne({ eventCode });
      isUnique = !existingEvent;
    } while (!isUnique);

    const event = new Event({
      name,
      description,
      date: new Date(date),
      location,
      organizerId: organizer._id,
      eventCode,
      attendees: [],
      circulars: [],
    });

    await event.save();

    return NextResponse.json(event);
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
