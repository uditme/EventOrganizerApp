import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

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

    const event = await Event.findById(eventId).populate('attendees.userId', 'name email');
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the event organizer can view attendees' }, { status: 403 });
    }

    // Format attendees data
    const attendees = event.attendees.map((attendee: any) => ({
      _id: attendee.userId._id,
      name: attendee.userId.name,
      email: attendee.userId.email,
      joinedAt: attendee.joinedAt
    }));

    return NextResponse.json(attendees);
  } catch (error) {
    console.error('Get attendees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
