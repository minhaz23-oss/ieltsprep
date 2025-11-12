'use client'

import { useState } from 'react';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '@/components/FormField';
import { Form } from '@/components/ui/form';
import type { AuthUser } from '@/lib/auth/server';

interface AccountSettingsClientProps {
  user: AuthUser;
}

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AccountSettingsClient({ user }: AccountSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update profile
  const onUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsUpdatingProfile(true);
    setMessage(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: values.name,
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: values.name,
        updatedAt: new Date().toISOString(),
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change password
  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    setMessage(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error('Not authenticated');

      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        values.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, values.newPassword);

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      passwordForm.reset();
    } catch (error: any) {
      let errorMessage = 'Failed to change password';
      
      if (error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/invalid-login-credentials') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign in again before changing your password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setMessage({ type: 'success', text: 'Verification email sent!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification email' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Message */}
      {message && (
        <div className={`${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        } border rounded-md p-3`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            
            {/* Email verification status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.emailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">⚠ Not verified</span>
                    )}
                  </p>
                </div>
                {!user.emailVerified && (
                  <Button
                    onClick={handleResendVerification}
                    size="sm"
                    variant="outline"
                  >
                    Resend Verification
                  </Button>
                )}
              </div>
            </div>

            {/* Subscription status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">Subscription</p>
              <p className="text-sm text-gray-900 capitalize">{user.subscriptionTier}</p>
            </div>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                label="Full Name"
                placeholder="Enter your name"
              />

              <Button 
                type="submit" 
                className="btn-primary" 
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                label="Current Password"
                placeholder="Enter current password"
                type="password"
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                type="password"
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="Confirm new password"
                type="password"
              />

              <Button 
                type="submit" 
                className="btn-primary" 
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Changing Password...
                  </div>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
