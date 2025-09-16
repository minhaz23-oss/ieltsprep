"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ListeningTestManager from '@/components/admin/ListeningTestManager';
import { toast } from 'sonner';

const AdminPage = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated || !user) {
        toast.error('Please sign in to access admin panel');
        router.push('/sign-in');
        return;
      }

      try {
        // Check if user has admin privileges
        const response = await fetch('/api/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.uid }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isAdmin) {
            setIsAdmin(true);
          } else {
            toast.error('Access denied. Admin privileges required.');
            router.push('/dashboard');
          }
        } else {
          toast.error('Failed to verify admin status');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying admin access');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border-2 border-red-300 p-8 max-w-md mx-auto text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-2xl font-bold text-black mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have admin privileges to access this page.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-black">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage IELTS tests and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.email}</span>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="py-8">
        <ListeningTestManager />
      </div>
    </div>
  );
};

export default AdminPage;