'use client'

import { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface EmailVerificationBannerProps {
  userEmail: string;
  emailVerified: boolean;
}

export default function EmailVerificationBanner({ userEmail, emailVerified }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();

  // Don't show if email is already verified
  if (emailVerified) return null;

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
          await user.reload();
          
          if (user.emailVerified) {
            // Update the session cookie
            const idToken = await user.getIdToken(true);
            await fetch('/api/auth/refresh-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });
            
            // Refresh the page
            router.refresh();
          }
        }
      } catch (error) {
        // Silently fail - user can still manually refresh
      }
    };

    // Check immediately on mount
    checkVerification();

    // Then check every 5 seconds
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [router]);
  
  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setMessage('Too many requests. Please try again later.');
      } else {
        setMessage('Failed to send email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshVerification = async () => {
    setIsRefreshing(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      if (user) {
        // Reload user to get latest email verification status
        await user.reload();
        
        if (user.emailVerified) {
          // Update the session cookie with new verification status
          const idToken = await user.getIdToken(true); // Force refresh token
          await fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          
          setMessage('✅ Email verified successfully!');
          
          // Refresh the page to update UI
          setTimeout(() => {
            router.refresh();
          }, 1000);
        } else {
          setMessage('Email not yet verified. Please check your inbox and click the verification link.');
        }
      }
    } catch (error: any) {
      setMessage('Failed to refresh status. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Email Not Verified
          </p>
          <p className="mt-1 text-sm text-yellow-700">
            Please verify your email address <strong>{userEmail}</strong> to access all features.
          </p>
          {message && (
            <p className="mt-2 text-sm text-yellow-600 font-medium">
              {message}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={handleRefreshVerification}
              disabled={isRefreshing}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isRefreshing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Checking...
                </>
              ) : (
                'I Verified - Refresh Status'
              )}
            </Button>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              size="sm"
              variant="outline"
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
            >
              {isResending ? (
                <>
                  <div className="w-3 h-3 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>
            <Button
              onClick={() => setIsDismissed(true)}
              size="sm"
              variant="ghost"
              className="text-yellow-700 hover:text-yellow-900"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
