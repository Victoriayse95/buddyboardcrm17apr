import React, { useState } from 'react';
import { FaDog, FaCat, FaUser, FaPaw } from 'react-icons/fa';
import { useAuth } from '@/lib/auth';

const roles = [
  { key: 'customer', label: 'Customer', icon: <FaUser className="text-pink-400 text-2xl" /> },
  { key: 'provider', label: 'Service Provider', icon: <FaPaw className="text-yellow-500 text-2xl" /> },
];

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selected: 'customer' | 'provider') => {
    setRole(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await signUp(form.email, form.password, form.name, role);
      } else {
        await signIn(form.email, form.password);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <FaDog className="text-4xl text-orange-400" />
          <span className="text-3xl font-extrabold text-orange-500 tracking-tight">BuddyBoard</span>
          <FaCat className="text-4xl text-pink-400" />
        </div>
        <div className="flex gap-4 mb-6">
          {roles.map((r) => (
            <button
              key={r.key}
              className={`flex flex-col items-center px-6 py-3 rounded-xl border-2 transition-all duration-200 font-semibold text-lg shadow-sm ${role === r.key ? 'bg-orange-100 border-orange-400 scale-105' : 'bg-white border-gray-200 hover:bg-orange-50'}`}
              onClick={() => handleRoleSelect(r.key as 'customer' | 'provider')}
              type="button"
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="rounded-xl border-2 border-gray-200 px-4 py-2 focus:outline-none focus:border-orange-400"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="rounded-xl border-2 border-gray-200 px-4 py-2 focus:outline-none focus:border-orange-400"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="rounded-xl border-2 border-gray-200 px-4 py-2 focus:outline-none focus:border-orange-400"
            value={form.password}
            onChange={handleChange}
            required
          />
          {isSignUp && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="rounded-xl border-2 border-gray-200 px-4 py-2 focus:outline-none focus:border-orange-400"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 rounded-xl transition-all duration-200 mt-2 shadow-lg"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <div className="mt-4 text-gray-600 text-sm">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button className="text-orange-500 font-bold" onClick={() => setIsSignUp(false)}>
                Log In
              </button>
            </>
          ) : (
            <>
              New to BuddyBoard?{' '}
              <button className="text-orange-500 font-bold" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 