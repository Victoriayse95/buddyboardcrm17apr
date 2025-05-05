'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getAllNotifications, markNotificationAsRead, deleteNotification } from '@/services/notificationService';
import { Notification } from '@/types';
import { BellIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const allNotifications = await getAllNotifications();
        setNotifications(allNotifications);
        setError(null);
      } catch (err) {
        setError('Failed to fetch notifications. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification. Please try again.');
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <BellIcon className="h-8 w-8 mr-2 text-indigo-600" />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          <p>No notifications available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`
                border rounded-lg p-4 flex items-start justify-between
                ${notification.read ? 'bg-gray-50' : 'bg-white border-indigo-200 shadow-sm'}
              `}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <span className="ml-2 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-green-600 hover:text-green-900"
                    title="Mark as Read"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 