'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDate, formatDateDDMMYYYY } from '@/utils/format';
import TableHeader from '@/components/TableHeader';
import { SortDirection, ActiveFilters, getUniqueValues, getUniqueDatesByMonth, sortItems, applyFilters, FilterOption } from '@/utils/tableUtils';

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
}

export default function CompletedServicesPage() {
  const [services, setServices] = useState<CompletedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{serviceId: number, field: string} | null>(null);
  const [sortField, setSortField] = useState<keyof CompletedService | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [displayedServices, setDisplayedServices] = useState<CompletedService[]>([]);

  // Status options for dropdown
  const statusOptions = [
    "Send Reminder",
    "Pending Service",
    "Service In Progress",
    "Cancelled",
    "To Reschedule",
    "Completed"
  ];

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
    setSortField(field as keyof CompletedService);
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
    let filtered = services;
    
    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = applyFilters(filtered, activeFilters);
    }
    
    // Apply sorting
    if (sortField) {
      filtered = sortItems(filtered, sortField, sortDirection);
    }
    
    setDisplayedServices(filtered);
  }, [services, sortField, sortDirection, activeFilters]);

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
            notes: 'Customer was very satisfied with the service.'
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
            notes: 'Fixed leak under the sink, additional parts were required.'
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
            notes: 'Regular bi-weekly service, front and back yard.'
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
            notes: 'Installed new light fixtures in kitchen and bathroom.'
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
            notes: 'Deep cleaning for all bedrooms, customer requested stain removal.'
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

  const handleCellEdit = (serviceId: number, field: string, value: string | number) => {
    // Update the service in local state
    const updatedServices = services.map(service => 
      service.id === serviceId ? { ...service, [field]: value } : service
    );
    
    setServices(updatedServices);
    
    // In a real app, you would make an API call to update the backend
    console.log(`Updated service ${serviceId}, field ${field} to ${value}`);
    
    // Close the editing cell
    setEditingCell(null);
  };

  const handleStatusChange = async (serviceId: number, newStatus: string) => {
    try {
      // Update in local state only for now
      const updatedServices = services.map(service => 
        service.id === serviceId ? { ...service, status: newStatus } : service
      );
      
      setServices(updatedServices);
      
      // In a real app, you would make an API call
      // await api.patch(`/services/${serviceId}/`, { status: newStatus });
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status. Please try again.');
    }
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
          <h1 className="text-xl font-semibold text-gray-900">Completed Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all completed services including customer information, service details, and status.
          </p>
        </div>
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
                          {editingCell?.serviceId === service.id && editingCell?.field === 'customer_name' ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.customer_name}
                              onBlur={(e) => handleCellEdit(service.id, 'customer_name', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id, field: 'customer_name'})}
                            >
                              {service.customer_name}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id && editingCell?.field === 'customer_contact' ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.customer_contact}
                              onBlur={(e) => handleCellEdit(service.id, 'customer_contact', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id, field: 'customer_contact'})}
                            >
                              {service.customer_contact}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id && editingCell?.field === 'service_provider_name' ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.service_provider_name}
                              onBlur={(e) => handleCellEdit(service.id, 'service_provider_name', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id, field: 'service_provider_name'})}
                            >
                              {service.service_provider_name}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id && editingCell?.field === 'completion_date' ? (
                            <input 
                              type="date"
                              className="w-full p-1 border rounded" 
                              defaultValue={service.completion_date.split('T')[0]}
                              onBlur={(e) => handleCellEdit(service.id, 'completion_date', e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id, field: 'completion_date'})}
                            >
                              {formatDateDDMMYYYY(service.completion_date)}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id && editingCell?.field === 'total_price' ? (
                            <input 
                              type="number"
                              step="0.01"
                              className="w-full p-1 border rounded" 
                              defaultValue={service.total_price}
                              onBlur={(e) => handleCellEdit(service.id, 'total_price', parseFloat(e.target.value))}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded" 
                              onClick={() => setEditingCell({serviceId: service.id, field: 'total_price'})}
                            >
                              ${service.total_price}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <select
                            value={service.status}
                            onChange={(e) => handleStatusChange(service.id, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {editingCell?.serviceId === service.id && editingCell?.field === 'notes' ? (
                            <textarea 
                              className="w-full p-1 border rounded" 
                              defaultValue={service.notes || ''}
                              onBlur={(e) => handleCellEdit(service.id, 'notes', e.target.value)}
                              autoFocus
                              rows={3}
                            />
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded min-w-40 max-w-60 break-words" 
                              onClick={() => setEditingCell({serviceId: service.id, field: 'notes'})}
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