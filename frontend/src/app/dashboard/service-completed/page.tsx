'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDateDDMMYYYY } from '@/utils/format';
import TableHeader from '@/components/TableHeader';
import { SortDirection, ActiveFilters, getUniqueValues, getUniqueDatesByMonth, FilterOption } from '@/utils/tableUtils';
import { exportDataToExcel } from '@/utils/exportUtils';

interface CompletedService {
  id: number;
  customer_name: string;
  customer_contact: string;
  service_provider_name: string;
  service_type: string;
  completion_date: string;
  total_price: number;
  status: string;
  notes: string;
  rating?: number;
  feedback?: string;
}

export default function CompletedServicesPage() {
  const [services, setServices] = useState<CompletedService[]>([]);
  const [displayedServices, setDisplayedServices] = useState<CompletedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ serviceId: string; field: string } | null>(null);
  const [sortField, setSortField] = useState<string>('completion_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Status options for dropdown
  const statusOptions = ['Paid', 'Pending Payment', 'Refunded', 'Cancelled'];

  // Generate filter options for different columns
  const getFilterOptions = (field: string): FilterOption[] => {
    if (field === 'completion_date_month') {
      const months = getUniqueDatesByMonth(services, 'completion_date');
      return months.map(month => ({
        label: month,
        value: month
      }));
    }
    
    if (field === 'status') {
      return getUniqueValues(services, 'status').map(status => ({
        label: status,
        value: status
      }));
    }
    
    if (field === 'service_provider_name') {
      return getUniqueValues(services, 'service_provider_name').map(provider => ({
        label: provider,
        value: provider
      }));
    }
    
    if (field === 'service_type') {
      return getUniqueValues(services, 'service_type').map(type => ({
        label: type,
        value: type
      }));
    }
    
    return [];
  };

  // Handle sorting changes
  const handleSort = (field: string, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Handle filter changes
  const handleFilter = (field: string, values: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: values
    }));
  };

  // Add formatDateForFilter function at the top level of the component
  const formatDateForFilter = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Apply filtering and sorting whenever services, filters, or sort criteria change
  useEffect(() => {
    if (!services) return;

    let filtered = [...services];

    // Apply search term filtering
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(service => 
        (service.customer_name?.toLowerCase().includes(term) || false) ||
        (service.customer_contact?.toLowerCase().includes(term) || false) ||
        (service.service_provider_name?.toLowerCase().includes(term) || false) ||
        (service.service_type?.toLowerCase().includes(term) || false) ||
        (service.notes?.toLowerCase().includes(term) || false)
      );
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([field, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        filtered = filtered.filter(service => {
          const serviceValue = service[field as keyof CompletedService];
          if (field === 'service_start_date' || field === 'service_end_date') {
            if (typeof serviceValue === 'string') {
              const formattedDate = formatDateForFilter(serviceValue);
              return values.includes(formattedDate);
            }
            return false;
          }
          // Make sure we only include values that are strings or can be converted to strings
          if (serviceValue === undefined) return false;
          return values.includes(String(serviceValue));
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof CompletedService];
        const bValue = b[sortField as keyof CompletedService];

        // Handle sorting for dates
        if (sortField === 'service_start_date' || sortField === 'service_end_date') {
          const aDate = aValue !== undefined ? new Date(String(aValue)).getTime() : 0;
          const bDate = bValue !== undefined ? new Date(String(bValue)).getTime() : 0;
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Handle sorting for strings and other types
        if (aValue === bValue) return 0;
        if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Safe string conversion and comparison
        const aString = String(aValue || '');
        const bString = String(bValue || '');
        
        return sortDirection === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }

    setDisplayedServices(filtered);
  }, [services, activeFilters, sortField, sortDirection, searchTerm]);

  useEffect(() => {
    async function fetchCompletedServices() {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/services/completed');
        // const data = await response.json();
        
        // Mock data for now
        const mockData: CompletedService[] = [
          {
            id: 1,
            customer_name: 'John Smith',
            customer_contact: '555-123-4567',
            service_provider_name: 'ABC Cleaning',
            service_type: 'Home Cleaning',
            completion_date: '2023-07-15T10:30:00',
            total_price: 120,
            status: 'Completed',
            notes: 'Customer was very satisfied with the service.',
            rating: 5,
            feedback: 'Excellent service!'
          },
          {
            id: 2,
            customer_name: 'Sarah Williams',
            customer_contact: '555-234-5678',
            service_provider_name: 'Best Plumbers',
            service_type: 'Plumbing Repair',
            completion_date: '2023-07-14T15:45:00',
            total_price: 200,
            status: 'Completed',
            notes: 'Fixed leak under the sink, additional parts were required.',
            rating: 4,
            feedback: 'Good job, but the price was a bit high.'
          },
          {
            id: 3,
            customer_name: 'Michael Brown',
            customer_contact: '555-345-6789',
            service_provider_name: 'Green Lawns',
            service_type: 'Lawn Mowing',
            completion_date: '2023-07-13T09:00:00',
            total_price: 80,
            status: 'Completed',
            notes: 'Regular bi-weekly service, front and back yard.',
            rating: 5,
            feedback: 'Always on time and does a great job!'
          },
          {
            id: 4,
            customer_name: 'Emily Jones',
            customer_contact: '555-456-7890',
            service_provider_name: 'Spark Electric',
            service_type: 'Electrical Work',
            completion_date: '2023-07-12T13:20:00',
            total_price: 250,
            status: 'Completed',
            notes: 'Installed new light fixtures in kitchen and bathroom.',
            rating: 5,
            feedback: 'Very professional and efficient!'
          },
          {
            id: 5,
            customer_name: 'Robert Taylor',
            customer_contact: '555-567-8901',
            service_provider_name: 'Clean Carpets',
            service_type: 'Carpet Cleaning',
            completion_date: '2023-07-10T11:15:00',
            total_price: 150,
            status: 'Completed',
            notes: 'Deep cleaning for all bedrooms, customer requested stain removal.',
            rating: 4,
            feedback: 'Good service, but the carpet still looks a bit dirty.'
          }
        ];
        
        setServices(mockData);
        setDisplayedServices(mockData); // Initialize displayed services
        setLoading(false);
      } catch (err) {
        console.error('Error fetching completed services:', err);
        setError('Failed to load completed services. Please try again.');
        setLoading(false);
        toast.error('Failed to load completed services');
      }
    }

    fetchCompletedServices();
  }, []);

  const handleCellEdit = async (serviceId: string, field: string, value: string | number) => {
    try {
      // Find the service in the services state
      const updatedServices = services.map(service => {
        if (service.id.toString() === serviceId.toString()) {
          return { ...service, [field]: value };
        }
        return service;
      });
      
      // Update the services state
      setServices(updatedServices);
      
      // Update the displayedServices state
      setDisplayedServices(updatedServices);
      
      // Update the service in Firestore
      // This would be implemented when backend is connected
    } catch (error) {
      console.error(`Error updating service ${serviceId}, field ${field}:`, error);
      alert('Failed to update service. Please try again.');
    }
    
    // Close the editing cell
    setEditingCell(null);
  };

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      // Find the service in the services state
      const updatedServices = services.map(service => {
        if (service.id.toString() === serviceId.toString()) {
          return { ...service, status: newStatus };
        }
        return service;
      });
      
      // Update the services state
      setServices(updatedServices);
      
      // Update the displayedServices state
      setDisplayedServices(updatedServices);
      
      // Update the service in Firestore
      // This would be implemented when backend is connected
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  // Handle exporting services to Excel
  const handleExport = () => {
    if (displayedServices.length === 0) {
      toast.error('No services to export');
      return;
    }

    const dataToExport = displayedServices.map(service => ({
      'Customer Name': service.customer_name,
      'Service Type': service.service_type,
      'Completion Date': formatDateDDMMYYYY(service.completion_date),
      'Total Price': `$${service.total_price}`,
      'Technician': service.service_provider_name,
      'Rating': service.rating ? service.rating.toString() : 'N/A',
      'Feedback': service.feedback || 'None',
      'Status': service.status,
      'Notes': service.notes
    }));

    exportDataToExcel(dataToExport, 'completed-services', 'Completed Services');
    toast.success('Services exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Completed Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all completed services with customer details, service date, and payment status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleExport}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Export to Excel
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="flex justify-between my-4">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search completed services..."
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        
        {Object.keys(activeFilters).length > 0 && (
          <button
            type="button"
            onClick={() => setActiveFilters({})}
            className="ml-2 flex items-center text-xs text-indigo-600 hover:text-indigo-900"
          >
            <span>Clear Filters</span>
            <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
              {Object.values(activeFilters).reduce((total, values) => 
                total + (Array.isArray(values) ? values.length : 0), 0)}
            </span>
          </button>
        )}
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
                      field="completion_date"
                      sortable={true}
                      filterable={true}
                      sortDirection={sortField === 'completion_date' ? sortDirection : null}
                      onSort={handleSort}
                      filterOptions={getFilterOptions('completion_date_month')}
                      activeFilters={activeFilters['completion_date_month'] || []}
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
                  {displayedServices.length > 0 ? (
                    displayedServices.map((service) => (
                      <tr key={service.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {editingCell?.serviceId === service.id.toString() ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.customer_name}
                              onBlur={(e) => handleCellEdit(service.id.toString(), 'customer_name', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id.toString(), field: 'customer_name'})}
                            >
                              {service.customer_name}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id.toString() ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.customer_contact}
                              onBlur={(e) => handleCellEdit(service.id.toString(), 'customer_contact', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id.toString(), field: 'customer_contact'})}
                            >
                              {service.customer_contact}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id.toString() ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.service_provider_name}
                              onBlur={(e) => handleCellEdit(service.id.toString(), 'service_provider_name', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id.toString(), field: 'service_provider_name'})}
                            >
                              {service.service_provider_name}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id.toString() ? (
                            <input 
                              type="date"
                              className="w-full p-1 border rounded" 
                              defaultValue={service.completion_date.split('T')[0]}
                              onBlur={(e) => handleCellEdit(service.id.toString(), 'completion_date', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id.toString(), field: 'completion_date'})}
                            >
                              {formatDateDDMMYYYY(service.completion_date)}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id.toString() ? (
                            <input 
                              type="number"
                              step="0.01"
                              className="w-full p-1 border rounded" 
                              defaultValue={service.total_price}
                              onBlur={(e) => handleCellEdit(service.id.toString(), 'total_price', parseFloat(e.target.value))}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id.toString(), field: 'total_price'})}
                            >
                              ${service.total_price}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <select
                            value={service.status}
                            onChange={(e) => handleStatusChange(service.id.toString(), e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id.toString() ? (
                            <textarea 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.notes || ''}
                              onBlur={(e) => handleCellEdit(service.id.toString(), 'notes', e.target.value)}
                              autoFocus
                              rows={3}
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded min-w-40 max-w-60 break-words" 
                              onClick={() => setEditingCell({serviceId: service.id.toString(), field: 'notes'})}
                            >
                              {service.notes || <span className="text-gray-400">No notes</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : Object.keys(activeFilters).length > 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-sm text-gray-500">
                        No services match your filters. <button onClick={() => setActiveFilters({})} className="text-indigo-600 hover:text-indigo-800">Clear all filters</button>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-sm text-gray-500">
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
  );
} 