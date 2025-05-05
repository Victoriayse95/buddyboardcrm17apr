import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { User, UserRole } from '@/types';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Fallback if user doc doesn't exist
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      setUser(userDoc.data() as User);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const userData: User = {
      id: cred.user.uid,
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    setUser(userData);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signUp, signOut }}>
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