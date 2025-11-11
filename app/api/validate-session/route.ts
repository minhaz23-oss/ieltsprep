import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server';

/**
 * Validates if the server-side session is active
 * Used by client-side to sync authentication state
 */
export async function GET() {
  console.log('🔍 validate-session: API called');
  try {
    const { isAuthenticated, user } = await verifyAuth();
    console.log('🔍 validate-session: verifyAuth result:', { isAuthenticated, userEmail: user?.email });
    
    if (isAuthenticated && user) {
      console.log('🔍 validate-session: Session valid, returning 200');
      return NextResponse.json({ 
        valid: true, 
        user: {
          uid: user.uid,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier
        }
      }, { status: 200 });
    }
    
    console.log('🔍 validate-session: Session invalid, returning 401');
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    console.error('🔍 validate-session: Session validation error:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
