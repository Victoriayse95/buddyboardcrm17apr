'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLeads, updateLead, Lead, seedInitialData } from '@/lib/leadStorage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExportButton from '@/components/ExportButton';
import { exportLeadsToExcel } from '@/utils/exportUtils';
import { toast } from 'react-hot-toast';
import { formatDateDDMMYYYY } from '@/utils/format';
import TableHeader from '@/components/TableHeader';
import { SortDirection, ActiveFilters, getUniqueValues, getUniqueDatesByMonth, sortItems, applyFilters, FilterOption } from '@/utils/tableUtils';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AllLeadsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);
  const [sortField, setSortField] = useState<keyof Lead | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);

  // Status options for dropdown (matching dashboard page)
  const statusOptions = [
    "Send Reminder",
    "Pending Service",
    "Service In Progress",
    "Cancelled",
    "To Reschedule",
    "Completed"
  ];

  // Generate filter options function
  const getFilterOptions = (field: string): FilterOption[] => {
    if (field === 'service_start_date_month') {
      const months = getUniqueDatesByMonth(leads);
      return months.map(month => ({
        label: month,
        value: month
      }));
    }
    
    if (field === 'status') {
      return getUniqueValues(leads, 'status').map(status => ({
        label: status,
        value: status
      }));
    }
    
    if (field === 'service_provider_name') {
      return getUniqueValues(leads, 'service_provider_name').map(provider => ({
        label: provider,
        value: provider
      }));
    }
    
    return [];
  };

  // Handle sorting changes
  const handleSort = (field: string, direction: SortDirection) => {
    setSortField(field as keyof Lead);
    setSortDirection(direction);
  };

  // Handle filter changes
  const handleFilter = (field: string, values: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: values
    }));
  };

  // Apply sorting and filtering when relevant states change
  useEffect(() => {
    let filteredResults = leads;
    
    // First apply the search filter
    if (searchTerm.trim() !== '') {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(lead => 
        lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
        lead.service_provider_name.toLowerCase().includes(lowerCaseSearch) ||
        lead.status.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Then apply column filters
    if (Object.keys(activeFilters).length > 0) {
      filteredResults = applyFilters(filteredResults, activeFilters);
    }
    
    // Finally apply sorting
    if (sortField) {
      filteredResults = sortItems(filteredResults, sortField, sortDirection);
    }
    
    setFilteredLeads(filteredResults);
    setDisplayedLeads(filteredResults);
  }, [leads, searchTerm, sortField, sortDirection, activeFilters]);

  // Modify the useEffect that fetches leads
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
        setDisplayedLeads(fetchedLeads);
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

  // Add a function to handle the export
  const handleExport = () => {
    try {
      // Export the filtered leads (or all leads if no filter is applied)
      exportLeadsToExcel(filteredLeads, 'all-leads');
      toast.success('Leads exported successfully');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads. Please try again.');
    }
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
            {Object.keys(activeFilters).length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilters({})}
                className="flex items-center text-xs text-indigo-600 hover:text-indigo-900 mr-3"
              >
                <span>Clear Filters</span>
                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                  {Object.values(activeFilters).reduce((total, values) => total + values.length, 0)}
                </span>
              </button>
            )}
            <ExportButton 
              onClick={handleExport} 
              disabled={displayedLeads.length === 0}
              label="Export Leads"
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

        {/* Improved search bar with better visibility */}
        <div className="mt-4 flex">
          <div className="relative flex-1 max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
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
                        <TableHeader 
                          label="Customer Name"
                          field="customer_name"
                          sortable={true}
                          filterable={true}
                          sortDirection={sortField === 'customer_name' ? sortDirection : null}
                          onSort={handleSort}
                          filterOptions={getFilterOptions('customer_name')}
                          activeFilters={activeFilters['customer_name'] || []}
                          onFilter={handleFilter}
                        />
                        <TableHeader 
                          label="Contact"
                          field="customer_contact"
                          sortable={true}
                          filterable={false}
                          sortDirection={sortField === 'customer_contact' ? sortDirection : null}
                          onSort={handleSort}
                        />
                        <TableHeader 
                          label="Service Provider"
                          field="service_provider_name"
                          sortable={true}
                          filterable={true}
                          sortDirection={sortField === 'service_provider_name' ? sortDirection : null}
                          onSort={handleSort}
                          filterOptions={getFilterOptions('service_provider_name')}
                          activeFilters={activeFilters['service_provider_name'] || []}
                          onFilter={handleFilter}
                        />
                        <TableHeader 
                          label="Service Date"
                          field="service_start_date"
                          sortable={true}
                          filterable={true}
                          sortDirection={sortField === 'service_start_date' ? sortDirection : null}
                          onSort={handleSort}
                          filterOptions={getFilterOptions('service_start_date_month')}
                          activeFilters={activeFilters['service_start_date_month'] || []}
                          onFilter={handleFilter}
                        />
                        <TableHeader 
                          label="Total Price"
                          field="total_price"
                          sortable={true}
                          filterable={false}
                          sortDirection={sortField === 'total_price' ? sortDirection : null}
                          onSort={handleSort}
                        />
                        <TableHeader 
                          label="Status"
                          field="status"
                          sortable={true}
                          filterable={true}
                          sortDirection={sortField === 'status' ? sortDirection : null}
                          onSort={handleSort}
                          filterOptions={getFilterOptions('status')}
                          activeFilters={activeFilters['status'] || []}
                          onFilter={handleFilter}
                        />
                        <TableHeader 
                          label="Notes"
                          field="notes"
                          sortable={false}
                          filterable={false}
                        />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {displayedLeads.map((lead) => (
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
                                {formatDateDDMMYYYY(lead.service_start_date)}
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