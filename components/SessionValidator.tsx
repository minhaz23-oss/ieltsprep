'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

/**
 * SessionValidator Component
 * Automatically clears invalid session cookies and handles auth state
 * This prevents the middleware redirect issue when session cookies are stale
 */
export default function SessionValidator() {
  const { user, loading, error } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't run on auth pages
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
    
    if (!loading && !user && !isAuthPage) {
      // If there's no user but we're not loading, check if there's a stale cookie
      const hasCookie = document.cookie.includes('session=');
      
      if (hasCookie) {
        // Clear the stale session cookie
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        console.log('Cleared stale session cookie');
        
        // If we're on a protected route, we'll be redirected by middleware after cookie is cleared
        // Force a router refresh to trigger middleware
        router.refresh();
      }
    }
  }, [user, loading, pathname, router]);

  // This component doesn't render anything
  return null;
}
