import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { ListeningTest } from '@/types/listening';

// GET - Fetch a specific listening test
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testDoc = await db.collection('listening-tests').doc(id).get();
    
    if (!testDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      );
    }

    const testData = { id: testDoc.id, ...testDoc.data() } as ListeningTest;
    return NextResponse.json({ success: true, data: testData });
  } catch (error) {
    console.error('Error fetching listening test:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}

// PUT - Update a listening test
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testData: Partial<ListeningTest> = await request.json();

    // Check if test exists
    const testDoc = await db.collection('listening-tests').doc(id).get();
    if (!testDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      );
    }

    // Update metadata timestamp
    const updatedData = {
      ...testData,
      metadata: {
        ...testData.metadata,
        updatedAt: new Date().toISOString(),
      }
    };

    await db.collection('listening-tests').doc(id).update(updatedData);

    return NextResponse.json({ 
      success: true, 
      message: 'Test updated successfully' 
    });
  } catch (error) {
    console.error('Error updating listening test:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a listening test
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if test exists
    const testDoc = await db.collection('listening-tests').doc(id).get();
    if (!testDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      );
    }

    // Delete the test
    await db.collection('listening-tests').doc(id).delete();

    // Optionally, you might want to also delete related test results
    // const resultsSnapshot = await db
    //   .collection('listening-test-results')
    //   .where('testId', '==', params.id)
    //   .get();
    
    // const batch = db.batch();
    // resultsSnapshot.docs.forEach(doc => {
    //   batch.delete(doc.ref);
    // });
    // await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: 'Test deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting listening test:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete test' },
      { status: 500 }
    );
  }
}