'use client';

import React, { useState, useEffect } from 'react';
import { getAllRedemptions, updateRedemption, deleteRedemption } from '@/services/redemptionService';
import { addNotification } from '@/services/notificationService';
import { Redemption, RedemptionStatus } from '@/types';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function AllRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Redemption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filtering state
  const [filters, setFilters] = useState({
    month: '',
    status: ''
  });
  
  // Editable cell state
  const [editableCell, setEditableCell] = useState<{id: string, field: keyof Redemption} | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        setLoading(true);
        const allRedemptions = await getAllRedemptions();
        setRedemptions(allRedemptions);
        setFilteredRedemptions(allRedemptions);
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

  // Apply search, sorting, and filtering
  useEffect(() => {
    let result = [...redemptions];
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(redemption => 
        redemption.name.toLowerCase().includes(lowerSearchTerm) ||
        redemption.perks.toLowerCase().includes(lowerSearchTerm) ||
        redemption.terms.toLowerCase().includes(lowerSearchTerm) ||
        redemption.notes.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply filters
    if (filters.month) {
      result = result.filter(redemption => redemption.month === filters.month);
    }
    
    if (filters.status) {
      result = result.filter(redemption => redemption.status === filters.status);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredRedemptions(result);
  }, [redemptions, searchTerm, sortField, sortDirection, filters]);

  const handleSort = (field: keyof Redemption) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCellEdit = (id: string, field: keyof Redemption, value: string) => {
    setEditableCell({ id, field });
    setEditValue(value);
  };
  
  const handleCellSave = async () => {
    if (!editableCell) return;
    
    try {
      const { id, field } = editableCell;
      
      // Update redemption in database
      await updateRedemption(id, { [field]: editValue });
      
      // Update local state
      setRedemptions(prevRedemptions => 
        prevRedemptions.map(redemption => 
          redemption.id === id ? { ...redemption, [field]: editValue } : redemption
        )
      );
      
      // Reset editable cell
      setEditableCell(null);
      setEditValue('');
      
      // Add notification
      await addNotification({
        title: 'Redemption Updated',
        message: `Updated ${field} for a redemption`,
        isRead: false
      });
      
    } catch (err) {
      console.error('Error updating redemption:', err);
      setError('Failed to update redemption. Please try again.');
    }
  };
  
  const handleCellCancel = () => {
    setEditableCell(null);
    setEditValue('');
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this redemption?')) return;
    
    try {
      // Delete redemption from database
      await deleteRedemption(id);
      
      // Update local state
      setRedemptions(prevRedemptions => 
        prevRedemptions.filter(redemption => redemption.id !== id)
      );
      
      // Add notification
      await addNotification({
        title: 'Redemption Deleted',
        message: 'A redemption has been deleted',
        isRead: false
      });
      
    } catch (err) {
      console.error('Error deleting redemption:', err);
      setError('Failed to delete redemption. Please try again.');
    }
  };
  
  // Generate unique months for filter
  const months = Array.from(new Set(redemptions.map(r => r.month))).sort();
  
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
      <h1 className="text-3xl font-bold mb-6">All Redemptions</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div>
            <label htmlFor="search" className="form-label">Search</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input"
              placeholder="Search redemptions..."
            />
          </div>
          
          {/* Month filter */}
          <div>
            <label htmlFor="month-filter" className="form-label">Filter by Month</label>
            <select
              id="month-filter"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="form-label">Filter by Status</label>
            <select
              id="status-filter"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">All Statuses</option>
              <option value="To Redeem">To Redeem</option>
              <option value="Redeemed">Redeemed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="table-header cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="table-header cursor-pointer"
                onClick={() => handleSort('month')}
              >
                Month
                {sortField === 'month' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="table-header cursor-pointer"
                onClick={() => handleSort('dateFrom')}
              >
                Valid Period
                {sortField === 'dateFrom' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="table-header cursor-pointer"
                onClick={() => handleSort('perks')}
              >
                Perks
                {sortField === 'perks' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="table-header cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRedemptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No redemptions found
                </td>
              </tr>
            ) : (
              filteredRedemptions.map(redemption => (
                <tr key={redemption.id}>
                  <td className="table-cell">
                    {editableCell?.id === redemption.id && editableCell?.field === 'name' ? (
                      <div className="flex">
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="form-input px-2 py-1 text-sm mr-2"
                          autoFocus
                        />
                        <button onClick={handleCellSave} className="text-green-600 mr-1">✓</button>
                        <button onClick={handleCellCancel} className="text-red-600">✕</button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleCellEdit(redemption.id, 'name', redemption.name)}
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      >
                        {redemption.name}
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <div 
                      onClick={() => handleCellEdit(redemption.id, 'month', redemption.month)}
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                      {redemption.month}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="p-1">
                      {redemption.dateFrom} to {redemption.dateTo}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div 
                      onClick={() => handleCellEdit(redemption.id, 'perks', redemption.perks)}
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                      {redemption.perks}
                    </div>
                  </td>
                  <td className="table-cell">
                    <select
                      value={redemption.status}
                      onChange={(e) => {
                        updateRedemption(redemption.id, { status: e.target.value as RedemptionStatus })
                          .then(() => {
                            setRedemptions(prevRedemptions => 
                              prevRedemptions.map(r => 
                                r.id === redemption.id ? { ...r, status: e.target.value as RedemptionStatus } : r
                              )
                            );
                          })
                          .catch(err => {
                            console.error('Error updating redemption status:', err);
                            setError('Failed to update redemption status. Please try again.');
                          });
                      }}
                      className={`
                        rounded-full px-3 py-1 text-xs font-medium
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
                  <td className="table-cell">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleDelete(redemption.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 