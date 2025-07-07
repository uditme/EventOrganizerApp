import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

export async function POST(request: NextRequest) {
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

    const { eventCode } = await request.json();

    if (!eventCode) {
      return NextResponse.json({ error: 'Event code is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'attendee') {
      return NextResponse.json({ error: 'Only attendees can join events' }, { status: 403 });
    }

    // Find the event by event code
    const event = await Event.findOne({ eventCode: eventCode.toUpperCase() });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is already an attendee
    const isAlreadyAttendee = event.attendees.some((attendee: { userId: string }) => 
      attendee.userId?.toString() === user._id.toString()
    );

    if (isAlreadyAttendee) {
      return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
    }

    // Add user to attendees
    event.attendees.push({
      userId: user._id,
      joinedAt: new Date()
    });

    await event.save();

    return NextResponse.json({ 
      message: 'Successfully joined the event',
      event: {
        _id: event._id,
        name: event.name,
        eventCode: event.eventCode
      }
    });
  } catch (error) {
    console.error('Join event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
