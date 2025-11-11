'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, db } from '@/firebase/client'
import { doc, onSnapshot } from 'firebase/firestore';

// Define a type for our user profile data
interface UserProfile {
  name: string;
  email: string;
  subscriptionTier: 'free' | 'premium';
}

// Server user data from session
interface ServerUser {
  uid: string;
  email: string;
  name: string;
  subscriptionTier: 'free' | 'premium';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true)

  // Check server session on mount
  useEffect(() => {
    console.log('🔍 useAuth: Checking server session on mount');
    const checkServerSession = async () => {
      try {
        const response = await fetch('/api/validate-session');
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 useAuth: Server session valid, user data:', data.user);
          setServerUser(data.user);
          // Also set user profile from server data
          setUserProfile({
            name: data.user.name,
            email: data.user.email,
            subscriptionTier: data.user.subscriptionTier
          });
          setLoading(false);
        } else {
          console.log('🔍 useAuth: No valid server session');
          setServerUser(null);
        }
      } catch (error) {
        console.error('🔍 useAuth: Server session check failed:', error);
        setServerUser(null);
      }
    };
    
    checkServerSession();
  }, []);

  useEffect(() => {
    console.log('🔍 useAuth: Setting up Firebase auth listener');
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 useAuth: Firebase auth state changed:', user ? 'User signed in' : 'User signed out');
      setUser(user);
      
      // Only handle loading state if we don't have server user
      if (!user && !serverUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [serverUser])

  useEffect(() => {
    if (user) {
      console.log('🔍 useAuth: Loading Firestore profile for Firebase user:', user.uid);
      // If we have a Firebase user, listen to their Firestore document
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          console.log('🔍 useAuth: Profile loaded from Firestore');
          setUserProfile(doc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsub();
    }
    // If no Firebase user, we rely on server session (handled in first useEffect)
  }, [user]);


  const authState = {
    user: user || (serverUser ? { email: serverUser.email, uid: serverUser.uid, displayName: serverUser.name } as User : null),
    userProfile,
    loading,
    isAuthenticated: !!user || !!serverUser,
    isPremium: userProfile?.subscriptionTier === 'premium' || serverUser?.subscriptionTier === 'premium',
  };
  
  console.log('🔍 useAuth: Current auth state:', {
    hasUser: !!user,
    hasServerUser: !!serverUser,
    userEmail: user?.email || serverUser?.email,
    hasProfile: !!userProfile,
    isAuthenticated: authState.isAuthenticated,
    isPremium: authState.isPremium,
    loading: authState.loading
  });
  
  return authState;
}
