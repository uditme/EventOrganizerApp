import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

export async function GET(request: NextRequest) {
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

    await dbConnect();

    // Get organizer user
    const organizer = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!organizer || organizer.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can view their events' }, { status: 403 });
    }

    // Get all events for this organizer
    const events = await Event.find({ organizerId: organizer._id })
      .populate('attendees', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Fetch organizer events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
