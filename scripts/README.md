# Mock Test Population Script

## Overview

This script populates your Firestore database with 32 IELTS Academic Mock Tests that reference your existing test collections.

## Test ID Mapping

The script creates 32 mock tests using:

### Listening Tests
- **Collection**: `listening-tests`
- **IDs Used**: `listening13_t1` through `listening20_t4`
- **Pattern**: 8 versions (13-20) × 4 tests each = 32 tests

### Reading Tests
- **Collection**: `reading-tests`
- **IDs Used**: `reading13_t1` through `reading20_t4`
- **Pattern**: Same as listening (8 versions × 4 tests = 32 tests)

### Writing Tests
- **Collection**: `writingTests`
- **IDs Used**: `writingTest1` through `writingTest47`
- **Pattern**: Cycles through all 47 tests (test 33+ reuse earlier writing tests)

### Speaking Tests
- **Type**: VAPI AI-powered conversations
- **ID**: `vapi-speaking` (no Firestore document needed)

## Mock Test Distribution

- **Free Tests**: Mock Test 1 & 2
- **Premium Tests**: Mock Test 3-32

## How to Run

### Prerequisites

1. Make sure your Firebase Admin credentials are set in `.env.local`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

2. Install `tsx` if you haven't already:
   ```bash
   npm install -g tsx
   ```

### Run the Script

```bash
npx tsx scripts/populateMockTests.ts
```

### Expected Output

```
Starting mock test population...
Creating 32 mock tests from existing test collections...

Created mock test 1/32: mock-test-1
  └─ Listening: listening13_t1
  └─ Reading: reading13_t1
  └─ Writing: writingTest1
  └─ Speaking: VAPI AI

Created mock test 2/32: mock-test-2
  └─ Listening: listening13_t2
  └─ Reading: reading13_t2
  └─ Writing: writingTest2
  └─ Speaking: VAPI AI

...

✅ Successfully created 32 mock tests!

📊 Distribution:
   • Free tests: 2
   • Premium tests: 30
   • Listening versions used: 13-20 (4 tests each)
   • Reading versions used: 13-20 (4 tests each)
   • Writing tests cycled through: 1-47

Mock tests collection is now ready to use.
```

## Verification

After running the script, verify in your Firestore console:

1. Navigate to Firestore Database
2. Look for the `mockTests` collection
3. You should see 32 documents: `mock-test-1` through `mock-test-32`
4. Each document should have:
   - `title`: "IELTS Academic Mock Test X"
   - `description`: Full test description
   - `isPremium`: `false` for tests 1-2, `true` for tests 3-32
   - `sections`: Object with listening, reading, writing, speaking references
   - `createdAt`: Timestamp

## Troubleshooting

### Error: Missing Firebase Admin environment variables

Make sure your `.env.local` file has all required Firebase Admin credentials.

### Error: Collection not found

Verify your collection names in Firestore match:
- `listening-tests`
- `reading-tests`
- `writingTests`
- `speakingTests` (not used by script but should exist)

### Error: Document not found

Verify that your listening and reading tests exist with the expected IDs:
- `listening13_t1` through `listening20_t4`
- `reading13_t1` through `reading20_t4`

## Re-running the Script

If you need to re-populate (for testing or updates):

1. The script will **overwrite** existing mock test documents with the same IDs
2. User sessions in `mockTestSessions` collection will NOT be affected
3. You can safely re-run the script to update test configurations

## Next Steps

After populating mock tests:

1. Navigate to `/mock-test` in your application
2. You should see all 32 mock tests listed
3. Tests 1-2 should be accessible to free users
4. Tests 3-32 should show "Upgrade to Premium" for free users
