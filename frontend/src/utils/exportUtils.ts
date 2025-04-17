import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Lead } from '@/lib/leadStorage';

// Format date strings in a readable format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

// Format price as currency
const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Export leads data to Excel file
 */
export const exportLeadsToExcel = (leads: Lead[], fileName: string = 'leads'): void => {
  // Convert leads to a format suitable for Excel
  const data = leads.map(lead => ({
    'Customer Name': lead.customer_name,
    'Customer Contact': lead.customer_contact,
    'Service Provider': lead.service_provider_name,
    'Provider Contact': lead.service_provider_contact,
    'Service Start Date': formatDate(lead.service_start_date),
    'Service End Date': formatDate(lead.service_end_date),
    'Start Time': lead.service_start_time,
    'End Time': lead.service_end_time,
    'Total Price': formatPrice(lead.total_price),
    'Status': lead.status,
    'Notes': lead.notes,
    'Handled By': lead.handled_by || 'Not assigned',
    'Created At': formatDate(lead.created_at)
  }));
  
  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Generic function to export any data to Excel
 */
export const exportDataToExcel = <T extends Record<string, any>>(
  data: T[],
  fileName: string = 'export',
  sheetName: string = 'Sheet1'
): void => {
  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
}; 