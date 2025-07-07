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

    if (user.role !== 'attendee') {
      return NextResponse.json({ error: 'Only attendees can access this endpoint' }, { status: 403 });
    }

    // Find all events where the user is an attendee
    const events = await Event.find({
      'attendees.userId': user._id
    })
    .populate('organizerId', 'name email')
    .sort({ date: 1 }); // Sort by event date ascending

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get attendee events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
