import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('Starting to populate listening tests...');
    
    // Read all JSON files from public directory
    const publicDir = path.join(process.cwd(), 'public');
    const jsonFiles = fs.readdirSync(publicDir)
      .filter(file => file.startsWith('listeningTest') && file.endsWith('.json'));
    
    console.log('Found JSON files:', jsonFiles);
    const results = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(publicDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Extract test number from filename (listeningTest1.json -> 1)
      const match = file.match(/listeningTest(\d+)\.json/);
      if (!match) continue;
      
      const testNumber = match[1];
      const testId = `listening_test_${testNumber}`;
      
      console.log(`Processing ${file} -> ${testId}`);
      
      // Transform the data to match your database schema
      const testData = {
        id: testId,
        title: jsonData.title || `IELTS Listening Test ${testNumber}`,
        difficulty: jsonData.difficulty || 'medium',
        totalQuestions: 40,
        timeLimit: 40,
        sections: jsonData.sections || [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: 'json_import',
          version: '1.0'
        }
      };
      
      // Save to Firestore
      await db.collection('listening-tests').doc(testId).set(testData);
      console.log(`✅ Successfully saved ${testId}`);
      results.push(`Successfully saved ${testId}`);
    }
    
    // List all documents to verify
    const snapshot = await db.collection('listening-tests').get();
    const documentIds = snapshot.docs.map(doc => doc.id);
    
    return NextResponse.json({
      success: true,
      message: 'All listening tests have been populated!',
      results,
      documentIds
    });
    
  } catch (error) {
    console.error('Error populating listening tests:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}