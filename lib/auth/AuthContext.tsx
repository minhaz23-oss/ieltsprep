'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/client'

interface AuthUser {
  uid: string
  email: string
  name: string
  subscriptionTier: 'free' | 'premium'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  isPremium: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Single source of truth: Check server session first
    const initializeAuth = async () => {
      try {
        // Check if server has valid session
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const { user: serverUser } = await response.json()
          setUser(serverUser)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Server session check failed:', error)
      }

      // No server session, check Firebase client
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Convert Firebase user to our user format
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            body: JSON.stringify({ uid: firebaseUser.uid })
          })
          
          if (response.ok) {
            const { user } = await response.json()
            setUser(user)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return unsubscribe
    }

    const cleanup = initializeAuth()
    return () => {
      if (cleanup instanceof Function) cleanup()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      await auth.signOut()
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isPremium: user?.subscriptionTier === 'premium',
    signOut: handleSignOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}