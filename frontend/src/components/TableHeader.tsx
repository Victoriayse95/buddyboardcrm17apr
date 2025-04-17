import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { SortDirection, FilterOption } from '@/utils/tableUtils';

interface TableHeaderProps {
  label: string;
  field: string;
  sortable?: boolean;
  filterable?: boolean;
  sortDirection?: SortDirection | null;
  onSort?: (field: string, direction: SortDirection) => void;
  filterOptions?: FilterOption[];
  activeFilters?: string[];
  onFilter?: (field: string, values: string[]) => void;
}

export default function TableHeader({
  label,
  field,
  sortable = true,
  filterable = false,
  sortDirection = null,
  onSort,
  filterOptions = [],
  activeFilters = [],
  onFilter
}: TableHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside to close filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle sort direction
  const handleSort = () => {
    if (!sortable || !onSort) return;
    
    // Cycle through: null -> 'asc' -> 'desc' -> null
    let newDirection: SortDirection | null = null;
    if (sortDirection === null) {
      newDirection = 'asc';
    } else if (sortDirection === 'asc') {
      newDirection = 'desc';
    }
    
    if (newDirection) {
      onSort(field, newDirection);
    } else {
      // Reset sort
      onSort(field, 'asc'); // Just toggle back to asc
    }
  };
  
  // Toggle filter dropdown
  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!filterable || filterOptions.length === 0) return;
    setFilterOpen(!filterOpen);
  };
  
  // Handle filter selection
  const handleFilterChange = (value: string, checked: boolean) => {
    if (!onFilter) return;
    
    let newValues = [...activeFilters];
    if (checked) {
      // Add filter
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      // Remove filter
      newValues = newValues.filter(v => v !== value);
    }
    
    onFilter(field, newValues);
  };
  
  // Clear all filters for this field
  const clearFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFilter) return;
    onFilter(field, []);
    setFilterOpen(false);
  };
  
  return (
    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 relative">
      <div 
        className={`group flex items-center gap-x-2 ${sortable ? 'cursor-pointer' : ''}`}
        onClick={handleSort}
      >
        <span>{label}</span>
        
        {sortable && (
          <span className="flex flex-col">
            <ChevronUpIcon 
              className={`h-3 w-3 ${sortDirection === 'asc' ? 'text-indigo-600' : 'text-gray-400'}`} 
            />
            <ChevronDownIcon 
              className={`h-3 w-3 -mt-1 ${sortDirection === 'desc' ? 'text-indigo-600' : 'text-gray-400'}`} 
            />
          </span>
        )}
        
        {filterable && filterOptions.length > 0 && (
          <FunnelIcon 
            className={`h-4 w-4 ml-1 ${activeFilters.length > 0 ? 'text-indigo-600' : 'text-gray-400'}`}
            onClick={toggleFilter}
          />
        )}
      </div>
      
      {filterable && filterOpen && (
        <div 
          ref={filterRef}
          className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md p-2 z-10 min-w-48 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-2 border-b pb-1">
            <span className="text-xs font-semibold text-gray-500">Filter: {label}</span>
            <button 
              className="text-xs text-red-500 hover:text-red-700"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filterOptions.map(option => (
              <div key={option.value} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`filter-${field}-${option.value}`}
                  checked={activeFilters.includes(option.value)}
                  onChange={(e) => handleFilterChange(option.value, e.target.checked)}
                  className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label 
                  htmlFor={`filter-${field}-${option.value}`}
                  className="text-xs text-gray-700 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </th>
  );
} 