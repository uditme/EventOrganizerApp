import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; attendeeId: string }> }
) {
  const { eventId, attendeeId } = await params;
  
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

    // Check if user is the organizer
    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the event organizer can remove attendees' }, { status: 403 });
    }

    // Find and remove the attendee
    const attendeeIndex = event.attendees.findIndex(
      (attendee: any) => attendee.userId.toString() === attendeeId
    );

    if (attendeeIndex === -1) {
      return NextResponse.json({ error: 'Attendee not found in this event' }, { status: 404 });
    }

    // Remove the attendee from the event
    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    return NextResponse.json({ message: 'Attendee removed successfully' });
  } catch (error) {
    console.error('Remove attendee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
