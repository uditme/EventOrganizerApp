import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import Feedback from '@/models/Feedback';

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
    const isAttendee = event.attendees.some((attendee: any) => 
      attendee.userId?.toString() === user._id.toString()
    );
    const isOrganizer = event.organizerId.toString() === user._id.toString();

    if (!isAttendee && !isOrganizer) {
      return NextResponse.json({ error: 'You must be an attendee or organizer to view feedback' }, { status: 403 });
    }

    // Get all feedback for this event
    const feedback = await Feedback.find({ eventId })
      .populate('userId', 'name')
      .sort({ submittedAt: -1 });

    // Check if current user has already submitted feedback (for attendees)
    const hasSubmittedFeedback = feedback.some((item: any) => 
      item.userId._id.toString() === user._id.toString()
    );

    // Format feedback data
    const formattedFeedback = feedback.map((item: any) => ({
      _id: item._id,
      rating: item.rating,
      comment: item.comment,
      submittedAt: item.submittedAt,
      submittedBy: item.userId.name
    }));

    return NextResponse.json({
      feedback: formattedFeedback,
      hasSubmittedFeedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
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

    const { rating, comment } = await request.json();

    if (!rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) and comment are required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'attendee') {
      return NextResponse.json({ error: 'Only attendees can submit feedback' }, { status: 403 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is an attendee of this event
    const isAttendee = event.attendees.some((attendee: any) => 
      attendee.userId?.toString() === user._id.toString()
    );

    if (!isAttendee) {
      return NextResponse.json({ error: 'You must be an attendee of this event to submit feedback' }, { status: 403 });
    }

    // Check if user has already submitted feedback
    const existingFeedback = await Feedback.findOne({ 
      eventId, 
      userId: user._id 
    });

    if (existingFeedback) {
      return NextResponse.json({ error: 'You have already submitted feedback for this event' }, { status: 400 });
    }

    // Create new feedback
    const feedback = new Feedback({
      eventId,
      userId: user._id,
      rating,
      comment: comment.trim(),
      submittedAt: new Date()
    });

    await feedback.save();

    return NextResponse.json({ 
      message: 'Feedback submitted successfully',
      feedback: {
        _id: feedback._id,
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: feedback.submittedAt
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
