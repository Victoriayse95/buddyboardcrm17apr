'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLeads, updateLead, deleteLead, Lead } from '@/lib/leadStorage';
import { PencilIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { formatDateDDMMYYYY } from '@/utils/format';
import TableHeader from '@/components/TableHeader';
import { SortDirection, ActiveFilters, getUniqueValues, getUniqueDatesByMonth, sortItems, applyFilters, FilterOption } from '@/utils/tableUtils';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contactLeads, setContactLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{leadId: string, field: string} | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContactLeads, setFilteredContactLeads] = useState<Lead[]>([]);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([]);
  const [calendarLeads, setCalendarLeads] = useState<{ [key: string]: Lead[] }>({});

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

  // Add state for sorting and filtering
  const [sortField, setSortField] = useState<keyof Lead | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [displayedContactLeads, setDisplayedContactLeads] = useState<Lead[]>([]);

  // Generate filter options for different columns
  const getFilterOptions = (field: string): FilterOption[] => {
    if (field === 'service_start_date_month') {
      const months = getUniqueDatesByMonth(contactLeads);
      return months.map(month => ({
        label: month,
        value: month
      }));
    }
    
    if (field === 'status') {
      return getUniqueValues(contactLeads, 'status').map(status => ({
        label: status,
        value: status
      }));
    }
    
    if (field === 'service_provider_name') {
      return getUniqueValues(contactLeads, 'service_provider_name').map(provider => ({
        label: provider,
        value: provider
      }));
    }
    
    if (field === 'handled_by') {
      const handlers = getUniqueValues(contactLeads, 'handled_by').filter(Boolean);
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
    let filteredResults = filteredContactLeads;
    
    // Apply column filters
    if (Object.keys(activeFilters).length > 0) {
      filteredResults = applyFilters(filteredResults, activeFilters);
    }
    
    // Apply sorting
    if (sortField) {
      filteredResults = sortItems(filteredResults, sortField, sortDirection);
    }
    
    setDisplayedContactLeads(filteredResults);
  }, [filteredContactLeads, sortField, sortDirection, activeFilters]);

  // Add a useEffect to initialize displayedContactLeads
  useEffect(() => {
    setDisplayedContactLeads(filteredContactLeads);
  }, [filteredContactLeads]);

  // Filter leads based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredContactLeads(contactLeads);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = contactLeads.filter(lead => 
        lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
        lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredContactLeads(filtered);
    }
  }, [searchTerm, contactLeads]);

  // Function to check if a date is exactly 3 days from now
  const isExactlyThreeDaysFromNow = (dateString: string): boolean => {
    // Parse the provided date string
    const leadDate = new Date(dateString);
    leadDate.setHours(0, 0, 0, 0);
    
    // Get today's date with time set to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a date that's exactly 3 days from today
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Debug info
    console.log(`Comparing dates - Lead date: ${leadDate.toISOString()}, Target date: ${threeDaysFromNow.toISOString()}`);
    
    // Check if the dates are the same (comparing timestamps)
    return leadDate.getTime() === threeDaysFromNow.getTime();
  };

  // Get the target date string for 3 days from now
  const getThreeDayTargetDate = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    return threeDaysFromNow.toISOString().split('T')[0];
  };

  // Update useEffect to fetch leads and properly filter for leads exactly 3 days away
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching leads and filtering for 3-day reminder");
        
        // Fetch the leads from storage
        const fetchedLeads = await getLeads();
        console.log("Retrieved leads:", fetchedLeads.length);
        
        // Get the target date for filtering
        const targetDate = getThreeDayTargetDate();
        console.log("Target date for leads to contact:", targetDate);
        
        // Filter leads that are exactly 3 days away and not completed/cancelled
        const leadsToContact = fetchedLeads.filter(lead => {
          // Compare the date strings
          const matchesDate = lead.service_start_date === targetDate;
          
          // If we want to be more tolerant, we could also check day differences
          // This approach might help if there are timezone or day calculation issues
          const leadDate = new Date(lead.service_start_date);
          leadDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Calculate difference in days
          const diffTime = leadDate.getTime() - today.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          // Check if the difference is 3 days
          const isThreeDaysAway = diffDays === 3;
          
          // Only keep leads that aren't completed or cancelled
          const validStatus = lead.status !== "Completed" && lead.status !== "Cancelled";
          
          if (matchesDate || isThreeDaysAway) {
            console.log(`Found lead with matching date: ${lead.customer_name}, date: ${lead.service_start_date}, status: ${lead.status}, days difference: ${diffDays}`);
          }
          
          return (matchesDate || isThreeDaysAway) && validStatus;
        });
        
        console.log("Found leads to contact:", leadsToContact.length);
        
        // Set state with all leads and filtered contact leads
        setLeads(fetchedLeads);
        setContactLeads(leadsToContact);
        setFilteredContactLeads(leadsToContact);
        setLoading(false);
        
      } catch (error: any) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Generate calendar days for the current month
  useEffect(() => {
    const generateCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDay.getDay();
      
      // Calculate total days to display (including padding)
      const totalDays = firstDayOfWeek + lastDay.getDate();
      // Calculate rows needed (7 columns per row)
      const totalRows = Math.ceil(totalDays / 7);
      // Calculate total cells (7 days * rows)
      const totalCells = totalRows * 7;
      
      const days: Array<Date | null> = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add cells for each day of the month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
      
      // Add empty cells to fill the last row
      while (days.length < totalCells) {
        days.push(null);
      }
      
      setCalendarDays(days);
    };
    
    generateCalendar();
  }, [currentMonth]);

  // Organize leads by date for the calendar view
  useEffect(() => {
    const organizeLeadsByDate = () => {
      const leadsByDate: { [key: string]: Lead[] } = {};
      
      leads.forEach(lead => {
        const dateKey = lead.service_start_date;
        if (!leadsByDate[dateKey]) {
          leadsByDate[dateKey] = [];
        }
        leadsByDate[dateKey].push(lead);
      });
      
      setCalendarLeads(leadsByDate);
    };
    
    if (leads.length > 0) {
      organizeLeadsByDate();
    }
  }, [leads]);

  const getPreviousMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const getNextMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      // Update the lead in localStorage
      const updatedLead = await updateLead(leadId, { status: newStatus });
      
      if (updatedLead) {
        // Update the leads state
        setLeads(prevLeads => prevLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        
        // Get the target date for 3 days from now
        const targetDate = getThreeDayTargetDate();
        
        // Compare the date strings
        const matchesDate = updatedLead.service_start_date === targetDate;
        
        // Also check day differences
        const leadDate = new Date(updatedLead.service_start_date);
        leadDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = leadDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if the difference is 3 days
        const isThreeDaysAway = diffDays === 3;
        
        // Check if this lead should be in contactLeads
        const isExactlyThreeDays = matchesDate || isThreeDaysAway;
        
        console.log(`Date changed for lead ${leadId}: ${updatedLead.service_start_date}, matches 3-day target: ${isExactlyThreeDays}, days difference: ${diffDays}`);
        
        // Update contactLeads
        if (isExactlyThreeDays && 
            updatedLead.status !== "Completed" && 
            updatedLead.status !== "Cancelled") {
          // If the lead isn't already in contactLeads, add it
          if (!contactLeads.some(lead => lead.id === leadId)) {
            const newContactLeads = [...contactLeads, updatedLead];
            setContactLeads(newContactLeads);
            
            // Update filtered leads
            if (searchTerm.trim() === '') {
              setFilteredContactLeads(newContactLeads);
            } else {
              const lowerCaseSearch = searchTerm.toLowerCase();
              setFilteredContactLeads(newContactLeads.filter(lead => 
                lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
                lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
              ));
            }
          } else {
            // Update the lead in contactLeads if it's already there
            const updatedContactLeads = contactLeads.map(lead => 
              lead.id === leadId ? updatedLead : lead
            );
            setContactLeads(updatedContactLeads);
            
            // Update filtered leads with same filter
            if (searchTerm.trim() === '') {
              setFilteredContactLeads(updatedContactLeads);
            } else {
              const lowerCaseSearch = searchTerm.toLowerCase();
              setFilteredContactLeads(updatedContactLeads.filter(lead => 
                lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
                lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
              ));
            }
          }
        } else {
          // If the date doesn't match the 3-day threshold or status is completed/cancelled,
          // remove it from contactLeads if it's there
          const filteredContactLeadsData = contactLeads.filter(lead => lead.id !== leadId);
          setContactLeads(filteredContactLeadsData);
          
          // Update filtered leads
          if (searchTerm.trim() === '') {
            setFilteredContactLeads(filteredContactLeadsData);
          } else {
            const lowerCaseSearch = searchTerm.toLowerCase();
            setFilteredContactLeads(filteredContactLeadsData.filter(lead => 
              lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
              lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
            ));
          }
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status. Please try again.');
    }
  };
  
  const handleCellEdit = async (leadId: string, field: string, value: string | number) => {
    try {
      // Update the lead in localStorage
      const updatedLead = await updateLead(leadId, { [field]: value });
      
      if (updatedLead) {
        // Update the leads state
        setLeads(prevLeads => prevLeads.map(lead => 
          lead.id === leadId ? updatedLead : lead
        ));
        
        // Update in contactLeads if present
        if (contactLeads.some(lead => lead.id === leadId)) {
          const updatedContactLeads = contactLeads.map(lead => 
            lead.id === leadId ? updatedLead : lead
          );
          setContactLeads(updatedContactLeads);
          
          // Also update filteredContactLeads with the same filter
          if (searchTerm.trim() === '') {
            setFilteredContactLeads(updatedContactLeads);
          } else {
            const lowerCaseSearch = searchTerm.toLowerCase();
            setFilteredContactLeads(updatedContactLeads.filter(lead => 
              lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
              lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
            ));
          }
        }
        
        // If date fields were changed, we need to potentially move the lead between tables
        if (field === 'service_start_date') {
          // Get the target date for 3 days from now
          const targetDate = getThreeDayTargetDate();
          
          // Compare the date strings
          const matchesDate = updatedLead.service_start_date === targetDate;
          
          // Also check day differences
          const leadDate = new Date(updatedLead.service_start_date);
          leadDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Calculate difference in days
          const diffTime = leadDate.getTime() - today.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          // Check if the difference is 3 days
          const isThreeDaysAway = diffDays === 3;
          
          // Check if this lead should be in contactLeads
          const isExactlyThreeDays = matchesDate || isThreeDaysAway;
          
          console.log(`Date changed for lead ${leadId}: ${updatedLead.service_start_date}, matches 3-day target: ${isExactlyThreeDays}, days difference: ${diffDays}`);
          
          // Update contactLeads
          if (isExactlyThreeDays && 
              updatedLead.status !== "Completed" && 
              updatedLead.status !== "Cancelled") {
            // If the lead isn't already in contactLeads, add it
            if (!contactLeads.some(lead => lead.id === leadId)) {
              const newContactLeads = [...contactLeads, updatedLead];
              setContactLeads(newContactLeads);
              
              // Update filtered leads
              if (searchTerm.trim() === '') {
                setFilteredContactLeads(newContactLeads);
              } else {
                const lowerCaseSearch = searchTerm.toLowerCase();
                setFilteredContactLeads(newContactLeads.filter(lead => 
                  lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
                  lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
                ));
              }
            }
          } else {
            // If the date doesn't match the 3-day threshold or status is completed/cancelled,
            // remove it from contactLeads if it's there
            const filteredContactLeadsData = contactLeads.filter(lead => lead.id !== leadId);
            setContactLeads(filteredContactLeadsData);
            
            // Update filtered leads
            if (searchTerm.trim() === '') {
              setFilteredContactLeads(filteredContactLeadsData);
            } else {
              const lowerCaseSearch = searchTerm.toLowerCase();
              setFilteredContactLeads(filteredContactLeadsData.filter(lead => 
                lead.customer_name.toLowerCase().includes(lowerCaseSearch) ||
                lead.service_provider_name.toLowerCase().includes(lowerCaseSearch)
              ));
            }
          }
        }
      }
      
      // In a real app, you would make an API call to update the backend
      console.log(`Updated lead ${leadId}, field ${field} to ${value}`);
      
      // Close the editing cell
      setEditingCell(null);
    } catch (error) {
      console.error(`Error updating lead ${leadId}:`, error);
      alert('Failed to update lead. Please try again.');
      setEditingCell(null);
    }
  };

  const handleDeleteLead = async (id: string) => {
    // Confirm deletion with the user
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const success = await deleteLead(id);
      
      if (success) {
        // Remove from leads and filtered leads
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
        setContactLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
        setFilteredContactLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
        
        toast.success('Lead deleted successfully');
      } else {
        toast.error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('An error occurred while deleting the lead');
    } finally {
      setLoading(false);
    }
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
          onClick={() => handleDeleteLead(lead.id)}
          className="text-red-600 hover:text-red-900 focus:outline-none"
          title="Delete lead"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
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
        {/* Leads to Contact Section */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">Leads to Contact</h1>
            <p className="mt-2 text-sm text-gray-700">
              Leads with service scheduled in exactly 3 days from now
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
                    {displayedContactLeads.length > 0 ? (
                      displayedContactLeads.map((lead) => renderLeadRow(lead))
                    ) : searchTerm.trim() !== '' && contactLeads.length > 0 ? (
                      <tr>
                        <td colSpan={9} className="py-4 text-center text-sm text-gray-500">
                          No leads found matching "{searchTerm}"
                        </td>
                      </tr>
                    ) : Object.keys(activeFilters).length > 0 && contactLeads.length > 0 ? (
                      <tr>
                        <td colSpan={9} className="py-4 text-center text-sm text-gray-500">
                          No leads match your filters. <button onClick={() => setActiveFilters({})} className="text-indigo-600 hover:text-indigo-800">Clear all filters</button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-4 text-center text-sm text-gray-500">
                          No leads to contact found for {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const threeDaysFromNow = new Date(today);
                            threeDaysFromNow.setDate(today.getDate() + 3);
                            return formatDateDDMMYYYY(threeDaysFromNow.toISOString());
                          })()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mt-10">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-2xl font-semibold text-gray-900">Calendar View</h2>
              <p className="mt-2 text-sm text-gray-700">
                Lead schedule for {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex space-x-2">
              <button
                type="button"
                onClick={getPreviousMonth}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                type="button"
                onClick={getNextMonth}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div className="bg-white">
              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="px-4 py-2 text-center font-semibold text-gray-900 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 min-h-[600px]">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return (
                      <div 
                        key={`empty-${index}`} 
                        className="border-r border-b last:border-r-0 bg-gray-50 h-24"
                      />
                    );
                  }
                  
                  const dateKey = formatDateToYYYYMMDD(day);
                  const dayLeads = calendarLeads[dateKey] || [];
                  const isToday = new Date().toDateString() === day.toDateString();
                  
                  return (
                    <div 
                      key={dateKey} 
                      className={`border-r border-b last:border-r-0 h-24 p-1 overflow-y-auto ${
                        isToday ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className={`text-right font-medium text-sm mb-1 ${
                        isToday ? 'text-indigo-600' : 'text-gray-700'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      {dayLeads.map((lead) => (
                        <div 
                          key={lead.id} 
                          className="text-xs mb-1 p-1 rounded bg-indigo-100 text-indigo-800 truncate cursor-pointer hover:bg-indigo-200"
                          onClick={() => router.push(`/dashboard/leads?id=${lead.id}`)}
                          title={`${lead.customer_name} - ${lead.service_provider_name} - $${lead.total_price}`}
                        >
                          {lead.customer_name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Add a "Clear Filters" button near the search input if there are active filters */}
        {Object.keys(activeFilters).length > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilters({})}
            className="ml-2 flex items-center text-xs text-indigo-600 hover:text-indigo-900"
          >
            <span>Clear Filters</span>
            <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
              {Object.values(activeFilters).reduce((total, values) => total + values.length, 0)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
} 