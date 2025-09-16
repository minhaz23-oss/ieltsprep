import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists and has admin privileges
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { isAdmin: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    );
  }
}