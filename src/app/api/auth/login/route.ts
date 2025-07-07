import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/mongodb';
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
      return NextResponse.json({ error: 'Invalid token or Firebase not configured' }, { status: 401 });
    }
    
    const { uid, email, name, photoURL } = await request.json();

    await dbConnect();

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user without role initially
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name,
        photoURL: photoURL,
        role: 'attendee', // Default role
      });
      await user.save();
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
