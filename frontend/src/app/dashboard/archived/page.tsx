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
import TableHeader from '@/components/TableHeader';
import { SortDirection, ActiveFilters, getUniqueValues, getUniqueDatesByMonth, sortItems, applyFilters, FilterOption } from '@/utils/tableUtils';
import { formatDateDDMMYYYY } from '@/utils/format';

export default function ArchivedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [archivedLeads, setArchivedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);
  const [sortField, setSortField] = useState<keyof Lead | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);

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

  // Generate filter options for different columns
  const getFilterOptions = (field: string): FilterOption[] => {
    if (field === 'service_start_date_month') {
      const months = getUniqueDatesByMonth(archivedLeads);
      return months.map(month => ({
        label: month,
        value: month
      }));
    }
    
    if (field === 'status') {
      return getUniqueValues(archivedLeads, 'status').map(status => ({
        label: status,
        value: status
      }));
    }
    
    if (field === 'service_provider_name') {
      return getUniqueValues(archivedLeads, 'service_provider_name').map(provider => ({
        label: provider,
        value: provider
      }));
    }
    
    if (field === 'handled_by') {
      const handlers = getUniqueValues(archivedLeads, 'handled_by').filter(Boolean);
      return handlers.map(handler => ({
        label: handler,
        value: handler
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
    let filtered = archivedLeads;
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = applyFilters(filtered, activeFilters);
    }
    
    // Apply sorting
    if (sortField) {
      filtered = sortItems(filtered, sortField, sortDirection);
    }
    
    setDisplayedLeads(filtered);
  }, [archivedLeads, sortField, sortDirection, activeFilters]);

  // Modify the useEffect that fetches leads to initialize displayedLeads
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
        
        // Archived leads - cancelled or past end date but not completed
        const archived = allLeads.filter(lead => {
          const endDate = new Date(lead.service_end_date).getTime();
          return lead.status === "Cancelled" || (endDate < now && lead.status !== "Completed");
        });
        
        setLeads(allLeads);
        setArchivedLeads(archived);
        setDisplayedLeads(archived); // Initialize displayed leads
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Update the handleExport function to use displayedLeads
  const handleExport = () => {
    try {
      exportLeadsToExcel(displayedLeads, 'archived-leads');
      toast.success('Archived leads exported successfully');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads. Please try again.');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      // Update the lead in Firestore
      const updatedLead = await updateLead(leadId, { status: newStatus });
      
      if (updatedLead) {
        // Update the leads state
        setLeads(leads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        
        // Get the current date for comparison
        const now = new Date().getTime();
        const endDate = new Date(updatedLead.service_end_date).getTime();
        
        // If lead status is no longer cancelled and not past end date, remove from archived
        if (newStatus !== "Cancelled" && endDate >= now) {
          setArchivedLeads(archivedLeads.filter(lead => lead.id !== leadId));
          
          // Redirect to upcoming if status changed to something active
          if (["Send Reminder", "Pending Service", "Service In Progress", "To Reschedule"].includes(newStatus)) {
            router.push('/dashboard');
          } else if (newStatus === "Completed") {
            router.push('/dashboard/completed');
          }
        } else {
          // Update in archivedLeads
          setArchivedLeads(archivedLeads.map(lead => 
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
      // Find the lead in archived leads
      const leadToMove = archivedLeads.find(lead => lead.id === leadId);
      
      if (leadToMove) {
        // Change status to Pending Service
        const updatedLead = await updateLead(leadId, { status: "Pending Service" });
        
        if (updatedLead) {
          // Update leads state
          setLeads(leads.map(lead => lead.id === leadId ? updatedLead : lead));
          
          // Remove from archived leads
          setArchivedLeads(archivedLeads.filter(lead => lead.id !== leadId));
          
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
        
        // Update in archivedLeads if present
        if (archivedLeads.some(lead => lead.id === leadId)) {
          setArchivedLeads(archivedLeads.map(lead => 
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

  // Update the getStatusStyling function to use a better approach for the indicator
  const getStatusStyling = (status: string) => {
    if (status === "Send Reminder") {
      return {
        rowClass: "bg-amber-50 border-l-4 border-amber-500",
        textClass: "font-semibold text-amber-700",
        indicatorClass: "" // We'll use border-left instead of a separate div
      };
    }
    return {
      rowClass: "",
      textClass: "",
      indicatorClass: ""
    };
  };

  // Update the renderLeadRow function to use border-left instead of a separate div
  const renderLeadRow = (lead: Lead) => {
    const statusStyle = getStatusStyling(lead.status);
    
    return (
      <tr key={lead.id} className={`${statusStyle.rowClass}`}>
        {/* Remove the vertical indicator div that was pushing content right */}
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
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${lead.status === "Send Reminder" ? statusStyle.textClass : ""}`}
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
            onClick={() => moveToUpcoming(lead.id)}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Move to Upcoming
          </button>
        </td>
      </tr>
    );
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
            <h1 className="text-3xl font-semibold text-gray-900">Archived Tasks</h1>
            <p className="mt-2 text-sm text-gray-700">
              Tasks that have been cancelled or have passed their end date without being completed
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
              label="Export Archived"
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
                        label="Handled By"
                        field="handled_by"
                        sortable={true}
                        filterable={true}
                        sortDirection={sortField === 'handled_by' ? sortDirection : null}
                        onSort={handleSort}
                        filterOptions={getFilterOptions('handled_by')}
                        activeFilters={activeFilters['handled_by'] || []}
                        onFilter={handleFilter}
                      />
                      <TableHeader 
                        label="Notes"
                        field="notes"
                        sortable={false}
                        filterable={false}
                      />
                      <TableHeader 
                        label="Actions"
                        field="actions"
                        sortable={false}
                        filterable={false}
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {displayedLeads.length > 0 ? (
                      displayedLeads.map((lead) => renderLeadRow(lead))
                    ) : Object.keys(activeFilters).length > 0 && archivedLeads.length > 0 ? (
                      <tr>
                        <td colSpan={9} className="py-4 text-center text-sm text-gray-500">
                          No leads match your filters. <button onClick={() => setActiveFilters({})} className="text-indigo-600 hover:text-indigo-800">Clear all filters</button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-4 text-center text-sm text-gray-500">
                          No archived leads found
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