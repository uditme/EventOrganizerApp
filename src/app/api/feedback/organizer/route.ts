import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import Feedback from '@/models/Feedback';

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

    if (user.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can access this endpoint' }, { status: 403 });
    }

    // Get all events organized by this user
    const events = await Event.find({ organizerId: user._id });
    const eventIds = events.map(event => event._id);

    if (eventIds.length === 0) {
      return NextResponse.json({ feedback: [] });
    }

    // Get all feedback for these events
    const feedback = await Feedback.find({ eventId: { $in: eventIds } })
      .populate('userId', 'name')
      .populate('eventId', 'name')
      .sort({ submittedAt: -1 });

    // Format feedback data
    const formattedFeedback = feedback.map((item: any) => ({
      _id: item._id,
      rating: item.rating,
      comment: item.comment,
      submittedAt: item.submittedAt,
      submittedBy: item.userId.name,
      eventName: item.eventId.name
    }));

    return NextResponse.json({
      feedback: formattedFeedback
    });
  } catch (error) {
    console.error('Get organizer feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
