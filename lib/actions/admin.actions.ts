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