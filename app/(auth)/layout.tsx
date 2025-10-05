import React, { ReactNode } from 'react'
import { requireGuest } from '@/lib/auth/server'

/**
 * Auth Layout - for sign-in and sign-up pages
 * Automatically redirects authenticated users to dashboard
 * This runs on the server, providing instant redirects
 */
const AuthLayout = async ({children} : {children: ReactNode}) => {
  // Server-side check: redirect if already authenticated
  await requireGuest();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout;
