import { collection, query, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Notification } from '@/types';

const COLLECTION_NAME = 'notifications';

// Get all notifications
export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } as Notification;
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Get unread notifications
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } as Notification;
    });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

// Add a new notification
export const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
  try {
    const now = Timestamp.now();
    const newNotification = {
      ...notification,
      isRead: false, // Ensure new notifications are unread
      createdAt: now,
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newNotification);
    
    return {
      id: docRef.id,
      ...newNotification,
      createdAt: now.toDate().toISOString(),
    } as Notification;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const notifications = await getUnreadNotifications();
    
    // Create a batch of promises to update all unread notifications
    const updatePromises = notifications.map(notification => 
      markNotificationAsRead(notification.id)
    );
    
    // Execute all updates in parallel
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}; 