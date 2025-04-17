'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLeads, updateLead, Lead, seedInitialData } from '@/lib/leadStorage';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AllLeadsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);

  // Status options for dropdown (matching dashboard page)
  const statusOptions = [
    "Send Reminder",
    "Pending Service",
    "Service In Progress",
    "Cancelled",
    "To Reschedule",
    "Completed"
  ];

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Seed initial data if needed (will only run if collection is empty)
        await seedInitialData();
        
        // Fetch leads from Firestore
        const fetchedLeads = await getLeads();
        setLeads(fetchedLeads);
        setFilteredLeads(fetchedLeads);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Filter leads based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = leads.filter(lead => 
        lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
        lead.service_provider_name.toLowerCase().includes(lowerCaseSearch) ||
        lead.status.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredLeads(filtered);
    }
  }, [searchTerm, leads]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      // Update the lead in Firestore
      const updatedLead = await updateLead(leadId, { status: newStatus });
      if (updatedLead) {
        // Update the state with the new data
        const updatedLeads = leads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        );
        setLeads(updatedLeads);
        
        // Update filtered leads
        if (searchTerm.trim() === '') {
          setFilteredLeads(updatedLeads);
        } else {
          const lowerCaseSearch = searchTerm.toLowerCase();
          setFilteredLeads(updatedLeads.filter(lead => 
            lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
            lead.service_provider_name.toLowerCase().includes(lowerCaseSearch) ||
            lead.status.toLowerCase().includes(lowerCaseSearch)
          ));
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status. Please try again.');
    }
  };
  
  const handleCellEdit = async (leadId: string, field: string, value: string | number) => {
    try {
      // Update the lead in Firestore
      const updatedLead = await updateLead(leadId, { [field]: value });
      
      if (updatedLead) {
        // Update the state with the new data
        const updatedLeads = leads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        );
        setLeads(updatedLeads);
        
        // Update filtered leads
        if (searchTerm.trim() === '') {
          setFilteredLeads(updatedLeads);
        } else {
          const lowerCaseSearch = searchTerm.toLowerCase();
          setFilteredLeads(updatedLeads.filter(lead => 
            lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
            lead.service_provider_name.toLowerCase().includes(lowerCaseSearch) ||
            lead.status.toLowerCase().includes(lowerCaseSearch)
          ));
        }
      }
    } catch (error) {
      console.error(`Error updating lead ${leadId}, field ${field}:`, error);
      alert('Failed to update lead. Please try again.');
    }
    
    // Close the editing cell
    setEditingCell(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">All Leads</h1>
            <p className="mt-2 text-sm text-gray-700">
              A comprehensive list of all leads in the system
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-2">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl">&times;</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/leads/new')}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add New Lead
            </button>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="mt-8 bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No leads found. Add a new lead to get started.</p>
          </div>
        ) : filteredLeads.length === 0 && searchTerm.trim() !== '' ? (
          <div className="mt-8 bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No leads found matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Customer Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Contact
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Service Provider
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Service Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Total Price
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {editingCell?.leadId === lead.id && editingCell?.field === 'customer_name' ? (
                              <input 
                                className="w-full p-1 border rounded" 
                                defaultValue={lead.customer_name}
                                onBlur={(e) => handleCellEdit(lead.id, 'customer_name', e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                                onClick={() => setEditingCell({leadId: lead.id, field: 'customer_name'})}
                              >
                                {lead.customer_name}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {editingCell?.leadId === lead.id && editingCell?.field === 'customer_contact' ? (
                              <input 
                                className="w-full p-1 border rounded" 
                                defaultValue={lead.customer_contact}
                                onBlur={(e) => handleCellEdit(lead.id, 'customer_contact', e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                                onClick={() => setEditingCell({leadId: lead.id, field: 'customer_contact'})}
                              >
                                {lead.customer_contact}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {editingCell?.leadId === lead.id && editingCell?.field === 'service_provider_name' ? (
                              <input 
                                className="w-full p-1 border rounded" 
                                defaultValue={lead.service_provider_name}
                                onBlur={(e) => handleCellEdit(lead.id, 'service_provider_name', e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                                onClick={() => setEditingCell({leadId: lead.id, field: 'service_provider_name'})}
                              >
                                {lead.service_provider_name}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {editingCell?.leadId === lead.id && editingCell?.field === 'service_start_date' ? (
                              <input 
                                type="date"
                                className="w-full p-1 border rounded" 
                                defaultValue={lead.service_start_date}
                                onBlur={(e) => handleCellEdit(lead.id, 'service_start_date', e.target.value)}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                                onClick={() => setEditingCell({leadId: lead.id, field: 'service_start_date'})}
                              >
                                {new Date(lead.service_start_date).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {editingCell?.leadId === lead.id && editingCell?.field === 'total_price' ? (
                              <input 
                                type="number"
                                step="0.01"
                                className="w-full p-1 border rounded" 
                                defaultValue={lead.total_price}
                                onBlur={(e) => handleCellEdit(lead.id, 'total_price', parseFloat(e.target.value))}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                                onClick={() => setEditingCell({leadId: lead.id, field: 'total_price'})}
                              >
                                ${lead.total_price}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {editingCell?.leadId === lead.id && editingCell?.field === 'notes' ? (
                              <textarea 
                                className="w-full p-1 border rounded" 
                                defaultValue={lead.notes}
                                onBlur={(e) => handleCellEdit(lead.id, 'notes', e.target.value)}
                                autoFocus
                                rows={3}
                              />
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-gray-100 p-1 rounded min-w-40 max-w-60 break-words" 
                                onClick={() => setEditingCell({leadId: lead.id, field: 'notes'})}
                              >
                                {lead.notes}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 