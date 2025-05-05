'use client';

import React, { useState, useEffect } from 'react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { getAllRedemptions, updateRedemption } from '@/services/redemptionService';
import { Redemption, RedemptionStatus } from '@/types';

export default function Home() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        setLoading(true);
        const allRedemptions = await getAllRedemptions();
        setRedemptions(allRedemptions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch redemptions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRedemptions();
  }, []);

  const getCurrentMonthRedemptions = () => {
    const currentDate = new Date();
    const currentMonth = format(currentDate, 'MMMM');
    
    return redemptions.filter(redemption => {
      // Check if redemption is for the current month
      return redemption.month === currentMonth;
    }).map(redemption => {
      // Determine if redemption is expiring soon (within 7 days)
      const today = new Date();
      const endDate = new Date(redemption.dateTo);
      const isExpiringSoon = isAfter(endDate, today) && isBefore(endDate, addDays(today, 7));
      
      // Check if redemption has expired
      const hasExpired = isBefore(endDate, today);
      
      // Update the status based on the dates
      let status: RedemptionStatus = redemption.status;
      
      if (hasExpired && status !== 'Redeemed') {
        status = 'Expired';
      } else if (!hasExpired && status !== 'Redeemed') {
        status = 'To Redeem';
      }
      
      return {
        ...redemption,
        status,
        isExpiringSoon,
      };
    });
  };

  const handleStatusChange = async (id: string, newStatus: RedemptionStatus) => {
    try {
      await updateRedemption(id, { status: newStatus });
      setRedemptions(prevRedemptions => 
        prevRedemptions.map(redemption => 
          redemption.id === id ? { ...redemption, status: newStatus } : redemption
        )
      );
    } catch (err) {
      console.error('Error updating redemption status:', err);
      setError('Failed to update redemption status. Please try again.');
    }
  };

  const currentMonthRedemptions = getCurrentMonthRedemptions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Current Month Redemptions</h1>
      {currentMonthRedemptions.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          <p>No redemptions available for the current month.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="table-header">Name</th>
                <th scope="col" className="table-header">Valid Period</th>
                <th scope="col" className="table-header">Perks</th>
                <th scope="col" className="table-header">Status</th>
                <th scope="col" className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMonthRedemptions.map((redemption) => (
                <tr 
                  key={redemption.id} 
                  className={`
                    ${redemption.status === 'Redeemed' ? 'bg-green-50' : ''} 
                    ${redemption.isExpiringSoon && redemption.status !== 'Redeemed' ? 'bg-yellow-50' : ''}
                    ${redemption.status === 'Expired' ? 'bg-gray-100' : ''}
                  `}
                >
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">{redemption.name}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-500">
                      {redemption.dateFrom} to {redemption.dateTo}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-500">{redemption.perks}</div>
                  </td>
                  <td className="table-cell">
                    <select
                      value={redemption.status}
                      onChange={(e) => handleStatusChange(redemption.id, e.target.value as RedemptionStatus)}
                      className={`
                        rounded-full px-3 py-1 text-sm font-medium
                        ${redemption.status === 'Redeemed' ? 'bg-green-100 text-green-800' : ''}
                        ${redemption.status === 'To Redeem' ? 'bg-blue-100 text-blue-800' : ''}
                        ${redemption.status === 'Expired' ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                    >
                      <option value="To Redeem">To Redeem</option>
                      <option value="Redeemed">Redeemed</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </td>
                  <td className="table-cell text-right">
                    {redemption.redemptionLink && (
                      <a href={redemption.redemptionLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900 mr-4">
                        Redeem
                      </a>
                    )}
                    {redemption.signUpLink && (
                      <a href={redemption.signUpLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900">
                        Sign Up
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 