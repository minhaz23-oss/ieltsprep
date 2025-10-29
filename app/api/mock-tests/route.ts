import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { getUserFromToken } from '@/lib/auth/server';
import { MockTest, MockTestWithSession } from '@/types/mockTest';

export async function GET(request: NextRequest) {
  try {
    // Get user from auth token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    // Fetch all mock tests
    const mockTestsSnapshot = await db.collection('mockTests').orderBy('createdAt', 'asc').get();

    if (mockTestsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No mock tests found',
        data: []
      });
    }

    // Fetch user's mock test sessions
    const sessionsSnapshot = await db
      .collection('mockTestSessions')
      .where('userId', '==', user.uid)
      .get();

    // Create a map of sessions by mockTestId
    const sessionsMap = new Map();
    sessionsSnapshot.docs.forEach(doc => {
      const sessionData = doc.data();
      sessionsMap.set(sessionData.mockTestId, {
        id: doc.id,
        ...sessionData
      });
    });

    // Map mock tests with session data
    const mockTests: MockTestWithSession[] = mockTestsSnapshot.docs.map(doc => {
      const testData = doc.data() as Omit<MockTest, 'id'>;
      const session = sessionsMap.get(doc.id);

      return {
        id: doc.id,
        ...testData,
        session,
        completionStatus: session?.status || 'not_started'
      };
    });

    return NextResponse.json({
      success: true,
      data: mockTests,
      message: `Found ${mockTests.length} mock tests`
    });

  } catch (error) {
    console.error('Error fetching mock tests:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch mock tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
