'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addRedemption } from '@/services/redemptionService';
import { addNotification } from '@/services/notificationService';
import { Redemption } from '@/types';
import { format } from 'date-fns';

export default function AddRedemption() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    month: '',
    dateFrom: '',
    dateTo: '',
    name: '',
    perks: '',
    contactNumber: '',
    emailAddress: '',
    terms: '',
    redemptionLink: '',
    signUpLink: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form fields
      const requiredFields = ['month', 'dateFrom', 'dateTo', 'name', 'perks'];
      const missingFields = requiredFields.filter(field => !formState[field as keyof typeof formState]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }
      
      // Create new redemption
      const newRedemption: Omit<Redemption, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        ...formState,
        status: 'To Redeem'
      };
      
      // Add redemption to database
      const addedRedemption = await addRedemption(newRedemption);
      
      // Create notification
      await addNotification({
        title: 'New Redemption Added',
        message: `New perk added: ${addedRedemption.name}`,
        isRead: false,
        relatedId: addedRedemption.id
      });
      
      // Navigate to homepage
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add redemption. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Redemption</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Month Selection */}
          <div>
            <label htmlFor="month" className="form-label required">Redemption Month</label>
            <select
              id="month"
              name="month"
              value={formState.month}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Select a month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="form-label required">Redemption Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Starbucks Birthday Drink"
              required
            />
          </div>
          
          {/* Date From */}
          <div>
            <label htmlFor="dateFrom" className="form-label required">Valid From</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={formState.dateFrom}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          {/* Date To */}
          <div>
            <label htmlFor="dateTo" className="form-label required">Valid To</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={formState.dateTo}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          {/* Perks */}
          <div className="md:col-span-2">
            <label htmlFor="perks" className="form-label required">Redemption Perks</label>
            <input
              type="text"
              id="perks"
              name="perks"
              value={formState.perks}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Free drink of your choice"
              required
            />
          </div>
          
          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="form-label">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formState.contactNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. 555-123-4567"
            />
          </div>
          
          {/* Email Address */}
          <div>
            <label htmlFor="emailAddress" className="form-label">Email Address</label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              value={formState.emailAddress}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. info@company.com"
            />
          </div>
          
          {/* Terms */}
          <div className="md:col-span-2">
            <label htmlFor="terms" className="form-label">Redemption Terms</label>
            <textarea
              id="terms"
              name="terms"
              value={formState.terms}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Must be a rewards member. Valid in-store or online."
              rows={3}
            />
          </div>
          
          {/* Redemption Link */}
          <div>
            <label htmlFor="redemptionLink" className="form-label">Redemption Link</label>
            <input
              type="url"
              id="redemptionLink"
              name="redemptionLink"
              value={formState.redemptionLink}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. https://company.com/redeem"
            />
          </div>
          
          {/* Sign-Up Link */}
          <div>
            <label htmlFor="signUpLink" className="form-label">Sign-Up Link</label>
            <input
              type="url"
              id="signUpLink"
              name="signUpLink"
              value={formState.signUpLink}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. https://company.com/signup"
            />
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Additional notes or reminders"
              rows={3}
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn-secondary mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Redemption'}
          </button>
        </div>
      </form>
    </div>
  );
} 