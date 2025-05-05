'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getAllNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead } from '@/services/notificationService';
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
          notification.id === id ? { ...notification, isRead: true } : notification
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
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BellIcon className="h-8 w-8 mr-2 text-primary-600" />
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm btn-secondary"
          >
            Mark all as read
          </button>
        )}
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
                ${notification.isRead ? 'bg-gray-50' : 'bg-white border-primary-200 shadow-sm'}
              `}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="ml-2 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary-500"></span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                {!notification.isRead && (
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