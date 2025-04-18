'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

const registerSchema = yup.object({
  displayName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
}).required();

export default function LoginPage() {
  const { login, register: registerUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const loginForm = useForm({
    resolver: yupResolver(loginSchema)
  });

  const registerForm = useForm({
    resolver: yupResolver(registerSchema)
  });

  const onLoginSubmit = async (data: { email: string; password: string }) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login form error:', error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: { displayName: string; email: string; password: string }) => {
    try {
      setLoading(true);
      await registerUser(data.email, data.password, data.displayName);
      registerForm.reset();
      setIsRegisterMode(false);
      toast.success('Registration successful! You can now log in.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegisterMode ? 'Create a new account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isRegisterMode ? (
            // Register Form
            <form className="space-y-6" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="displayName"
                    type="text"
                    {...registerForm.register('displayName')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerForm.formState.errors.displayName && (
                    <p className="mt-2 text-sm text-red-600">{registerForm.formState.errors.displayName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="reg-email"
                    type="email"
                    {...registerForm.register('email')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="reg-password"
                    type="password"
                    {...registerForm.register('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-2 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register('confirmPassword')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          ) : (
            // Login Form
            <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    {...loginForm.register('email')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    {...loginForm.register('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-2 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={toggleMode}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 