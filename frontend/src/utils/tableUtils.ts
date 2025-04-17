import { Lead } from '@/lib/leadStorage';

// Sort directions
export type SortDirection = 'asc' | 'desc';

// Sort options for different column types
export interface SortOption {
  label: string;
  value: SortDirection;
  icon: string; // Class for icon
}

// Filter option type
export interface FilterOption {
  label: string;
  value: string;
}

// Key-value object for active filters
export interface ActiveFilters {
  [key: string]: string[];
}

// Generic type that can be indexed with a string
export interface IndexableItem {
  [key: string]: any;
}

// Get unique values for a specific column from leads array
export function getUniqueValues<T extends IndexableItem>(items: T[], field: string): string[] {
  const uniqueValues = new Set<string>();
  
  items.forEach(item => {
    // Handle null, undefined and empty values
    const value = item[field];
    if (value !== null && value !== undefined && value !== '') {
      uniqueValues.add(String(value));
    }
  });
  
  return Array.from(uniqueValues).sort();
}

// Get unique service provider names
export function getServiceProviders(items: Lead[]): string[] {
  return getUniqueValues(items, 'service_provider_name');
}

// Get unique statuses
export function getStatuses(items: Lead[]): string[] {
  return getUniqueValues(items, 'status');
}

// Get unique dates in MM/YYYY format for date filtering
export function getUniqueDatesByMonth<T extends IndexableItem>(items: T[], dateField: string = 'service_start_date'): string[] {
  const uniqueDates = new Set<string>();
  
  items.forEach(item => {
    const dateValue = item[dateField];
    if (dateValue) {
      const date = new Date(dateValue);
      // Format as MM/YYYY 
      const monthYear = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      uniqueDates.add(monthYear);
    }
  });
  
  // Sort by newest first
  return Array.from(uniqueDates).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number); 
    
    if (yearA !== yearB) return yearB - yearA; // Sort by year descending
    return monthB - monthA; // Then by month descending
  });
}

// Filter leads based on active filters
export function applyFilters<T extends IndexableItem>(items: T[], activeFilters: ActiveFilters): T[] {
  if (!activeFilters || Object.keys(activeFilters).length === 0) {
    return items;
  }
  
  return items.filter(item => {
    // Item must match all filter categories
    return Object.entries(activeFilters).every(([field, values]) => {
      // If no values are selected for this field, don't filter by it
      if (!values.length) return true;
      
      if (field === 'service_start_date_month') {
        // Special case for date month filtering
        const dateValue = item['service_start_date'] as string;
        if (!dateValue) return false;
        
        const date = new Date(dateValue);
        const monthYear = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        return values.includes(monthYear);
      }
      
      // Default filtering compares the field's value against the allowed values
      const fieldValue = String(item[field] || '');
      return values.includes(fieldValue);
    });
  });
}

// Sort leads based on a field and direction
export function sortItems<T extends IndexableItem>(items: T[], field: keyof T, direction: SortDirection): T[] {
  return [...items].sort((a, b) => {
    let valueA: any = a[field];
    let valueB: any = b[field];
    
    // Handle null/undefined values
    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';
    
    // Convert to strings for comparison if they're not dates
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      // Check if it's a date field
      if (field === 'service_start_date' || field === 'service_end_date' || field === 'completion_date' || field === 'created_at') {
        const dateA = new Date(valueA || 0);
        const dateB = new Date(valueB || 0);
        return direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      // For price, convert to number
      if (field === 'total_price') {
        const numA = parseFloat(valueA as string) || 0;
        const numB = parseFloat(valueB as string) || 0;
        return direction === 'asc' ? numA - numB : numB - numA;
      }
      
      // Default string comparison
      const strA = valueA.toLowerCase();
      const strB = valueB.toLowerCase();
      
      if (direction === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    }
    
    // Handle number comparison
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    // Default comparison
    return 0;
  });
} 