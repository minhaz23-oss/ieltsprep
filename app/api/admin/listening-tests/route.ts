import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { ListeningTest, AdminListeningTest } from '@/types/listening';

// GET - Fetch all listening tests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('listening-tests');
    
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    const snapshot = await query.orderBy('metadata.createdAt', 'desc').get();
    const tests: AdminListeningTest[] = [];

    for (const doc of snapshot.docs) {
      const testData = { id: doc.id, ...doc.data() } as ListeningTest;
      
      // Get test statistics
      const statsSnapshot = await db
        .collection('listening-test-results')
        .where('testId', '==', doc.id)
        .get();

      const results = statsSnapshot.docs.map(doc => doc.data());
      const stats = {
        totalAttempts: results.length,
        averageScore: results.length > 0
          ? results.reduce((sum, result) => sum + result.score.percentage, 0) / results.length
          : 0,
        averageBandScore: results.length > 0
          ? results.reduce((sum, result) => sum + result.bandScore, 0) / results.length
          : 0,
      };

      tests.push({ ...testData, stats });
    }

    return NextResponse.json({ success: true, data: tests });
  } catch (error) {
    console.error('Error fetching listening tests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

// POST - Create a new listening test
export async function POST(request: NextRequest) {
  try {
    const testData: ListeningTest = await request.json();

    // Validate required fields
    if (!testData.id || !testData.title || !testData.sections) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: id, title, or sections' },
        { status: 400 }
      );
    }

    // Check if test with this ID already exists
    const existingTest = await db.collection('listening-tests').doc(testData.id).get();
    if (existingTest.exists) {
      return NextResponse.json(
        { success: false, message: 'Test with this ID already exists' },
        { status: 409 }
      );
    }

    // Add metadata timestamps
    const testWithMetadata: ListeningTest = {
      ...testData,
      metadata: {
        ...testData.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };

    await db.collection('listening-tests').doc(testData.id).set(testWithMetadata);

    return NextResponse.json({ 
      success: true, 
      message: 'Test created successfully',
      data: testWithMetadata 
    });
  } catch (error) {
    console.error('Error creating listening test:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create test' },
      { status: 500 }
    );
  }
}