import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Clears the server-side session cookie when client detects invalid session
 * Called by useAuth when session validation fails
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.set('session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    console.log('[clear-session] Server session cookie cleared');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session cleared successfully' 
    });
  } catch (error) {
    console.error('[clear-session] Error clearing session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear session' },
      { status: 500 }
    );
  }
}