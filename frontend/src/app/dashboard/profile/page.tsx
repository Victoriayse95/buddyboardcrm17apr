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

// Define UserProfile type if it's not properly imported elsewhere
interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
  };
}

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
      theme: user.preferences?.theme || 'system',
      notifications: user.preferences?.notifications || true
    });
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (user) {
        await updateUserProfile(user.uid, {
          displayName: formState.displayName,
          phoneNumber: formState.phoneNumber
        });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.currentPassword || !formState.newEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      if (user) {
        await updateUserEmail(formState.currentPassword, formState.newEmail);
        setFormState({
          ...formState,
          currentPassword: '',
          newEmail: ''
        });
        toast.success('Email updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast.error(error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.currentPassword || !formState.newPassword || !formState.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formState.newPassword !== formState.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      if (user) {
        await updateUserPassword(formState.currentPassword, formState.newPassword);
        setFormState({
          ...formState,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB');
      return;
    }

    try {
      setPhotoLoading(true);
      if (user.uid) {
        await uploadProfilePhoto(user.uid, file);
        toast.success('Profile photo updated');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setPhotoLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !user.uid) return;
    try {
      setPhotoLoading(true);
      await deleteProfilePhoto(user.uid);
      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove profile photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your account information and preferences.
          </p>

          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>

          {activeTab === 'profile' && (
            <div className="mt-6">
              <div className="flex items-center mb-6">
                <div className="relative">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-24 w-24 text-gray-300" />
                  )}
                  {photoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                <div className="ml-5">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                      Change
                    </button>
                    {user?.photoURL && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                        Remove
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG or GIF. Max size of 5MB.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formState.displayName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formState.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="mt-6 space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Change Email</h3>
                <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formState.currentPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                      New Email
                    </label>
                    <input
                      type="email"
                      id="newEmail"
                      name="newEmail"
                      value={formState.newEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Updating...
                        </div>
                      ) : (
                        'Update Email'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="currentPasswordForPw" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPasswordForPw"
                      name="currentPassword"
                      value={formState.currentPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formState.newPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formState.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Updating...
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="mt-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <div className="mt-1 flex items-center">
                    <select
                      id="theme"
                      name="theme"
                      value={formState.theme}
                      onChange={handleSelectChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                    <div className="ml-3">
                      {formState.theme === 'light' && <SunIcon className="h-5 w-5 text-yellow-500" />}
                      {formState.theme === 'dark' && <MoonIcon className="h-5 w-5 text-indigo-500" />}
                      {formState.theme === 'system' && (
                        <div className="flex items-center">
                          <SunIcon className="h-5 w-5 text-yellow-500" />
                          <span className="mx-1">/</span>
                          <MoonIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="notifications" className="block text-sm font-medium text-gray-700">
                      Enable Notifications
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        name="notifications"
                        checked={formState.notifications}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        {formState.notifications ? (
                          <BellIcon className="h-5 w-5 text-indigo-500" />
                        ) : (
                          <BellSlashIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Receive notifications about important updates and reminders.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 