// Lead interface definition
export interface Lead {
  id: number;
  customer_name: string;
  customer_contact: string;
  service_provider_name: string;
  service_provider_contact: string;
  service_start_date: string;
  service_end_date: string;
  service_start_time: string;
  service_end_time: string;
  notes: string;
  total_price: number;
  status: string;
  created_at: string;
  handled_by?: string;
}

// Initial mock data
const initialLeads: Lead[] = [
  {
    id: 1,
    customer_name: "John Doe",
    customer_contact: "555-123-4567",
    service_provider_name: "Best Pet Care",
    service_provider_contact: "555-987-6543",
    service_start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_start_time: "09:00",
    service_end_time: "17:00",
    notes: "Dog needs special diet - premium food only",
    total_price: 150,
    status: "Send Reminder",
    created_at: "2023-06-01T10:30:00Z",
    handled_by: "Victoria"
  },
  {
    id: 2,
    customer_name: "Jane Smith",
    customer_contact: "555-234-5678",
    service_provider_name: "Paws & Claws",
    service_provider_contact: "555-876-5432",
    service_start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_start_time: "08:00",
    service_end_time: "18:00",
    notes: "Cat needs medication twice daily",
    total_price: 80,
    status: "Pending Service",
    created_at: "2023-06-02T14:15:00Z",
    handled_by: "Waiyee"
  },
  {
    id: 3,
    customer_name: "Robert Johnson",
    customer_contact: "555-345-6789",
    service_provider_name: "Happy Pets",
    service_provider_contact: "555-765-4321",
    service_start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_start_time: "10:00",
    service_end_time: "16:00",
    notes: "Bird cage needs cleaning, bring special disinfectant",
    total_price: 60,
    status: "Completed",
    created_at: "2023-05-28T09:45:00Z",
    handled_by: "Victoria"
  },
  {
    id: 4,
    customer_name: "Emily Wilson",
    customer_contact: "555-456-7890",
    service_provider_name: "Pet Paradise",
    service_provider_contact: "555-654-3210",
    service_start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_start_time: "11:00",
    service_end_time: "15:00",
    notes: "Hamster needs special food",
    total_price: 45,
    status: "Pending Service",
    created_at: "2023-06-03T16:20:00Z"
  },
  {
    id: 5,
    customer_name: "Michael Brown",
    customer_contact: "555-567-8901",
    service_provider_name: "Animal Care",
    service_provider_contact: "555-543-2109",
    service_start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service_start_time: "13:00",
    service_end_time: "19:00",
    notes: "Snake feeding schedule - bring live mice",
    total_price: 120,
    status: "Service In Progress",
    created_at: "2023-06-04T11:15:00Z",
    handled_by: "Waiyee"
  }
];

const STORAGE_KEY = 'buddyboard_leads';

// Function to get all leads
export function getLeads(): Lead[] {
  if (typeof window === 'undefined') {
    return initialLeads; // Return mock data when running server-side
  }
  
  const storedLeads = localStorage.getItem(STORAGE_KEY);
  
  if (!storedLeads) {
    // Initialize with mock data if no data exists
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLeads));
    return initialLeads;
  }
  
  return JSON.parse(storedLeads);
}

// Function to add a new lead
export function addLead(lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Lead {
  const leads = getLeads();
  
  // Generate a new ID by finding the max ID and adding 1
  const maxId = Math.max(...leads.map(l => l.id), 0);
  const newId = maxId + 1;
  
  // Create new lead with ID, timestamp, and default status
  const newLead: Lead = {
    ...lead,
    id: newId,
    status: 'Pending Service',
    created_at: new Date().toISOString()
  };
  
  // Add to existing leads and save
  const updatedLeads = [...leads, newLead];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
  
  return newLead;
}

// Function to update a lead
export function updateLead(id: number, updates: Partial<Lead>): Lead | null {
  const leads = getLeads();
  const leadIndex = leads.findIndex(lead => lead.id === id);
  
  if (leadIndex === -1) return null;
  
  // Update the lead
  const updatedLead = { ...leads[leadIndex], ...updates };
  leads[leadIndex] = updatedLead;
  
  // Save changes
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  
  return updatedLead;
}

// Function to delete a lead
export function deleteLead(id: number): boolean {
  const leads = getLeads();
  const filteredLeads = leads.filter(lead => lead.id !== id);
  
  if (filteredLeads.length === leads.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLeads));
  return true;
} 