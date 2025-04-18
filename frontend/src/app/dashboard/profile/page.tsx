'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  updateUserEmail,
  updateUserPassword,
  updateUserProfile,
  uploadProfilePhoto,
  deleteProfilePhoto
} from '@/lib/userProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import {
  UserCircleIcon,
  PencilIcon,
  XMarkIcon,
  ArrowPathIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  BellSlashIcon
} from '@heroicons/react/24/outline';

interface FormState {
  displayName: string;
  phoneNumber: string;
  currentPassword: string;
  newEmail: string;
  newPassword: string;
  confirmPassword: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formState, setFormState] = useState<FormState>({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
    theme: user?.preferences?.theme || 'system',
    notifications: user?.preferences?.notifications || true
  });

  // Update form state when user data is loaded
  if (user && formState.displayName === '' && user.displayName) {
    setFormState({
      ...formState,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber || '',
      theme: user.preferences.theme,
      notifications: user.preferences.notifications
    });
  }

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const updateData: any = {
        full_name: data.full_name,
        email: data.email,
      };

      if (data.new_password) {
        updateData.current_password = data.current_password;
        updateData.new_password = data.new_password;
      }

      // Mock API call
      // Simulate a delay for the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      /* Temporarily comment out actual API call
      await api.patch('/users/me', updateData);
      */
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your account information and password.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                {...register('full_name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.full_name && (
                <p className="mt-2 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Leave these fields empty if you don't want to change your password.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current_password"
                    {...register('current_password')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.current_password && (
                    <p className="mt-2 text-sm text-red-600">{errors.current_password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    {...register('new_password')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.new_password && (
                    <p className="mt-2 text-sm text-red-600">{errors.new_password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    {...register('confirm_password')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.confirm_password && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirm_password.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 