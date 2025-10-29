/**
 * Script to populate Firestore with mock test metadata
 * Run this script once to create 32 mock tests that reference existing test collections
 * 
 * Usage: npx tsx scripts/populateMockTests.ts
 */

// Load environment variables FIRST before any Firebase imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

import { db } from '../firebase/admin';
import { MockTest } from '../types/mockTest';

async function populateMockTests() {
  console.log('Starting mock test population...');
  console.log('Creating 32 mock tests from existing test collections...\n');
  
  try {
    const batch = db.batch();
    let count = 0;

    // Listening and Reading tests: listening13_t1 to listening20_t4 (8 versions × 4 tests = 32)
    // We'll map them sequentially: test 1-4 from version 13, test 5-8 from version 14, etc.
    const testMapping = [];
    for (let version = 13; version <= 20; version++) {
      for (let testNum = 1; testNum <= 4; testNum++) {
        testMapping.push({ version, testNum });
      }
    }

    // Create 32 mock tests
    for (let i = 0; i < 32; i++) {
      const mockTestNumber = i + 1;
      const mockTestId = `mock-test-${mockTestNumber}`;
      const mockTestRef = db.collection('mockTests').doc(mockTestId);

      const { version, testNum } = testMapping[i];
      const listeningTestId = `listening${version}_t${testNum}`;
      const readingTestId = `reading${version}_t${testNum}`;
      
      // Cycle through writing tests (1-47), wrapping around if needed
      const writingTestNumber = (i % 47) + 1;
      const writingTestId = `writingTest${writingTestNumber}`;

      const mockTest: Omit<MockTest, 'id'> = {
        title: `IELTS Academic Mock Test ${mockTestNumber}`,
        description: `Full-length IELTS Academic practice test with all four sections. Complete exam simulation under real test conditions.`,
        isPremium: mockTestNumber > 2, // First 2 tests are free, rest are premium
        createdAt: new Date(),
        sections: {
          listening: {
            testId: listeningTestId,
            duration: 30,
            order: 1
          },
          reading: {
            testId: readingTestId,
            duration: 60,
            order: 2
          },
          writing: {
            testId: writingTestId,
            duration: 60,
            order: 3
          },
          speaking: {
            testId: `vapi-speaking`, // Speaking uses VAPI AI, not Firestore documents
            duration: 15,
            order: 4
          }
        }
      };

      batch.set(mockTestRef, mockTest);
      count++;

      console.log(
        `Created mock test ${mockTestNumber}/32: ${mockTestId}\n` +
        `  └─ Listening: ${listeningTestId}\n` +
        `  └─ Reading: ${readingTestId}\n` +
        `  └─ Writing: ${writingTestId}\n` +
        `  └─ Speaking: VAPI AI`
      );
    }

    // Commit the batch
    await batch.commit();
    console.log(`\n✅ Successfully created ${count} mock tests!`);
    console.log('\n📊 Distribution:');
    console.log('   • Free tests: 2');
    console.log('   • Premium tests: 30');
    console.log('   • Listening versions used: 13-20 (4 tests each)');
    console.log('   • Reading versions used: 13-20 (4 tests each)');
    console.log('   • Writing tests cycled through: 1-47');
    console.log('\nMock tests collection is now ready to use.');
    
  } catch (error) {
    console.error('Error populating mock tests:', error);
    throw error;
  }
}

// Run the script
populateMockTests()
  .then(() => {
    console.log('\n🎉 Mock test population completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Mock test population failed:', error);
    process.exit(1);
  });
