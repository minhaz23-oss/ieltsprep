import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // Fetch writing tests from Firestore
    const writingTestsSnapshot = await db.collection('writingTests').get();

    if (writingTestsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No writing tests found',
        data: []
      });
    }

    const tests = writingTestsSnapshot.docs.map(doc => {
      try {
        const testData = doc.data();
        const testId = doc.id;
        
        // Extract metadata for listing
        const totalTasks = testData.tasks ? testData.tasks.length : 0;
        const timeLimit = testData.tasks 
          ? testData.tasks.reduce((acc: number, task: any) => {
              const time = parseInt(task.timeAllocation?.match(/\d+/)?.[0] || '0');
              return acc + time;
            }, 0)
          : 60;

        // Extract version from test ID
        let version = '1';
        const versionMatch = testId.match(/(?:writing|writingTest)(\d+)/);
        if (versionMatch) {
          version = versionMatch[1];
        }

        return {
          id: testId,
          title: testData.testTitle || `Writing Practice Test ${version}`,
          totalTasks,
          timeLimit,
          version
        };
      } catch (error) {
        console.error(`Error processing test ${doc.id}:`, error);
        return null;
      }
    }).filter(test => test !== null);

    return NextResponse.json({
      success: true,
      data: tests,
      message: `Found ${tests.length} writing tests`
    });

  } catch (error) {
    console.error('Error loading writing tests:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to load writing tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
