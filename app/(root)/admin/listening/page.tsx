"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ListeningTestManager from '@/components/admin/ListeningTestManager';
import { toast } from 'sonner';

const AdminListeningPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<{
    jsonFiles: number;
    firestoreDocuments: number;
    migrationNeeded: boolean;
  } | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
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
          setIsAdmin(data.isAdmin);

          if (data.isAdmin) {
            // Check migration status using server action
            const { checkMigrationStatus } = await import('@/lib/actions/admin.actions');
            const migrationResult = await checkMigrationStatus();
            if (migrationResult.success && migrationResult.data) {
              setMigrationStatus(migrationResult.data);
            }
          }
        } else {
          console.error('Failed to verify admin status');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  const handleMigration = async () => {
    if (!confirm('Are you sure you want to migrate all JSON files to Firestore? This action cannot be undone.')) {
      return;
    }

    try {
      setMigrating(true);
      const { migrateListeningTests, checkMigrationStatus } = await import('@/lib/actions/admin.actions');
      const result = await migrateListeningTests();

      if (result.success && result.summary) {
        toast.success(`Migration completed! ${result.summary.successful} tests migrated successfully.`);
        
        // Refresh migration status
        const migrationResult = await checkMigrationStatus();
        if (migrationResult.success && migrationResult.data) {
          setMigrationStatus(migrationResult.data);
        }
      } else {
        toast.error(result.message || 'Migration failed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center border-2 border-red-300">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center border-2 border-red-300">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel - Listening Tests</h1>
          <p className="text-gray-600 mt-1">Manage IELTS listening tests and migrate data</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Migration Section */}
        {migrationStatus && migrationStatus.migrationNeeded && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Migration Required</h3>
                <p className="text-yellow-700 mb-4">
                  You have {migrationStatus.jsonFiles} JSON files but only {migrationStatus.firestoreDocuments} tests in Firestore. 
                  Migrate your existing tests to the database for better performance and scalability.
                </p>
                <button
                  onClick={handleMigration}
                  disabled={migrating}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {migrating ? 'Migrating...' : 'Migrate Tests to Firestore'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Migration Status */}
        {migrationStatus && !migrationStatus.migrationNeeded && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Migration Complete</h3>
                <p className="text-green-700">
                  All {migrationStatus.firestoreDocuments} tests are successfully stored in Firestore.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Manager */}
        <ListeningTestManager isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default AdminListeningPage;