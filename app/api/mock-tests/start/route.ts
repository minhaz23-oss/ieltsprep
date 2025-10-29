import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { getUserFromToken } from '@/lib/auth/server';
import { MockTestSession } from '@/types/mockTest';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { mockTestId } = await request.json();

    if (!mockTestId) {
      return NextResponse.json({
        success: false,
        message: 'Mock test ID is required'
      }, { status: 400 });
    }

    // Verify mock test exists
    const mockTestDoc = await db.collection('mockTests').doc(mockTestId).get();

    if (!mockTestDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Mock test not found'
      }, { status: 404 });
    }

    const mockTestData = mockTestDoc.data();

    // Check if user already has an in-progress session for this test
    const existingSessionSnapshot = await db
      .collection('mockTestSessions')
      .where('userId', '==', user.uid)
      .where('mockTestId', '==', mockTestId)
      .where('status', '==', 'in_progress')
      .limit(1)
      .get();

    if (!existingSessionSnapshot.empty) {
      // Return existing session
      const existingSession = existingSessionSnapshot.docs[0];
      return NextResponse.json({
        success: true,
        message: 'Resuming existing session',
        data: {
          sessionId: existingSession.id,
          ...existingSession.data()
        }
      });
    }

    // Create new session
    const newSession: Omit<MockTestSession, 'id'> = {
      userId: user.uid,
      mockTestId,
      status: 'in_progress',
      startedAt: new Date(),
      currentSection: 'listening',
      sectionResults: {},
      isPremium: mockTestData?.isPremium || false
    };

    const sessionRef = await db.collection('mockTestSessions').add(newSession);

    return NextResponse.json({
      success: true,
      message: 'Mock test session started',
      data: {
        sessionId: sessionRef.id,
        ...newSession
      }
    });

  } catch (error) {
    console.error('Error starting mock test session:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to start mock test session',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
