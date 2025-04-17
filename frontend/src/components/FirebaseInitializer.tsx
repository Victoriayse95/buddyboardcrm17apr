'use client';

import { useEffect, useState } from 'react';
import { checkFirebaseConnectivity, seedInitialData } from '@/lib/leadStorage';

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