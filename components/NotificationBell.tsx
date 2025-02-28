"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { Notification } from '@/lib/types';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user } = useUser();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) setNotifications(data);
        };

        fetchNotifications();

        // Realtime subscription
        const subscription = supabase
            .channel('notifications-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));
    };

    const markAllAsRead = async () => {
        if (notifications.length === 0) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', notifications.map(n => n.id));

        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-800"
            >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 12V10C17.25 7.1 14.9 4.75 12 4.75C9.1 4.75 6.75 7.1 6.75 10V12L4.75 16H19.25L17.25 12Z" />
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 16.75C9 18.2688 10.3312 19.25 12 19.25C13.6688 19.25 15 18.2688 15 16.75" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                    <div className="flex justify-between items-center p-3 border-b">
                        <h3 className="font-semibold">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Tümünü okundu işaretle
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-3 border-b hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex justify-between">
                                        <h4 className="font-medium">{notification.title}</h4>
                                        <small className="text-gray-500">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                    <div className="flex justify-between mt-2">
                                        <a
                                            href={notification.link}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Görüntüle
                                        </a>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Okundu işaretle
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                Bildirim bulunmuyor
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 