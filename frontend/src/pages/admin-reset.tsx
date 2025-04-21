import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import Head from 'next/head';

export default function AdminResetPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const createAdminAccount = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Create default admin account
      const email = 'admin@example.com';
      const password = 'Admin123!';
      
      // Check if user already exists
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          displayName: 'Admin User',
          photoURL: null,
          role: 'admin',
          phoneNumber: null,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
          preferences: {
            theme: 'system',
            notifications: true
          }
        });
        
        setSuccess(true);
        console.log('Admin account created successfully');
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('Admin account already exists. Please use the login page with admin@example.com and Admin123!');
        } else {
          throw err;
        }
      }
    } catch (error: any) {
      console.error('Error creating admin account:', error);
      setError(error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Admin Reset - BuddyBoard</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Account Reset
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page will create a default admin account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Account created successfully
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          Login credentials:<br />
                          Email: admin@example.com<br />
                          Password: Admin123!
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/login"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Go to Login
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="mb-4 bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={createAdminAccount}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Admin Account'}
                </button>
                
                <div className="mt-4 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Return to login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 