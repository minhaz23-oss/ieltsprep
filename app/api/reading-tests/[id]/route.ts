import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;

    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'Test ID is required' },
        { status: 400 }
      );
    }

    // Fetch the reading test from Firestore
    const doc = await db.collection('reading-tests').doc(testId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      );
    }

    const testData = doc.data();

    // Return in the same format as the JSON files (with "test" wrapper)
    return NextResponse.json({
      test: {
        ...testData,
        id: doc.id
      }
    });
  } catch (error) {
    console.error('Error fetching reading test:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reading test',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
