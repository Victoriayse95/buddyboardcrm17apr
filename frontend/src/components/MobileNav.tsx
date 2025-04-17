'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

// Define mobile navigation link props
interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

// Simple mobile navigation component tailored for small screens
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent body scrolling when menu is open
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Optimized mobile navigation link component
  const MobileNavLink: React.FC<MobileNavLinkProps> = ({ 
    href, 
    children, 
    onClick, 
    isActive = pathname === href 
  }) => {
    return (
      <Link
        href={href}
        className={`block w-full py-3 px-4 text-left text-base font-medium ${
          isActive 
            ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' 
            : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
        }`}
        onClick={() => {
          if (onClick) onClick();
          closeMenu();
        }}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed z-40 bottom-4 left-4 sm:hidden">
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg focus:outline-none"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } transition-transform duration-300 ease-in-out sm:hidden`}
        style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', maxHeight: '80vh' }}
      >
        <div className="bg-white shadow-t-lg overflow-y-auto max-h-[80vh]">
          <div className="pt-5 pb-6 px-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-semibold text-indigo-600">Menu</div>
              <button
                type="button"
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="py-2">
                <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
                <MobileNavLink href="/dashboard/upcoming">Upcoming</MobileNavLink>
                <MobileNavLink href="/dashboard/customers">Customers</MobileNavLink>
                <MobileNavLink href="/dashboard/leads/new">Add New Lead</MobileNavLink>
                <MobileNavLink href="/dashboard/archived">Archived</MobileNavLink>
                <MobileNavLink href="/dashboard/service-completed">Completed</MobileNavLink>
              </div>
              
              <div className="py-2">
                <MobileNavLink href="/dashboard/profile">Profile</MobileNavLink>
                <button
                  onClick={() => {
                    // Handle logout
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }
                    closeMenu();
                  }}
                  className="block w-full py-3 px-4 text-left text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 