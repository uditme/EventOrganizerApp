import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import ChatMessage from '@/models/ChatMessage';

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

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is attendee or organizer of this event
    const isAttendee = event.attendees.some((attendee: { userId: string }) => 
      attendee.userId?.toString() === user._id.toString()
    );
    const isOrganizer = event.organizerId.toString() === user._id.toString();

    if (!isAttendee && !isOrganizer) {
      return NextResponse.json({ error: 'You must be an attendee or organizer to view chat' }, { status: 403 });
    }

    // Get all messages for this event
    const messages = await ChatMessage.find({ eventId })
      .populate('userId', 'name')
      .sort({ sentAt: 1 });

    // Format messages
    const formattedMessages = messages.map((message: {
      _id: string;
      content: string;
      type: string;
      senderName: string;
      userId: { _id: string };
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      sentAt: Date;
    }) => ({
      _id: message._id,
      content: message.content,
      type: message.type,
      senderName: message.senderName,
      userId: message.userId._id,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      mimeType: message.mimeType,
      sentAt: message.sentAt,
    }));

    return NextResponse.json({
      messages: formattedMessages,
      isOrganizer
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
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

    const { content, type = 'text', fileUrl, fileName, fileSize, mimeType } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
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

    // Check if user is attendee or organizer of this event
    const isAttendee = event.attendees.some((attendee: { userId: string }) => 
      attendee.userId?.toString() === user._id.toString()
    );
    const isOrganizer = event.organizerId.toString() === user._id.toString();

    if (!isAttendee && !isOrganizer) {
      return NextResponse.json({ error: 'You must be an attendee or organizer to send messages' }, { status: 403 });
    }

    // Only organizers can send announcements
    if (type === 'announcement' && !isOrganizer) {
      return NextResponse.json({ error: 'Only organizers can send announcements' }, { status: 403 });
    }

    // Create new message
    const message = new ChatMessage({
      eventId,
      userId: user._id,
      senderName: user.name,
      content: content.trim(),
      type,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      sentAt: new Date()
    });

    await message.save();

    return NextResponse.json({
      message: 'Message sent successfully',
      chatMessage: {
        _id: message._id,
        content: message.content,
        type: message.type,
        senderName: message.senderName,
        userId: message.userId,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        mimeType: message.mimeType,
        sentAt: message.sentAt,
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
