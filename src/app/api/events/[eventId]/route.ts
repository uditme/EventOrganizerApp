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

    const event = await Event.findById(eventId).populate('organizerId', 'name email');
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is the organizer or an attendee
    const isOrganizer = event.organizerId._id.toString() === user._id.toString();
    const isAttendee = event.attendees.some((attendee: any) => 
      attendee.userId?.toString() === user._id.toString()
    );

    if (!isOrganizer && !isAttendee && user.role !== 'organizer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    const { name, description, date, location } = await request.json();

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
      return NextResponse.json({ error: 'Only the event organizer can update this event' }, { status: 403 });
    }

    // Update event
    if (name) event.name = name;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (location) event.location = location;

    await event.save();

    return NextResponse.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check if user is the organizer
    if (event.organizerId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the event organizer can delete this event' }, { status: 403 });
    }

    await Event.findByIdAndDelete(eventId);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
