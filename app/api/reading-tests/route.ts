import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET() {
  try {
    // Fetch all reading tests from Firestore
    const snapshot = await db.collection('reading-tests').get();

    if (snapshot.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'No reading tests found',
        data: [] 
      });
    }

    // Map Firestore documents to test metadata
    const tests = snapshot.docs.map(doc => {
      const testData = doc.data();
      
      // Extract version number from ID (e.g., "reading13_t1" -> "13")
      const versionMatch = doc.id.match(/reading(\d+)_t/);
      const version = versionMatch ? versionMatch[1] : '1';
      
      return {
        id: doc.id,
        title: testData.title || 'IELTS Reading Test',
        totalQuestions: testData.totalQuestions || 40,
        timeLimit: testData.totalTime || 60,
        version,
        passages: testData.passages?.length || 3
      };
    });

    // Sort tests by version and test number
    tests.sort((a, b) => {
      const aMatch = a.id.match(/reading(\d+)_t(\d+)/);
      const bMatch = b.id.match(/reading(\d+)_t(\d+)/);
      
      if (aMatch && bMatch) {
        const aVersion = parseInt(aMatch[1]);
        const bVersion = parseInt(bMatch[1]);
        const aTest = parseInt(aMatch[2]);
        const bTest = parseInt(bMatch[2]);
        
        if (aVersion !== bVersion) {
          return aVersion - bVersion;
        }
        return aTest - bTest;
      }
      
      return a.id.localeCompare(b.id);
    });

    return NextResponse.json({ 
      success: true, 
      data: tests,
      message: `Found ${tests.length} reading tests`
    });
  } catch (error) {
    console.error('Error loading reading tests:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to load reading tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
