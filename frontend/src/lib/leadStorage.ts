// Lead interface definition
import { db } from './firebase';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp, DocumentReference, DocumentData, Firestore, writeBatch
} from 'firebase/firestore';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export interface Lead {
  id: string; // Changed from number to string for Firestore document IDs
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

// Initial mock data - we'll use this if we need to seed the database
const initialLeads: Omit<Lead, 'id'>[] = [
  {
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
    created_at: new Date().toISOString(),
    handled_by: "Victoria"
  },
  {
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
  },
  {
    customer_name: "Three Day Reminder Lead",
    customer_contact: "555-678-9012",
    service_provider_name: "Pet Experts",
    service_provider_contact: "555-432-1098",
    service_start_date: (() => {
      // Calculate exactly 3 days from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      const dateString = threeDaysFromNow.toISOString().split('T')[0];
      console.log("Created test reminder lead for date:", dateString);
      return dateString;
    })(),
    service_end_date: (() => {
      // Calculate exactly 4 days from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fourDaysFromNow = new Date(today);
      fourDaysFromNow.setDate(today.getDate() + 4);
      return fourDaysFromNow.toISOString().split('T')[0];
    })(),
    service_start_time: "09:00",
    service_end_time: "17:00",
    notes: "Customer requires reminder call - exactly 3 days from today",
    total_price: 90,
    status: "Send Reminder",
    created_at: new Date().toISOString()
  }
];

// LocalStorage helper functions
const LOCAL_STORAGE_KEY = 'buddyboard_leads';

// Initialize local storage with mock data if empty
function initLocalStorage(): void {
  if (!isBrowser) return;
  
  const leadsFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (!leadsFromStorage) {
    const leadsWithIds = initialLeads.map((lead, index) => ({
      ...lead,
      id: `local-${index + 1}`
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leadsWithIds));
  }
}

// Get leads from local storage
function getLeadsFromLocalStorage(): Lead[] {
  if (!isBrowser) return [];
  
  initLocalStorage();
  const leadsFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
  return leadsFromStorage ? JSON.parse(leadsFromStorage) : [];
}

// Save leads to local storage
function saveLeadsToLocalStorage(leads: Lead[]): void {
  if (!isBrowser) return;
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
}

// Function to get all leads
export async function getLeads(): Promise<Lead[]> {
  // If not in browser, return empty array (for SSR)
  if (!isBrowser) return [];
  
  try {
    console.log("Attempting to fetch leads from Firebase...");
    const leadsRef = collection(db, 'leads');
    const querySnapshot = await getDocs(leadsRef);
    
    if (querySnapshot.empty) {
      console.log("No leads found in Firebase, retrieving from localStorage");
      return getLeadsFromLocalStorage();
    }
    
    console.log(`Successfully retrieved ${querySnapshot.docs.length} leads from Firebase`);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at ? new Date(data.created_at.seconds * 1000).toISOString() : new Date().toISOString()
      } as Lead;
    });
  } catch (error) {
    console.error("Error getting leads from Firebase:", error);
    console.info("Falling back to localStorage");
    return getLeadsFromLocalStorage();
  }
}

// Function to add a new lead
export async function addLead(lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead | null> {
  // If not in browser, return null (for SSR)
  if (!isBrowser) return null;
  
  try {
    console.log("Attempting to add lead to Firebase...");
    const leadsRef = collection(db, 'leads');
    
    // Create new lead with timestamp and default status
    const newLead = {
      ...lead,
      status: 'Pending Service',
      created_at: serverTimestamp()
    };
    
    const docRef = await addDoc(leadsRef, newLead);
    console.log(`Successfully added lead to Firebase with ID: ${docRef.id}`);
    
    return {
      id: docRef.id,
      ...lead,
      status: 'Pending Service',
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error adding lead to Firebase:", error);
    console.info("Falling back to localStorage");
    
    // Add to local storage
    const leads = getLeadsFromLocalStorage();
    const newLead = {
      ...lead,
      id: `local-${Date.now()}`,
      status: 'Pending Service',
      created_at: new Date().toISOString()
    };
    
    leads.push(newLead);
    saveLeadsToLocalStorage(leads);
    
    return newLead;
  }
}

// Function to update a lead
export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  // If not in browser, return null (for SSR)
  if (!isBrowser) return null;
  
  try {
    console.log(`Attempting to update lead ${id} in Firebase...`);
    
    // Check if it's a local ID (starts with 'local-')
    if (id.startsWith('local-')) {
      console.log(`Local ID detected: ${id}. Using localStorage.`);
      throw new Error('Local ID - using localStorage instead'); // Skip to catch block
    }
    
    const leadRef = doc(db, 'leads', id);
    
    // Remove id from updates if it exists
    const { id: _, ...updatesWithoutId } = updates;
    
    // Update the lead in Firestore
    await updateDoc(leadRef, updatesWithoutId);
    console.log(`Successfully updated lead ${id} in Firebase`);
    
    // Get the updated lead
    const updatedLeads = await getLeads();
    return updatedLeads.find(lead => lead.id === id) || null;
  } catch (error) {
    console.error("Error updating lead in Firebase:", error);
    console.info("Falling back to localStorage");
    
    // Update in local storage
    const leads = getLeadsFromLocalStorage();
    const leadIndex = leads.findIndex(lead => lead.id === id);
    
    if (leadIndex >= 0) {
      const updatedLead = { ...leads[leadIndex], ...updates };
      leads[leadIndex] = updatedLead;
      saveLeadsToLocalStorage(leads);
      return updatedLead;
    }
    
    return null;
  }
}

// Function to delete a lead
export async function deleteLead(id: string): Promise<boolean> {
  // If not in browser, return false (for SSR)
  if (!isBrowser) return false;
  
  try {
    console.log(`Attempting to delete lead ${id} from Firebase...`);
    
    // Check if it's a local ID (starts with 'local-')
    if (id.startsWith('local-')) {
      console.log(`Local ID detected: ${id}. Using localStorage.`);
      throw new Error('Local ID - using localStorage instead'); // Skip to catch block
    }
    
    const leadRef = doc(db, 'leads', id);
    await deleteDoc(leadRef);
    console.log(`Successfully deleted lead ${id} from Firebase`);
    return true;
  } catch (error) {
    console.error("Error deleting lead from Firebase:", error);
    console.info("Falling back to localStorage");
    
    // Delete from local storage
    const leads = getLeadsFromLocalStorage();
    const filteredLeads = leads.filter(lead => lead.id !== id);
    
    if (filteredLeads.length < leads.length) {
      saveLeadsToLocalStorage(filteredLeads);
      return true;
    }
    
    return false;
  }
}

// Function to seed initial data (use only once)
export async function seedInitialData(): Promise<void> {
  if (!isBrowser) return;
  
  try {
    console.log("Checking Firebase connectivity and seeding data if needed...");
    const leadsRef = collection(db, 'leads');
    const querySnapshot = await getDocs(leadsRef);
    
    // Only seed if collection is empty
    if (querySnapshot.empty) {
      console.log("Firebase connected but collection is empty. Seeding initial lead data...");
      
      // Create a batch for faster writes
      const batch = writeBatch(db);
      
      // Add each initial lead
      for (const lead of initialLeads) {
        const newDocRef = doc(leadsRef);
        batch.set(newDocRef, {
          ...lead,
          created_at: serverTimestamp()
        });
      }
      
      // Commit the batch
      await batch.commit();
      console.log("Initial data seeding to Firebase complete!");
    } else {
      console.log(`Firebase already contains ${querySnapshot.docs.length} leads. No seeding needed.`);
    }
    
    return;
  } catch (error) {
    console.error("Error seeding data to Firebase:", error);
    console.info("Initializing localStorage instead");
    initLocalStorage();
  }
}

// Function to check Firebase connectivity
export async function checkFirebaseConnectivity(): Promise<boolean> {
  if (!isBrowser) return false;
  
  try {
    console.log("Testing Firebase connectivity...");
    const leadsRef = collection(db, 'leads');
    await getDocs(leadsRef);
    console.log("Firebase connection successful");
    return true;
  } catch (error) {
    console.error("Firebase connectivity test failed:", error);
    return false;
  }
} 