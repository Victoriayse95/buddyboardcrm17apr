'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLeads, updateLead, Lead, seedInitialData } from '@/lib/leadStorage';
import { PencilIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UpcomingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [upcomingLeads, setUpcomingLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);

  // Status options for dropdown
  const statusOptions = [
    "Send Reminder",
    "Pending Service",
    "Service In Progress",
    "Cancelled",
    "To Reschedule",
    "Completed"
  ];

  // Handler options
  const handlerOptions = [
    "Victoria",
    "Waiyee"
  ];

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Seed initial data if needed
        await seedInitialData();
        
        // Get the current date
        const now = new Date().getTime();
        
        // Fetch leads from Firestore
        const allLeads = await getLeads();
        
        // Upcoming leads - future services that haven't been completed
        const upcoming = allLeads.filter(lead => {
          const startDate = new Date(lead.service_start_date).getTime();
          return startDate >= now && lead.status !== "Completed" && lead.status !== "Cancelled";
        });
        
        setLeads(allLeads);
        setUpcomingLeads(upcoming);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      // Update the lead in Firestore
      const updatedLead = await updateLead(leadId, { status: newStatus });
      
      if (updatedLead) {
        // Update the leads state
        setLeads(leads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        
        // If lead is completed or cancelled, remove from upcoming
        if (newStatus === "Completed" || newStatus === "Cancelled") {
          setUpcomingLeads(upcomingLeads.filter(lead => lead.id !== leadId));
          
          // Navigate to appropriate page
          if (newStatus === "Completed") {
            router.push('/dashboard/completed');
          } else if (newStatus === "Cancelled") {
            router.push('/dashboard/archived');
          }
        } else {
          // Update in upcomingLeads
          setUpcomingLeads(upcomingLeads.map(lead => 
            lead.id === leadId ? updatedLead : lead
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
        // Update the leads state
        setLeads(leads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        
        // Update in upcomingLeads if present
        if (upcomingLeads.some(lead => lead.id === leadId)) {
          setUpcomingLeads(upcomingLeads.map(lead => 
            lead.id === leadId ? updatedLead : lead
          ));
        }
        
        // If date fields were changed, we need to potentially move the lead between tables
        if (field === 'service_start_date') {
          // Recalculate which table this lead should appear in
          const now = new Date().getTime();
          const startDate = new Date(updatedLead.service_start_date).getTime();
          
          // If the date is no longer in the future, remove from upcoming
          if (startDate < now) {
            setUpcomingLeads(upcomingLeads.filter(lead => lead.id !== leadId));
          }
        }
      }
    } catch (error) {
      console.error(`Error updating lead ${leadId}, field ${field}:`, error);
      alert('Failed to update lead. Please try again.');
    }
    
    // Close the editing cell
    setEditingCell(null);
  };

  const renderLeadRow = (lead: Lead) => (
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
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'customer_name'})}
          >
            <span className="flex-1 min-w-0 break-words">{lead.customer_name}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
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
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'customer_contact'})}
          >
            <span className="flex-1 min-w-0 break-words">{lead.customer_contact}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
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
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'service_provider_name'})}
          >
            <span className="flex-1 min-w-0 break-words">{lead.service_provider_name}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
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
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'service_start_date'})}
          >
            <span className="flex-1 min-w-0 break-words">{new Date(lead.service_start_date).toLocaleDateString()}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
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
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'total_price'})}
          >
            <span className="flex-1 min-w-0 break-words">${lead.total_price}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
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
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {editingCell?.leadId === lead.id && editingCell?.field === 'handled_by' ? (
          <select
            className="w-full p-1 border rounded"
            defaultValue={lead.handled_by || ''}
            onBlur={(e) => handleCellEdit(lead.id, 'handled_by', e.target.value)}
            autoFocus
          >
            <option value="">Select handler</option>
            {handlerOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <div 
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'handled_by'})}
          >
            <span className="flex-1 min-w-0 break-words">{lead.handled_by || 'Not assigned'}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
          </div>
        )}
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
            className="group cursor-pointer hover:bg-blue-50 hover:text-blue-700 p-1 rounded border border-transparent hover:border-blue-200 flex" 
            onClick={() => setEditingCell({leadId: lead.id, field: 'notes'})}
          >
            <span className="flex-1 min-w-40 max-w-60 break-words">{lead.notes}</span>
            <PencilIcon className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 text-blue-500 flex-shrink-0 self-start mt-1" />
          </div>
        )}
      </td>
    </tr>
  );

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
        {/* Upcoming Tasks Section */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Upcoming Tasks</h1>
            <p className="mt-2 text-sm text-gray-700">
              All upcoming tasks that haven't been completed or cancelled
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => router.push('/dashboard/leads/new')}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add New Lead
            </button>
          </div>
        </div>

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
                        Handled By
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {upcomingLeads.length > 0 ? (
                      upcomingLeads.map((lead) => renderLeadRow(lead))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-sm text-gray-500">
                          No upcoming tasks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 