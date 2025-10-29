import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { getUserFromToken } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const mockTestId = params.id;

    // Fetch mock test metadata
    const mockTestDoc = await db.collection('mockTests').doc(mockTestId).get();

    if (!mockTestDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Mock test not found'
      }, { status: 404 });
    }

    const mockTestData = mockTestDoc.data();

    // Fetch user's session for this mock test (if exists)
    const sessionSnapshot = await db
      .collection('mockTestSessions')
      .where('userId', '==', user.uid)
      .where('mockTestId', '==', mockTestId)
      .limit(1)
      .get();

    const session = sessionSnapshot.empty 
      ? null 
      : { id: sessionSnapshot.docs[0].id, ...sessionSnapshot.docs[0].data() };

    // Fetch all section test data in parallel
    const [listeningDoc, readingDoc, writingDoc] = await Promise.all([
      db.collection('listening-tests').doc(mockTestData?.sections?.listening?.testId).get(),
      db.collection('reading-tests').doc(mockTestData?.sections?.reading?.testId).get(),
      db.collection('writingTests').doc(mockTestData?.sections?.writing?.testId).get()
    ]);

    // Prepare response with test data
    const response = {
      mockTest: {
        id: mockTestDoc.id,
        ...mockTestData
      },
      session,
      tests: {
        listening: listeningDoc.exists ? { id: listeningDoc.id, ...listeningDoc.data() } : null,
        reading: readingDoc.exists ? { id: readingDoc.id, ...readingDoc.data() } : null,
        writing: writingDoc.exists ? { id: writingDoc.id, ...writingDoc.data() } : null,
        // Speaking uses VAPI AI (no Firestore document needed)
        speaking: { type: 'vapi-ai', id: mockTestData?.sections?.speaking?.testId }
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching mock test:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch mock test',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
