import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, where, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Notification } from '@/types';

const COLLECTION_NAME = 'notifications';

export const addNotification = async (message: string) => {
  try {
    const now = new Date().toISOString();
    const notificationData = {
      message,
      read: false,
      createdAt: now
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), notificationData);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Notification;
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Notification;
    });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
}; 