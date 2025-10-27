"use server";

import { db } from '@/firebase/admin';
import { ListeningTest } from '@/types/listening';
import fs from 'fs';
import path from 'path';

// Migrate JSON files to Firestore
export async function migrateListeningTests() {
  try {
    // Path to the listening tests directory
    const testsDirectory = path.join(process.cwd(), 'public', 'listeningTests');
    
    if (!fs.existsSync(testsDirectory)) {
      return { success: false, message: 'Listening tests directory not found' };
    }

    const files = fs.readdirSync(testsDirectory).filter(file => file.endsWith('.json'));
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(testsDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const testData: ListeningTest = JSON.parse(fileContent);

        // Check if test already exists
        const existingTest = await db.collection('listening-tests').doc(testData.id).get();
        
        if (existingTest.exists) {
          results.push({
            file,
            status: 'skipped',
            message: 'Test already exists in Firestore'
          });
          continue;
        }

        // Add metadata timestamps if not present
        const testWithMetadata: ListeningTest = {
          ...testData,
          metadata: {
            ...testData.metadata,
            createdAt: testData.metadata.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };

        // Save to Firestore
        await db.collection('listening-tests').doc(testData.id).set(testWithMetadata);

        results.push({
          file,
          status: 'success',
          message: 'Successfully migrated to Firestore'
        });
        successCount++;

      } catch (error) {
        console.error(`Error migrating ${file}:`, error);
        results.push({
          file,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Migration completed: ${successCount} successful, ${errorCount} errors`,
      results,
      summary: {
        totalFiles: files.length,
        successful: successCount,
        errors: errorCount,
        skipped: files.length - successCount - errorCount
      }
    };

  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: 'Migration failed' };
  }
}

// Check migration status
export async function checkMigrationStatus() {
  try {
    // Count JSON files
    const testsDirectory = path.join(process.cwd(), 'public', 'listeningTests');
    let jsonFileCount = 0;
    
    if (fs.existsSync(testsDirectory)) {
      const files = fs.readdirSync(testsDirectory).filter(file => file.endsWith('.json'));
      jsonFileCount = files.length;
    }

    // Count Firestore documents
    const snapshot = await db.collection('listening-tests').get();
    const firestoreCount = snapshot.size;

    return {
      success: true,
      data: {
        jsonFiles: jsonFileCount,
        firestoreDocuments: firestoreCount,
        migrationNeeded: jsonFileCount > firestoreCount
      }
    };

  } catch (error) {
    console.error('Error checking migration status:', error);
    return { success: false, message: 'Failed to check migration status' };
  }
}

// Get listening tests with statistics for admin
export async function getListeningTestsWithStats() {
  try {
    const snapshot = await db.collection('listening-tests').orderBy('metadata.createdAt', 'desc').get();
    const tests = [];

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

    return { success: true, data: tests };
  } catch (error) {
    console.error('Error fetching listening tests with stats:', error);
    return { success: false, message: 'Failed to fetch tests', data: [] };
  }
}

// Migrate reading tests JSON files to Firestore
export async function migrateReadingTests() {
  try {
    // Path to the reading tests directory
    const testsDirectory = path.join(process.cwd(), 'public', 'readingTests');
    
    if (!fs.existsSync(testsDirectory)) {
      return { success: false, message: 'Reading tests directory not found' };
    }

    const files = fs.readdirSync(testsDirectory).filter(file => file.endsWith('.json'));
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(testsDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Reading tests have a nested 'test' property, extract it
        const testData: any = jsonData.test || jsonData;
        
        // Generate ID from filename if not present
        const testId = testData.id || file.replace('.json', '');

        // Check if test already exists
        const existingTest = await db.collection('reading-tests').doc(testId).get();
        
        if (existingTest.exists) {
          results.push({
            file,
            status: 'skipped',
            message: 'Test already exists in Firestore'
          });
          continue;
        }

        // Add metadata timestamps if not present
        const testWithMetadata: any = {
          ...testData,
          id: testId,
          metadata: {
            ...testData.metadata,
            createdAt: testData.metadata?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };

        // Save to Firestore
        await db.collection('reading-tests').doc(testId).set(testWithMetadata);

        results.push({
          file,
          status: 'success',
          message: 'Successfully migrated to Firestore'
        });
        successCount++;

      } catch (error) {
        console.error(`Error migrating ${file}:`, error);
        results.push({
          file,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Migration completed: ${successCount} successful, ${errorCount} errors`,
      results,
      summary: {
        totalFiles: files.length,
        successful: successCount,
        errors: errorCount,
        skipped: files.length - successCount - errorCount
      }
    };

  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: 'Migration failed' };
  }
}

// Check reading tests migration status
export async function checkReadingMigrationStatus() {
  try {
    // Count JSON files
    const testsDirectory = path.join(process.cwd(), 'public', 'readingTests');
    let jsonFileCount = 0;
    
    if (fs.existsSync(testsDirectory)) {
      const files = fs.readdirSync(testsDirectory).filter(file => file.endsWith('.json'));
      jsonFileCount = files.length;
    }

    // Count Firestore documents
    const snapshot = await db.collection('reading-tests').get();
    const firestoreCount = snapshot.size;

    return {
      success: true,
      data: {
        jsonFiles: jsonFileCount,
        firestoreDocuments: firestoreCount,
        migrationNeeded: jsonFileCount > firestoreCount
      }
    };

  } catch (error) {
    console.error('Error checking reading migration status:', error);
    return { success: false, message: 'Failed to check migration status' };
  }
}

// Get reading tests with statistics for admin
export async function getReadingTestsWithStats() {
  try {
    const snapshot = await db.collection('reading-tests').orderBy('metadata.createdAt', 'desc').get();
    const tests = [];

    for (const doc of snapshot.docs) {
      const testData = { id: doc.id, ...doc.data() } as any;
      
      // Get test statistics (if you have a results collection)
      const statsSnapshot = await db
        .collection('reading-test-results')
        .where('testId', '==', doc.id)
        .get();

      const results = statsSnapshot.docs.map(doc => doc.data());
      const stats = {
        totalAttempts: results.length,
        averageScore: results.length > 0 
          ? results.reduce((sum, result: any) => sum + result.score.percentage, 0) / results.length 
          : 0,
        averageBandScore: results.length > 0 
          ? results.reduce((sum, result: any) => sum + result.bandScore, 0) / results.length 
          : 0,
      };

      tests.push({ ...testData, stats });
    }

    return { success: true, data: tests };
  } catch (error) {
    console.error('Error fetching reading tests with stats:', error);
    return { success: false, message: 'Failed to fetch tests', data: [] };
  }
}

// Create/upload a reading test
export async function createReadingTest(testData: any) {
  try {
    const testId = testData.id || `reading_${Date.now()}`;
    
    const testWithMetadata: any = {
      ...testData,
      id: testId,
      metadata: {
        ...testData.metadata,
        createdAt: testData.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };

    await db.collection('reading-tests').doc(testId).set(testWithMetadata);

    return { success: true, message: 'Reading test created successfully', testId };
  } catch (error) {
    console.error('Error creating reading test:', error);
    return { success: false, message: 'Failed to create reading test' };
  }
}

// Delete a reading test
export async function deleteReadingTest(testId: string) {
  try {
    await db.collection('reading-tests').doc(testId).delete();
    
    // Optionally delete associated results
    const resultsSnapshot = await db.collection('reading-test-results').where('testId', '==', testId).get();
    const batch = db.batch();
    resultsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return { success: true, message: 'Reading test deleted successfully' };
  } catch (error) {
    console.error('Error deleting reading test:', error);
    return { success: false, message: 'Failed to delete reading test' };
  }
}

// Migrate writing tests JSON files to Firestore
export async function migrateWritingTests() {
  try {
    // Path to the writing tests directory
    const testsDirectory = path.join(process.cwd(), 'public', 'writingTests');
    
    if (!fs.existsSync(testsDirectory)) {
      return { success: false, message: 'Writing tests directory not found' };
    }

    const files = fs.readdirSync(testsDirectory).filter(file => file.endsWith('.json'));
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(testsDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const testData = JSON.parse(fileContent);
        
        // Generate ID from filename
        const testId = file.replace('.json', '');

        // Check if test already exists
        const existingTest = await db.collection('writingTests').doc(testId).get();
        
        if (existingTest.exists) {
          results.push({
            file,
            status: 'skipped',
            message: 'Test already exists in Firestore'
          });
          continue;
        }

        // Add metadata and id to test data
        const testWithMetadata = {
          ...testData,
          id: testId,
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        };

        // Save to Firestore
        await db.collection('writingTests').doc(testId).set(testWithMetadata);

        results.push({
          file,
          status: 'success',
          message: 'Successfully migrated to Firestore'
        });
        successCount++;

      } catch (error) {
        console.error(`Error migrating ${file}:`, error);
        results.push({
          file,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Migration completed: ${successCount} successful, ${errorCount} errors`,
      results,
      summary: {
        totalFiles: files.length,
        successful: successCount,
        errors: errorCount,
        skipped: files.length - successCount - errorCount
      }
    };

  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: 'Migration failed' };
  }
}

// Check writing tests migration status
export async function checkWritingMigrationStatus() {
  try {
    // Count JSON files
    const testsDirectory = path.join(process.cwd(), 'public', 'writingTests');
    let jsonFileCount = 0;
    
    if (fs.existsSync(testsDirectory)) {
      const files = fs.readdirSync(testsDirectory).filter(file => file.endsWith('.json'));
      jsonFileCount = files.length;
    }

    // Count Firestore documents
    const snapshot = await db.collection('writingTests').get();
    const firestoreCount = snapshot.size;

    return {
      success: true,
      data: {
        jsonFiles: jsonFileCount,
        firestoreDocuments: firestoreCount,
        migrationNeeded: jsonFileCount > firestoreCount
      }
    };

  } catch (error) {
    console.error('Error checking writing migration status:', error);
    return { success: false, message: 'Failed to check migration status' };
  }
}

// Get writing tests with statistics for admin
export async function getWritingTestsWithStats() {
  try {
    const snapshot = await db.collection('writingTests').orderBy('metadata.createdAt', 'desc').get();
    const tests = [];

    for (const doc of snapshot.docs) {
      const testData = { id: doc.id, ...doc.data() };
      
      // Get test statistics
      const statsSnapshot = await db
        .collection('writing-test-results')
        .where('testId', '==', doc.id)
        .get();

      const results = statsSnapshot.docs.map(doc => doc.data());
      const stats = {
        totalAttempts: results.length,
        averageBandScore: results.length > 0 
          ? results.reduce((sum, result: any) => sum + (result.overallBandScore || 0), 0) / results.length 
          : 0,
      };

      tests.push({ ...testData, stats });
    }

    return { success: true, data: tests };
  } catch (error) {
    console.error('Error fetching writing tests with stats:', error);
    return { success: false, message: 'Failed to fetch tests', data: [] };
  }
}

// Create/upload a writing test
export async function createWritingTest(testData: any) {
  try {
    const testId = testData.id || `writingTest${Date.now()}`;
    
    const testWithMetadata = {
      ...testData,
      id: testId,
      metadata: {
        createdAt: testData.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };

    await db.collection('writingTests').doc(testId).set(testWithMetadata);

    return { success: true, message: 'Writing test created successfully', testId };
  } catch (error) {
    console.error('Error creating writing test:', error);
    return { success: false, message: 'Failed to create writing test' };
  }
}

// Delete a writing test
export async function deleteWritingTest(testId: string) {
  try {
    await db.collection('writingTests').doc(testId).delete();
    
    // Optionally delete associated results
    const resultsSnapshot = await db.collection('writing-test-results').where('testId', '==', testId).get();
    const batch = db.batch();
    resultsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return { success: true, message: 'Writing test deleted successfully' };
  } catch (error) {
    console.error('Error deleting writing test:', error);
    return { success: false, message: 'Failed to delete writing test' };
  }
}
