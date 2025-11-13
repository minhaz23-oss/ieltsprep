'use server'

import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';

export interface UserProfile {
  name: string;
  email: string;
  subscriptionTier: 'free' | 'premium';
  // Qualification exam fields
  qualificationExam?: {
    hasPassed: boolean;
    attempts: number;
    lastAttemptAt?: any;
    passedAt?: any;
    premiumAccessMethod?: 'exam' | 'subscription';
    nextAttemptAvailableAt?: any;
  };
}

// Get current user from session cookie
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Get user profile from Firestore using server-side admin SDK
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data() as UserProfile;
      return userData;
    } else {
      // If no profile exists, create a default one
      const defaultProfile: UserProfile = {
        name: user.name || user.email || 'User',
        email: user.email || '',
        subscriptionTier: 'free'
      };
      
      // Optionally create the profile in Firestore
      await db.collection('users').doc(user.uid).set(defaultProfile);
      
      return defaultProfile;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Update user subscription tier
export async function updateUserSubscription(subscriptionTier: 'free' | 'premium'): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    await db.collection('users').doc(user.uid).update({
      subscriptionTier
    });

    return {
      success: true,
      message: 'Subscription updated successfully'
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return {
      success: false,
      message: 'Failed to update subscription'
    };
  }
}