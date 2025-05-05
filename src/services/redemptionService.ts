import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Redemption } from '@/types';

const COLLECTION_NAME = 'redemptions';

export const addRedemption = async (redemptionData: Omit<Redemption, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...redemptionData,
      createdAt: now,
      updatedAt: now
    });
    return { id: docRef.id, ...redemptionData, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('Error adding redemption:', error);
    throw error;
  }
};

export const updateRedemption = async (id: string, redemptionData: Partial<Omit<Redemption, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...redemptionData,
      updatedAt: now
    });
    return { id, ...redemptionData, updatedAt: now };
  } catch (error) {
    console.error('Error updating redemption:', error);
    throw error;
  }
};

export const deleteRedemption = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting redemption:', error);
    throw error;
  }
};

export const getAllRedemptions = async (): Promise<Redemption[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Redemption;
    });
  } catch (error) {
    console.error('Error getting redemptions:', error);
    throw error;
  }
};

export const getRedemptionById = async (id: string): Promise<Redemption | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      } as Redemption;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting redemption:', error);
    throw error;
  }
}; 