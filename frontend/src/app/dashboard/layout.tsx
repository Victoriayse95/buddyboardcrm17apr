'use client';

import { Fragment, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { HomeIcon, UsersIcon, PlusCircleIcon, CheckCircleIcon, ArchiveBoxIcon, ClipboardIcon } from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [tasksMenuOpen, setTasksMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/dashboard/home', icon: HomeIcon, current: pathname === '/dashboard/home', isButton: false },
    { name: 'All Leads', href: '/dashboard/leads', icon: UsersIcon, current: pathname === '/dashboard/leads', isButton: false },
    { name: 'Add New Lead', href: '/dashboard/leads/new', icon: PlusCircleIcon, current: pathname === '/dashboard/leads/new', isButton: false },
    { 
      name: 'Tasks', 
      href: '/dashboard/upcoming', 
      icon: ClipboardIcon, 
      current: ['/dashboard/upcoming', '/dashboard/archived', '/dashboard/completed'].includes(pathname), 
      isButton: false,
      hasDropdown: true 
    },
  ];

  const tasksNavigation = [
    { name: 'Upcoming', href: '/dashboard/upcoming', icon: ClipboardIcon, current: pathname === '/dashboard/upcoming' },
    { name: 'Archived', href: '/dashboard/archived', icon: ArchiveBoxIcon, current: pathname === '/dashboard/archived' },
    { name: 'Completed', href: '/dashboard/completed', icon: CheckCircleIcon, current: pathname === '/dashboard/completed' },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Disclosure as="nav" className="bg-white shadow-sm">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-600">BuddyBoard</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex">
                    {navigation.map((item) => (
                      <div key={item.name} className={item.hasDropdown ? "relative" : ""} 
                           onMouseEnter={item.hasDropdown ? () => setTasksMenuOpen(true) : undefined} 
                           onMouseLeave={item.hasDropdown ? () => setTasksMenuOpen(false) : undefined}>
                        {item.isButton ? (
                          <button
                            onClick={() => router.push(item.href)}
                            className={classNames(
                              item.current
                                ? 'border-indigo-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                              'inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium h-16'
                            )}
                          >
                            {item.name}
                            {item.hasDropdown && <ChevronDownIcon className="ml-1 h-4 w-4" />}
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'border-indigo-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                              'inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium h-16'
                            )}
                          >
                            {item.name}
                            {item.hasDropdown && <ChevronDownIcon className="ml-1 h-4 w-4" />}
                          </Link>
                        )}
                        
                        {item.hasDropdown && tasksMenuOpen && (
                          <div className="absolute z-10 mt-0 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {tasksNavigation.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={classNames(
                                  subItem.current ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block px-4 py-2 text-sm hover:bg-gray-100'
                                )}
                              >
                                <span className="flex items-center">
                                  <subItem.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                  {subItem.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
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
                    {tasksNavigation.map((item) => (
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 