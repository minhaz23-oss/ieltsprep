import React from 'react';
import { requireAdmin } from '@/lib/auth/server';
import { checkMigrationStatus } from '@/lib/actions/admin.actions';
import AdminPageClient from './AdminPageClient';

/**
 * Admin Page - Server Component
 * Verifies admin authentication on the server before rendering
 * This provides enterprise-level security with server-side checks
 */
const AdminPage = async () => {
  // Server-side authentication check - will redirect if not admin
  const user = await requireAdmin();
  
  // Fetch migration status on the server
  const migrationResult = await checkMigrationStatus();
  const initialMigrationStatus = migrationResult.success && migrationResult.data 
    ? migrationResult.data 
    : null;

  return (
    <AdminPageClient 
      user={user} 
      initialMigrationStatus={initialMigrationStatus} 
    />
  );
};

export default AdminPage;