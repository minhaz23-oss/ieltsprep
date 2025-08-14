'use server'
import { db } from '@/firebase/admin';

export async function getWritingTests() {
  try {
    const writingTestsSnapshot = await db.collection("writingTests").get();
    
    if (writingTestsSnapshot.empty) {
      return {
        success: true,
        data: [],
        message: "No writing tests found"
      };
    }

    const writingTests = writingTestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: writingTests,
      message: "Writing tests fetched successfully"
    };
    
  } catch (error) {
    console.error("Error fetching writing tests:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch writing tests"
    };
  }
}

export async function getWritingTestById(testId: string) {
  try {
    const testDoc = await db.collection("writingTests").doc(testId).get();
    
    if (!testDoc.exists) {
      return {
        success: false,
        data: null,
        message: "Writing test not found"
      };
    }

    const testData = {
      id: testDoc.id,
      ...testDoc.data()
    };

    return {
      success: true,
      data: testData,
      message: "Writing test fetched successfully"
    };
    
  } catch (error) {
    console.error("Error fetching writing test:", error);
    return {
      success: false,
      data: null,
      message: "Failed to fetch writing test"
    };
  }
}
