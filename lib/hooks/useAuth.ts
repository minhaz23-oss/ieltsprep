'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '@/firebase/client'
import { doc, onSnapshot } from 'firebase/firestore';

// Define a type for our user profile data
interface UserProfile {
  name: string;
  email: string;
  subscriptionTier: 'free' | 'premium';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        // If user is null, clear profile and set loading to false
        setUserProfile(null);
        setLoading(false)
      }
      // The rest of the logic is handled by the Firestore listener below
    })

    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (user) {
      // If we have a user, listen for changes to their Firestore document
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          // This case might happen if the Firestore doc hasn't been created yet
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);


  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isPremium: userProfile?.subscriptionTier === 'premium',
  }
}
