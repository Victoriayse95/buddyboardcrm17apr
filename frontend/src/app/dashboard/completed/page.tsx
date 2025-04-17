'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLeads, updateLead, Lead, seedInitialData } from '@/lib/leadStorage';
import { PencilIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExportButton from '@/components/ExportButton';
import { exportLeadsToExcel } from '@/utils/exportUtils';
import { toast } from 'react-hot-toast';
import { formatDateDDMMYYYY } from '@/utils/format';

export default function CompletedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [completedLeads, setCompletedLeads] = useState<Lead[]>([]);
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

  // Add a function to handle the export
  const handleExport = () => {
    try {
      exportLeadsToExcel(completedLeads, 'completed-leads');
      toast.success('Completed leads exported successfully');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads. Please try again.');
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Seed initial data if needed
        await seedInitialData();
        
        // Fetch leads from Firestore
        const allLeads = await getLeads();
        
        // Get current date (assuming today is April 17, 2025 for testing)
        const today = new Date();
        console.log("Current date for filtering completed services:", today.toISOString());
        
        // Completed leads - status is Completed OR service date is in the past
        const completed = allLeads.filter(lead => {
          // Check if status is completed
          const isCompletedStatus = lead.status === "Completed";
          
          // Check if service date is in the past
          const serviceDate = new Date(lead.service_start_date);
          const isPastService = serviceDate < today;
          
          console.log(`Lead ${lead.customer_name}, date: ${lead.service_start_date}, is past: ${isPastService}, status: ${lead.status}`);
          
          // Include in completed if either condition is true
          return isCompletedStatus || (isPastService && lead.status !== "Cancelled");
        });
        
        console.log(`Found ${completed.length} completed/past services`);
        
        setLeads(allLeads);
        setCompletedLeads(completed);
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
        
        // If lead is no longer completed, remove from completed leads
        if (newStatus !== "Completed") {
          setCompletedLeads(completedLeads.filter(lead => lead.id !== leadId));
          
          // Redirect based on new status
          if (newStatus === "Cancelled") {
            router.push('/dashboard/archived');
          } else {
            router.push('/dashboard');
          }
        } else {
          // Update in completedLeads
          setCompletedLeads(completedLeads.map(lead => 
            lead.id === leadId ? updatedLead : lead
          ));
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status. Please try again.');
    }
  };
  
  // Function to move a lead back to upcoming tasks
  const moveToUpcoming = async (leadId: string) => {
    try {
      // Find the lead in completed leads
      const leadToMove = completedLeads.find(lead => lead.id === leadId);
      
      if (leadToMove) {
        // Change status to Pending Service
        const updatedLead = await updateLead(leadId, { status: "Pending Service" });
        
        if (updatedLead) {
          // Update leads state
          setLeads(leads.map(lead => lead.id === leadId ? updatedLead : lead));
          
          // Remove from completed leads
          setCompletedLeads(completedLeads.filter(lead => lead.id !== leadId));
          
          // Redirect to upcoming page
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error moving lead to upcoming tasks:', error);
      alert('Failed to move lead to upcoming tasks. Please try again.');
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
        
        // Update in completedLeads if present
        if (completedLeads.some(lead => lead.id === leadId)) {
          setCompletedLeads(completedLeads.map(lead => 
            lead.id === leadId ? updatedLead : lead
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
            <h1 className="text-3xl font-semibold text-gray-900">Completed Services</h1>
            <p className="mt-2 text-sm text-gray-700">
              Services that have been successfully completed
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-2">
            <ExportButton 
              onClick={handleExport} 
              disabled={completedLeads.length === 0}
              label="Export Completed"
            />
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
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {completedLeads.length > 0 ? (
                      completedLeads.map((lead) => (
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
                                <span className="flex-1 min-w-0 break-words">{formatDateDDMMYYYY(lead.service_start_date)}</span>
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
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              type="button"
                              onClick={() => moveToUpcoming(lead.id)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Move to Upcoming
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-4 text-center text-sm text-gray-500">
                          No completed services found
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