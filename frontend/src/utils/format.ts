/**
 * Format a date string or timestamp to a human-readable format
 * @param dateString - Date string in ISO format or timestamp
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  // Format: Month Day, Year at Time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a currency value
 * @param amount - Number to format as currency
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
} 