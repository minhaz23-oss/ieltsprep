import { NextResponse } from 'next/server';
import { auth } from '@/firebase/admin';

/**
 * Test endpoint to verify Firebase Admin SDK setup
 */
export async function GET() {
  try {
    console.log('🔍 Testing Firebase Admin SDK...');
    console.log('🔍 Environment variables check:');
    console.log('- FIREBASE_PROJECT_ID exists:', !!process.env.FIREBASE_PROJECT_ID);
    console.log('- FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
    console.log('- FIREBASE_CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
    
    // Test if we can create a custom token (simple test that requires auth to work)
    const testUid = 'test-user-123';
    const customToken = await auth.createCustomToken(testUid);
    
    console.log('🔍 Firebase Admin SDK working! Custom token created.');
    
    return NextResponse.json({ 
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      tokenCreated: !!customToken
    }, { status: 200 });
    
  } catch (error) {
    console.error('🔍 Firebase Admin SDK test failed:', error);
    
    return NextResponse.json({ 
      success: false,
      message: 'Firebase Admin SDK configuration error',
      error: error instanceof Error ? error.message : 'Unknown error',
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID
    }, { status: 500 });
  }
}