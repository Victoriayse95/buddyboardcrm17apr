'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import { getUnreadNotifications } from '@/services/notificationService';
import { Notification } from '@/types';

const Navbar = () => {
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const notifications = await getUnreadNotifications();
        setUnreadNotifications(notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadNotifications();
    // Set up a refresh interval for notifications
    const intervalId = setInterval(fetchUnreadNotifications, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
  };

  const navLinks = [
    { href: '/', label: 'Homepage' },
    { href: '/add-redemption', label: 'Add New Redemption' },
    { href: '/all-redemptions', label: 'All Redemptions' },
    { href: '/notifications', label: 'Notifications' }
  ];

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              Birthday Perks Tracker
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map(link => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href 
                      ? 'bg-primary-700 text-white' 
                      : 'text-primary-100 hover:bg-primary-500'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="relative ml-3">
            <button
              onClick={toggleNotificationMenu}
              className="relative p-1 rounded-full text-primary-100 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
            
            {isNotificationMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-semibold">Notifications</p>
                </div>
                {unreadNotifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-700">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {unreadNotifications.map(notification => (
                      <Link 
                        key={notification.id} 
                        href="/notifications"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsNotificationMenuOpen(false)}
                      >
                        {notification.message}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="px-4 py-2 text-sm text-primary-600 border-t">
                  <Link 
                    href="/notifications"
                    className="font-semibold"
                    onClick={() => setIsNotificationMenuOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-100 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href 
                  ? 'bg-primary-700 text-white' 
                  : 'text-primary-100 hover:bg-primary-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 