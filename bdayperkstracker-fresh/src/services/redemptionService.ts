import { collection, query, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Redemption, RedemptionStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'redemptions';

// Get all redemptions
export const getAllRedemptions = async (): Promise<Redemption[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      } as Redemption;
    });
  } catch (error) {
    console.error('Error getting redemptions:', error);
    throw error;
  }
};

// Get redemptions for a specific month
export const getRedemptionsByMonth = async (month: string): Promise<Redemption[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('month', '==', month),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      } as Redemption;
    });
  } catch (error) {
    console.error('Error getting redemptions by month:', error);
    throw error;
  }
};

// Get a single redemption by ID
export const getRedemptionById = async (id: string): Promise<Redemption | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      } as Redemption;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting redemption:', error);
    throw error;
  }
};

// Add a new redemption
export const addRedemption = async (redemption: Omit<Redemption, 'id' | 'createdAt' | 'updatedAt'>): Promise<Redemption> => {
  try {
    const now = Timestamp.now();
    // Automatically set status to "To Redeem" for new entries
    const newRedemption = {
      ...redemption,
      status: redemption.status || 'To Redeem' as RedemptionStatus,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newRedemption);
    
    return {
      id: docRef.id,
      ...newRedemption,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    } as Redemption;
  } catch (error) {
    console.error('Error adding redemption:', error);
    throw error;
  }
};

// Update an existing redemption
export const updateRedemption = async (id: string, redemption: Partial<Redemption>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // Remove id from the update object if it exists
    const { id: _, createdAt: __, ...updateData } = redemption;
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating redemption:', error);
    throw error;
  }
};

// Delete a redemption
export const deleteRedemption = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting redemption:', error);
    throw error;
  }
}; 