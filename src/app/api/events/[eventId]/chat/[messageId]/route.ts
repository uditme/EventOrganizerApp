import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import ChatMessage from '@/models/ChatMessage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; messageId: string }> }
) {
  const { eventId, messageId } = await params;
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

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user is organizer of this event (only organizers can delete messages)
    const isOrganizer = event.organizerId.toString() === user._id.toString();

    if (!isOrganizer) {
      return NextResponse.json({ error: 'Only organizers can delete messages' }, { status: 403 });
    }

    // Verify message belongs to this event
    if (message.eventId.toString() !== eventId) {
      return NextResponse.json({ error: 'Message does not belong to this event' }, { status: 400 });
    }

    await ChatMessage.findByIdAndDelete(messageId);

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
