import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { toast } from 'react-hot-toast';

// Type definitions
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'admin' | 'staff';
  phoneNumber: string | null;
  lastUpdated: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
  customFields?: Record<string, any>;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Helper functions
const getUserCollection = () => 'users';

// Initialize a new user profile in Firestore
export async function initializeUserProfile(user: FirebaseUser): Promise<UserProfile | null> {
  try {
    if (!isBrowser) return null;
    
    const userRef = doc(db, getUserCollection(), user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user profile
      const newProfile: Omit<UserProfile, 'id'> = {
        email: user.email || '',
        displayName: user.displayName || 'Admin User',
        photoURL: user.photoURL,
        role: 'admin', // Default role
        phoneNumber: user.phoneNumber,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
        preferences: {
          theme: 'system',
          notifications: true
        }
      };
      
      await setDoc(userRef, newProfile);
      
      return {
        id: user.uid,
        ...newProfile
      } as UserProfile;
    } else {
      // Update last login timestamp
      await updateDoc(userRef, {
        lastUpdated: serverTimestamp()
      });
      
      return {
        id: user.uid,
        ...userSnap.data()
      } as UserProfile;
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
    return null;
  }
}

// Get a user profile from Firestore
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!isBrowser) return null;
    
    const userRef = doc(db, getUserCollection(), userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userId,
        ...userSnap.data()
      } as UserProfile;
    } else {
      console.warn(`User profile for ${userId} not found`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update a user's profile in Firestore
export async function updateUserProfile(
  userId: string,
  profileUpdates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<UserProfile | null> {
  try {
    if (!isBrowser) return null;
    
    const userRef = doc(db, getUserCollection(), userId);
    
    // Add timestamp
    const updates = {
      ...profileUpdates,
      lastUpdated: serverTimestamp()
    };
    
    await updateDoc(userRef, updates);
    
    // Get updated profile
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    toast.error('Failed to update profile. Please try again.');
    return null;
  }
}

// Update user email (requires recent authentication)
export async function updateUserEmail(
  currentPassword: string, 
  newEmail: string
): Promise<boolean> {
  try {
    if (!isBrowser || !auth.currentUser) {
      console.error('[updateUserEmail] Not authenticated or not in browser environment');
      toast.error('Not authenticated');
      return false;
    }
    
    const user = auth.currentUser;
    console.log('[updateUserEmail] Current user found:', user.uid);
    
    if (!user.email) {
      console.error('[updateUserEmail] Current user has no email');
      toast.error('User has no email address');
      return false;
    }
    
    // Check if the new email is the same as the current email
    if (user.email === newEmail) {
      console.log('[updateUserEmail] New email is the same as current email');
      toast.error('The new email is the same as your current email');
      return false;
    }
    
    // Re-authenticate user before changing email
    console.log('[updateUserEmail] Attempting to re-authenticate user with provided password');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('[updateUserEmail] Re-authentication successful');
    } catch (authError: any) {
      console.error('[updateUserEmail] Re-authentication failed:', authError.code, authError.message);
      
      if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        toast.error('The password you entered is incorrect');
      } else if (authError.code === 'auth/too-many-requests') {
        toast.error('Too many unsuccessful attempts. Please try again later');
      } else if (authError.code === 'auth/user-mismatch') {
        toast.error('The credentials do not match the current user');
      } else {
        toast.error('Authentication failed. Please try again');
      }
      
      return false;
    }
    
    // Update email in Firebase Auth
    console.log('[updateUserEmail] Updating email in Firebase Auth');
    try {
      await updateEmail(user, newEmail);
      console.log('[updateUserEmail] Firebase Auth email update successful');
    } catch (emailError: any) {
      console.error('[updateUserEmail] Failed to update email in Firebase Auth:', emailError.code, emailError.message);
      
      if (emailError.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use by another account');
      } else if (emailError.code === 'auth/invalid-email') {
        toast.error('The email address is not valid');
      } else if (emailError.code === 'auth/requires-recent-login') {
        toast.error('For security, please log out and log back in before changing your email');
      } else {
        toast.error('Failed to update email in authentication system');
      }
      
      return false;
    }
    
    // Update email in Firestore profile
    console.log('[updateUserEmail] Updating email in Firestore profile');
    try {
      const userRef = doc(db, getUserCollection(), user.uid);
      await updateDoc(userRef, {
        email: newEmail,
        lastUpdated: serverTimestamp()
      });
      console.log('[updateUserEmail] Firestore profile email update successful');
    } catch (firestoreError: any) {
      console.error('[updateUserEmail] Failed to update email in Firestore:', firestoreError);
      
      // Despite the Firestore error, the email was updated in Firebase Auth
      // We should still consider this a partial success but warn the user
      toast.error('Email updated in authentication but profile data wasn\'t synchronized. Please refresh the page.');
      
      // Force reload to reflect the auth changes
      window.location.reload();
      return true;
    }
    
    // Success path
    toast.success('Email updated successfully');
    return true;
    
  } catch (error: any) {
    // This is the general catch-all error handler
    console.error('[updateUserEmail] Unhandled error:', error);
    console.error('[updateUserEmail] Error code:', error.code);
    console.error('[updateUserEmail] Error message:', error.message);
    
    toast.error('Failed to update email. Please try again');
    return false;
  }
}

// Update user password (requires recent authentication)
export async function updateUserPassword(
  currentPassword: string, 
  newPassword: string
): Promise<boolean> {
  try {
    if (!isBrowser || !auth.currentUser) {
      toast.error('Not authenticated');
      return false;
    }
    
    const user = auth.currentUser;
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password in Firebase Auth
    await updatePassword(user, newPassword);
    
    // Update lastUpdated in Firestore profile
    const userRef = doc(db, getUserCollection(), user.uid);
    await updateDoc(userRef, {
      lastUpdated: serverTimestamp()
    });
    
    toast.success('Password updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating password:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/requires-recent-login') {
      toast.error('For security, please log out and log back in before changing your password');
    } else if (error.code === 'auth/invalid-credential') {
      toast.error('Incorrect password');
    } else if (error.code === 'auth/weak-password') {
      toast.error('Password is too weak. Please use a stronger password');
    } else {
      toast.error('Failed to update password. Please try again');
    }
    
    return false;
  }
}

// Upload profile photo
export async function uploadProfilePhoto(
  userId: string, 
  file: File
): Promise<string | null> {
  try {
    if (!isBrowser) return null;
    
    // Create a storage reference
    const photoRef = ref(storage, `profile_photos/${userId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(photoRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user profile with new photo URL
    const userRef = doc(db, getUserCollection(), userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      lastUpdated: serverTimestamp()
    });
    
    // We'll only update Firestore since updateProfile isn't available on FirebaseUser
    toast.success('Profile photo uploaded successfully');
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    toast.error('Failed to upload profile photo. Please try again.');
    return null;
  }
}

// Delete profile photo
export async function deleteProfilePhoto(userId: string, photoURL: string): Promise<boolean> {
  try {
    if (!isBrowser) return false;
    
    // Extract the path from the URL
    const path = decodeURIComponent(photoURL.split('profile_photos/')[1].split('?')[0]);
    const photoRef = ref(storage, `profile_photos/${path}`);
    
    // Delete the file
    await deleteObject(photoRef);
    
    // Update user profile to remove photo URL
    const userRef = doc(db, getUserCollection(), userId);
    await updateDoc(userRef, {
      photoURL: null,
      lastUpdated: serverTimestamp()
    });
    
    // We'll only update Firestore since updateProfile isn't available on FirebaseUser
    toast.success('Profile photo deleted');
    return true;
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    toast.error('Failed to delete profile photo. Please try again.');
    return false;
  }
}

// Update user preferences
export async function updateUserPreferences(
  userId: string,
  preferences: UserProfile['preferences']
): Promise<boolean> {
  try {
    if (!isBrowser) return false;
    
    const userRef = doc(db, getUserCollection(), userId);
    await updateDoc(userRef, {
      preferences,
      lastUpdated: serverTimestamp()
    });
    
    toast.success('Preferences updated');
    return true;
  } catch (error) {
    console.error('Error updating preferences:', error);
    toast.error('Failed to update preferences. Please try again.');
    return false;
  }
} 