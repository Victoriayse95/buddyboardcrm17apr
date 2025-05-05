'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { addRedemption } from '@/services/redemptionService';
import { addNotification } from '@/services/notificationService';

export default function AddRedemption() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    month: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    name: '',
    perks: '',
    contactNumber: '',
    email: '',
    terms: '',
    redemptionLink: '',
    signUpLink: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (field: 'dateFrom' | 'dateTo', date: Date | null) => {
    setFormState(prev => ({
      ...prev,
      [field]: date,
      // If it's the first date field and month isn't set yet, set the month automatically
      ...(field === 'dateFrom' && !prev.month && date ? { month: format(date, 'MMMM') } : {})
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name || !formState.dateFrom || !formState.dateTo) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const redemptionData = {
        month: formState.month,
        dateFrom: formState.dateFrom ? format(formState.dateFrom, 'yyyy-MM-dd') : '',
        dateTo: formState.dateTo ? format(formState.dateTo, 'yyyy-MM-dd') : '',
        name: formState.name,
        perks: formState.perks,
        contactNumber: formState.contactNumber,
        email: formState.email,
        terms: formState.terms,
        redemptionLink: formState.redemptionLink,
        signUpLink: formState.signUpLink,
        notes: formState.notes,
        status: 'To Redeem' as const
      };
      
      await addRedemption(redemptionData);
      await addNotification(`New redemption added: ${formState.name}`);
      
      router.push('/all-redemptions');
    } catch (err) {
      console.error('Error adding redemption:', err);
      setError('Failed to add redemption. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Redemption</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month">
              Redemption Month*
            </label>
            <input
              id="month"
              name="month"
              type="text"
              value={formState.month}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateFrom">
              Redemption Date (From)*
            </label>
            <DatePicker
              id="dateFrom"
              selected={formState.dateFrom}
              onChange={(date) => handleDateChange('dateFrom', date)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateTo">
              Redemption Date (To)*
            </label>
            <DatePicker
              id="dateTo"
              selected={formState.dateTo}
              onChange={(date) => handleDateChange('dateTo', date)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Redemption Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formState.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="perks">
              Redemption Perks*
            </label>
            <textarea
              id="perks"
              name="perks"
              value={formState.perks}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
              Contact Number
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              type="text"
              value={formState.contactNumber}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="terms">
              Redemption Terms
            </label>
            <textarea
              id="terms"
              name="terms"
              value={formState.terms}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="redemptionLink">
              Redemption Link
            </label>
            <input
              id="redemptionLink"
              name="redemptionLink"
              type="url"
              value={formState.redemptionLink}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signUpLink">
              Sign-Up Link
            </label>
            <input
              id="signUpLink"
              name="signUpLink"
              type="url"
              value={formState.signUpLink}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Saving...' : 'Save Redemption'}
          </button>
        </div>
      </form>
    </div>
  );
} 