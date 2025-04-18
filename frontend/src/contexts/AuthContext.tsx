'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { getUserProfile, initializeUserProfile, UserProfile } from '@/lib/userProfile';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get or initialize user profile
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            // Create new profile if not exists
            const newProfile = await initializeUserProfile(firebaseUser);
            setUser(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For testing or development: Use mock login if needed
      if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
        console.log('Using mock authentication');
        
        const mockUserData: UserProfile = {
          id: '1',
          email: email,
          displayName: 'Test User',
          photoURL: null,
          role: 'admin',
          phoneNumber: null,
          lastUpdated: new Date(),
          createdAt: new Date(),
          preferences: {
            theme: 'system',
            notifications: true
          }
        };
        
        setUser(mockUserData);
        setLoading(false);
        return;
      }
      
      // Real Firebase auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Firebase will trigger the auth state change listener above,
      // which will set the user state with the profile
    } catch (error: any) {
      console.error('Login error:', error.code, error.message);
      
      let errorMessage = 'Failed to login. Please check your credentials and try again.';
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later or reset your password';
      }
      
      toast.error(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Auth state change listener will clear the user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 