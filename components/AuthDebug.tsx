'use client'

import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Debug component to show current auth status
 * Add this to any page to see your authentication state
 * Remove before production!
 */
export default function AuthDebug() {
  const { user, loading, isAuthenticated, isPremium, emailVerified } = useAuth();

  if (loading) return <div className="p-4 bg-gray-100 rounded-md">Loading auth...</div>;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border-2 border-primary rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-primary mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1 text-sm">
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        {user && (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>UID:</strong> {user.uid?.slice(0, 8)}...</p>
            <p><strong>Email Verified:</strong> {emailVerified ? '✅ Yes' : '⚠️ No'}</p>
            <p><strong>Subscription:</strong> {user.subscriptionTier}</p>
            <p><strong>Premium:</strong> {isPremium ? '✅ Yes' : '❌ No'}</p>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">Remove AuthDebug before production</p>
    </div>
  );
}
