import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server';

/**
 * Validates if the server-side session is active
 * Used by client-side to sync authentication state
 */
export async function GET() {
  try {
    const { isAuthenticated } = await verifyAuth();
    
    if (isAuthenticated) {
      return NextResponse.json({ valid: true }, { status: 200 });
    }
    
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
