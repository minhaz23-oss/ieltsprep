'use server'

import { cookies } from 'next/headers';
import { auth, db } from '@/firebase/admin';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Represents the authenticated user data from Firestore
 */
export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  subscriptionTier: 'free' | 'premium';
}

/**
 * Represents the result of authentication verification
 */
export interface AuthResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

/**
 * Verifies the session cookie and returns the authenticated user
 * This is the main server-side authentication check
 * 
 * @returns Promise<AuthResult> - Authentication status and user data
 */
export async function verifyAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return { isAuthenticated: false, user: null };
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    if (!decodedClaims) {
      return { isAuthenticated: false, user: null };
    }

    // Fetch user data from Firestore
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get();

    if (!userDoc.exists) {
      return { isAuthenticated: false, user: null };
    }

    const userData = userDoc.data();

    return {
      isAuthenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: userData?.email || decodedClaims.email || '',
        name: userData?.name || '',
        subscriptionTier: userData?.subscriptionTier || 'free',
      },
    };
  } catch (error) {
    console.error('Error verifying auth:', error);
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Gets the current authenticated user or null if not authenticated
 * Use this for pages where authentication is optional
 * 
 * @returns Promise<AuthUser | null> - The authenticated user or null
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { user } = await verifyAuth();
  return user;
}

/**
 * Requires authentication - redirects to sign-in if not authenticated
 * Use this at the top of page components that require authentication
 * 
 * @param redirectTo - Optional path to redirect after sign-in
 * @returns Promise<AuthUser> - The authenticated user (guaranteed to exist)
 */
export async function requireAuth(redirectTo?: string): Promise<AuthUser> {
  const { isAuthenticated, user } = await verifyAuth();

  if (!isAuthenticated || !user) {
    const redirectPath = redirectTo ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}` : '/sign-in';
    redirect(redirectPath);
  }

  return user;
}

/**
 * Requires guest (non-authenticated) - redirects to dashboard if authenticated
 * Use this for sign-in/sign-up pages to prevent authenticated users from accessing them
 * 
 * @returns Promise<void>
 */
export async function requireGuest(): Promise<void> {
  const { isAuthenticated } = await verifyAuth();

  if (isAuthenticated) {
    redirect('/dashboard');
  }
}

/**
 * Checks if the current user is an admin
 * 
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return false;
    }

    // Check admin status in users collection
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    return userData?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Requires admin privileges - redirects to dashboard if not admin
 * Use this at the top of admin page components
 * 
 * @returns Promise<AuthUser> - The authenticated admin user
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    redirect('/dashboard');
  }

  return user;
}

/**
 * Checks if the user has premium subscription
 * 
 * @returns Promise<boolean> - True if user has premium, false otherwise
 */
export async function isPremiumUser(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.subscriptionTier === 'premium';
}

/**
 * Gets user from session cookie in API route
 * Use this in API route handlers that need authentication
 * 
 * @param request - NextRequest object
 * @returns Promise<AuthUser | null> - The authenticated user or null
 */
export async function getUserFromToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    if (!decodedClaims) {
      return null;
    }

    // Fetch user data from Firestore
    const userDoc = await db.collection('users').doc(decodedClaims.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    return {
      uid: decodedClaims.uid,
      email: userData?.email || decodedClaims.email || '',
      name: userData?.name || '',
      subscriptionTier: userData?.subscriptionTier || 'free',
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}
