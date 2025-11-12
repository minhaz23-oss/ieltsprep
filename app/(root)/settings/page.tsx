import { requireAuth } from '@/lib/auth/server';
import AccountSettingsClient from './AccountSettingsClient';

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-black mb-6">Account Settings</h1>
      <AccountSettingsClient user={user} />
    </div>
  );
}
