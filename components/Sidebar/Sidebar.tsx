

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/providers/UserProvider';

import ThemeToggle from '../ThemeToggle';
import NotificationBell from '../NotificationBell';
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { selectedCompany, user } = useUser();
    const pathname = usePathname();

    // Handle sidebar collapse on mobile by default
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        {
            name: 'Dashboard',
            path: `/${selectedCompany}/dashboard`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
            )
        },
        {
            name: 'Kanban',
            path: `/${selectedCompany}/kanban`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
            )
        },
        {
            name: 'İlerleme',
            path: `/${selectedCompany}/progress`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            )
        },
        {
            name: 'Ayarlar',
            path: `/${selectedCompany}/settings`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            )
        },
        {
            name: 'Company',
            path: `/${selectedCompany}/company`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
            )
        }
    ];

    return (
        <ThemeProvider>
            <aside className={`flex flex-col fixed h-full overflow-hidden bg-white dark:bg-gray-800 border-r z-10 border-gray-200 dark:border-gray-700 transition-all duration-300 w-14 hover:w-48`}>
                <div className='h-[94vh] flex flex-col'>
                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname.includes(item.path);

                            return (
                                <Link
                                    href={item.path}
                                    key={item.name}
                                    className={`flex items-center px-2 py-2 rounded-md ${isActive
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                                        } transition-colors`}
                                >
                                    <div className="flex items-center">
                                        {item.icon}
                                        {!isCollapsed && <span className="ml-4">{item.name}</span>}
                                    </div>
                                </Link>

                            );
                        })}
                    </nav>

                    {/* Footer */}

                    <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">

                            <div className="flex items-center justify-center px-1">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                    {user?.firstname ? user.firstname[0] : '?'}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium dark:text-white">{user?.firstname} {user?.lastname}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <NotificationBell />
                        </div>
                    </div>
                </div>
            </aside>
        </ThemeProvider>
    );
} 