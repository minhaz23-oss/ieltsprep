'use server'
import { db } from '@/firebase/admin';

export async function getReadingTests() {
  try {
    const readingTestsSnapshot = await db.collection("readingTests").get();
    
    if (readingTestsSnapshot.empty) {
      return {
        success: true,
        data: [],
        message: "No reading tests found"
      };
    }

    const readingTests = readingTestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: readingTests,
      message: "Reading tests fetched successfully"
    };
    
  } catch (error) {
    console.error("Error fetching reading tests:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch reading tests"
    };
  }
}

export async function getReadingTestById(testId: string) {
  try {
    const testDoc = await db.collection("readingTests").doc(testId).get();
    
    if (!testDoc.exists) {
      return {
        success: false,
        data: null,
        message: "Reading test not found"
      };
    }

    const testData = {
      id: testDoc.id,
      ...testDoc.data()
    };

    return {
      success: true,
      data: testData,
      message: "Reading test fetched successfully"
    };
    
  } catch (error) {
    console.error("Error fetching reading test:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch reading test"
    };
  }
}
