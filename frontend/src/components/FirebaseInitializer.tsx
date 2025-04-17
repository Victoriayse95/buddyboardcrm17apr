'use client';

import { useEffect, useState } from 'react';
import { checkFirebaseConnectivity, seedInitialData, checkForLeadsRequiringReminders } from '@/lib/leadStorage';

export default function FirebaseInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log("Starting Firebase initialization...");
        const isConnected = await checkFirebaseConnectivity();
        
        if (isConnected) {
          console.log("Firebase connected, seeding data if needed...");
          await seedInitialData();
          console.log("Firebase initialization complete");
          
          // Check for leads that need reminders (3 days before service)
          console.log("Checking for leads that need reminders...");
          const updatedLeads = await checkForLeadsRequiringReminders();
          if (updatedLeads.length > 0) {
            console.log(`Updated ${updatedLeads.length} leads with "Send Reminder" status`);
          } else {
            console.log("No leads requiring reminders found");
          }
        } else {
          console.warn("Could not connect to Firebase, using localStorage fallback");
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error during Firebase initialization:", error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite retries
      }
    };

    initializeFirebase();
  }, []);

  // This component doesn't render anything visible
  return null;
} 