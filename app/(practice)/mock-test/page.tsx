import React from 'react'
import Link from 'next/link'
import { requireAuth, isPremiumUser } from '@/lib/auth/server';
import MockTestLibrary from '@/components/MockTestLibrary';

const MockTestPage = async () => {
  // Require authentication to access this page
  const user = await requireAuth();
  const userIsPremium = await isPremiumUser();
  
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/exercise" className="text-primary hover:text-red-700 flex items-center space-x-2 transition-colors">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base">Back to Exercises</span>
        </Link>
      </div>

      {/* Mock Test Library */}
      <MockTestLibrary userIsPremium={userIsPremium} />
    </div>
  )
}

export default MockTestPage