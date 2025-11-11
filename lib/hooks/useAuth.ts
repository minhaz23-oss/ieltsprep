'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '@/firebase/client'
import { doc, getDoc } from 'firebase/firestore';

/**
 * Simplified useAuth hook
 * 
 * Single source of truth: Server session cookie
 * Firebase client auth is only used during sign-in flow
 * After sign-in, we rely entirely on server-side session validation
 */

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  subscriptionTier: 'free' | 'premium';
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Check server session first (single source of truth)
        const response = await fetch('/api/validate-session', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.valid && data.user) {
            setUser(data.user);
            setLoading(false);
            return;
          }
        }

        // No valid server session - check if Firebase has an active user
        // This helps during the sign-in flow before session cookie is set
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser && isMounted) {
            // Firebase user exists but no session cookie yet
            // Fetch user data from Firestore
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: userData.name || '',
                  subscriptionTier: userData.subscriptionTier || 'free'
                });
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          } else if (isMounted) {
            setUser(null);
          }
          if (isMounted) {
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    const cleanup = checkAuth();
    
    return () => {
      isMounted = false;
      if (cleanup instanceof Promise) {
        cleanup.then(unsub => {
          if (typeof unsub === 'function') unsub();
        });
      }
    };
  }, []);

  return {
    user,
    userProfile: user, // For backward compatibility
    loading,
    isAuthenticated: !!user,
    isPremium: user?.subscriptionTier === 'premium'
  };
}
