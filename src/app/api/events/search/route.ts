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

    // Get event code from query params
    const { searchParams } = new URL(request.url);
    const eventCode = searchParams.get('code');

    if (!eventCode) {
      return NextResponse.json({ error: 'Event code is required' }, { status: 400 });
    }

    // Find event by event code
    const event = await Event.findOne({ eventCode: eventCode.toUpperCase() })
      .populate('organizerId', 'name email');

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is already an attendee
    const isAlreadyAttendee = event.attendees.some((attendee: any) => 
      attendee.userId?.toString() === user._id.toString()
    );

    // Return event details with additional info for attendees
    return NextResponse.json({
      ...event.toObject(),
      isAlreadyAttendee
    });
  } catch (error) {
    console.error('Search event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
