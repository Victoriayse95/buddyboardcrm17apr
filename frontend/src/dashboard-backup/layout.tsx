'use client';

import './dashboard.css';
import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { HomeIcon, UsersIcon, PlusCircleIcon, CheckCircleIcon, ArchiveBoxIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import api, { checkServerConnection } from '@/lib/api';
import ScrollHelper from '@/components/ScrollHelper';
import CommonFixesButton from './CommonFixesButton';
import DashboardErrorBoundary from './DashboardErrorBoundary';
import MobileNav from '@/components/MobileNav';
import ResponsiveFixesLoader from '@/components/ResponsiveFixesLoader';
import IOSFixes from '@/components/IOSFixes';

// Define interfaces for navigation items
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & { title?: string; titleId?: string }>;
  current: boolean;
  hasDropdown?: boolean;
  isButton?: boolean;
}

interface DropdownNavigationItem {
  name: string;
  href: string;
  current: boolean;
  children?: NavigationItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [tasksMenuOpen, setTasksMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check server status periodically
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        console.log('Checking server status...');
        const isConnected = await checkServerConnection();
        console.log('Server connection check result:', isConnected);
        setServerStatus(isConnected ? 'online' : 'offline');
      } catch (error) {
        console.error('Error checking server status:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const navigation: NavigationItem[] = [
    { name: 'Tasks', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
    { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon, current: pathname.includes('/dashboard/customers') },
    { name: 'Add New Lead', href: '/dashboard/leads/new', icon: PlusCircleIcon, current: pathname.includes('/dashboard/leads/new') },
  ];

  const tasksSubmenu: NavigationItem[] = [
    { name: 'Archived', href: '/dashboard/archived', icon: ArchiveBoxIcon, current: pathname.includes('/dashboard/archived') },
    { name: 'Completed', href: '/dashboard/service-completed', icon: CheckCircleIcon, current: pathname.includes('/dashboard/service-completed') },
  ];

  const dropdownNavigation: DropdownNavigationItem[] = [
    { name: 'Tasks', href: '#', current: false, children: tasksSubmenu },
    { name: 'Profile', href: '/dashboard/profile', current: pathname.includes('/dashboard/profile') },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ScrollHelper />
      <CommonFixesButton />
      <MobileNav />
      <ResponsiveFixesLoader />
      <IOSFixes />
      <Disclosure as="nav" className="bg-indigo-600">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-white font-bold text-xl">BuddyBoard CRM</span>
                  </div>
                  {/* Server status indicator */}
                  {serverStatus !== 'online' && (
                    <div className="ml-3 bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center">
                      <span className="h-2 w-2 bg-red-300 rounded-full mr-2 animate-pulse"></span>
                      Server Offline
                    </div>
                  )}
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <div 
                          key={item.name}
                          className="relative"
                          onMouseEnter={() => item.name === 'Tasks' ? setTasksMenuOpen(true) : null}
                          onMouseLeave={() => item.name === 'Tasks' ? setTasksMenuOpen(false) : null}
                        >
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-indigo-700 text-white'
                                : 'text-white hover:bg-indigo-500',
                              'rounded-md px-3 py-2 text-sm font-medium flex items-center'
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            <item.icon className="h-5 w-5 mr-2" />
                            {item.name}
                            {item.name === 'Tasks' && (
                              <ChevronDownIcon className="h-4 w-4 ml-1" />
                            )}
                          </Link>
                          
                          {/* Tasks Dropdown */}
                          {item.name === 'Tasks' && tasksMenuOpen && (
                            <div className="absolute z-10 mt-1 w-48 bg-white shadow-lg rounded-md py-1">
                              {tasksSubmenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={classNames(
                                    subItem.current ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                  )}
                                >
                                  <div className="flex items-center">
                                    <subItem.icon className="h-5 w-5 mr-2" />
                                    {subItem.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex sm:items-center">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {user?.full_name.charAt(0)}
                          </span>
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full px-4 py-2 text-left text-sm text-gray-700'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  !item.hasDropdown ? (
                    item.isButton ? (
                      <Disclosure.Button
                        key={item.name}
                        as="button"
                        onClick={() => router.push(item.href)}
                        className={classNames(
                          item.current
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                          'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                        )}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ) : (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                          'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                        )}
                      >
                        {item.name}
                      </Disclosure.Button>
                    )
                  ) : null
                ))}
                
                {/* Mobile Tasks dropdown shown as list items */}
                <div className="border-l-4 border-transparent">
                  <div className="pl-3 pr-4 py-2 text-base font-medium text-gray-600">Tasks</div>
                  <div className="pl-6">
                    {tasksSubmenu.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                          'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                        )}
                      >
                        <span className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {item.name}
                        </span>
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium">
                        {user?.full_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.full_name}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as="button"
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <DashboardErrorBoundary>
              {children}
            </DashboardErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
} 