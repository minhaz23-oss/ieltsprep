'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { migrateListeningTests, checkMigrationStatus } from '@/lib/actions/admin.actions';
import type { AuthUser } from '@/lib/auth/server';

interface MigrationStatus {
  jsonFiles: number;
  firestoreDocuments: number;
  migrationNeeded: boolean;
}

interface AdminPageClientProps {
  user: AuthUser;
  initialMigrationStatus: MigrationStatus | null;
}

/**
 * Admin Page Client Component
 * Handles all client-side interactions like migration
 * Receives authenticated user data from server component
 */
const AdminPageClient: React.FC<AdminPageClientProps> = ({ user, initialMigrationStatus }) => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(initialMigrationStatus);
  const [migrating, setMigrating] = useState(false);
  const router = useRouter();

  const handleMigration = async () => {
    if (!confirm('Are you sure you want to migrate all JSON files to Firestore? This action cannot be undone.')) {
      return;
    }

    try {
      setMigrating(true);
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
                Welcome, <span className="font-semibold">{user.email}</span>
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
        <div className="max-w-7xl mx-auto px-6">
          {/* Migration Section */}
          {migrationStatus && migrationStatus.migrationNeeded && (
            <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
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

          {/* Migration Complete Status */}
          {migrationStatus && !migrationStatus.migrationNeeded && (
            <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-lg p-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Listening Tests Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Listening Tests</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage IELTS listening tests, upload new tests, and migrate existing JSON files to Firestore.
              </p>
              <button
                onClick={() => router.push('/admin/listening')}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Manage Listening Tests
              </button>
            </div>

            {/* Reading Tests Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Reading Tests</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage IELTS reading tests, upload new tests, and migrate existing JSON files to Firestore.
              </p>
              <button
                onClick={() => router.push('/admin/reading')}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Manage Reading Tests
              </button>
            </div>

            {/* Writing Tests Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Writing Tests</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage IELTS writing tests, upload new tests, and migrate existing JSON files to Firestore.
              </p>
              <button
                onClick={() => router.push('/admin/writing')}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Manage Writing Tests
              </button>
            </div>

            {/* System Stats Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">System Stats</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View system statistics, user analytics, and test performance metrics.
              </p>
              <button
                className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>

            {/* User Management Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">User Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage user accounts, premium subscriptions, and access permissions.
              </p>
              <button
                className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageClient;
