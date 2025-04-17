// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAtHVCWjP1MgZvmC6RbVnVC6x8klioM2VQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "buddyboardcrm17apr.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "buddyboardcrm17apr",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "buddyboardcrm17apr.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "854033186391",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:854033186391:web:cd99d0ff59142ad4e0ad12"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

// Only initialize Firebase if it hasn't been initialized yet
// This prevents re-initialization during SSR
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    if (isBrowser) {
      console.log("Firebase initialized successfully");
    }
  } catch (error) {
    if (isBrowser) {
      console.error("Firebase initialization error:", error);
    }
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth }; 