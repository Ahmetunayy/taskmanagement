"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { Statistics } from '@/lib/types';

export default function StatisticsPanel() {
    const { selectedCompany } = useUser();
    const [stats, setStats] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStatistics() {
            if (!selectedCompany) return;

            setIsLoading(true);

            // Tüm görevleri çek
            const { data: tasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('company', selectedCompany);

            if (!tasks) {
                setIsLoading(false);
                return;
            }

            // Temel istatistikleri hesapla
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const overdueTasks = tasks.filter(task =>
                new Date(task.end_date) < new Date() && task.status !== 'completed'
            ).length;

            // Durum ve önceliğe göre görev sayıları
            const tasksByStatus = {
                not_started: tasks.filter(task => task.status === 'not_started').length,
                in_progress: tasks.filter(task => task.status === 'in_progress').length,
                completed: completedTasks
            };

            const tasksByPriority = {
                low: tasks.filter(task => task.priority === 'low').length,
                medium: tasks.filter(task => task.priority === 'medium').length,
                high: tasks.filter(task => task.priority === 'high').length
            };

            // Son 7 günün aktivitesi
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse();

            const tasksByDate = tasks.reduce((acc: Record<string, number>, task) => {
                const createdDate = task.created_at?.split('T')[0] || '';
                acc[createdDate] = (acc[createdDate] || 0) + 1;
                return acc;
            }, {});

            const recentActivity = last7Days.map(date => ({
                date,
                count: tasksByDate[date] || 0
            }));

            // İstatistikleri ayarla
            setStats({
                total_tasks: totalTasks,
                completed_tasks: completedTasks,
                overdue_tasks: overdueTasks,
                completion_rate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
                tasks_by_status: tasksByStatus,
                tasks_by_priority: tasksByPriority,
                recent_activity: recentActivity
            });

            setIsLoading(false);
        }

        fetchStatistics();
    }, [selectedCompany]);

    if (isLoading) {
        return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">Yükleniyor...</div>;
    }

    if (!stats) {
        return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">İstatistikler yüklenemedi.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Toplam Görev Kartı */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Görev</h3>
                <p className="text-2xl font-semibold">{stats.total_tasks}</p>
            </div>

            {/* Tamamlanan Görevler Kartı */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamamlanan</h3>
                <p className="text-2xl font-semibold text-green-600">{stats.completed_tasks}</p>
                <p className="text-sm text-gray-500">
                    {stats.completion_rate}% tamamlandı
                </p>
            </div>

            {/* Geciken Görevler Kartı */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Geciken</h3>
                <p className="text-2xl font-semibold text-red-600">{stats.overdue_tasks}</p>
            </div>

            {/* Durumlara Göre Görev Dağılımı */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum Dağılımı</h3>
                <div className="flex items-center gap-1 mt-2">
                    <div className="h-3 bg-blue-500 rounded" style={{ width: `${stats.tasks_by_status.not_started / stats.total_tasks * 100}%` }}></div>
                    <div className="h-3 bg-yellow-500 rounded" style={{ width: `${stats.tasks_by_status.in_progress / stats.total_tasks * 100}%` }}></div>
                    <div className="h-3 bg-green-500 rounded" style={{ width: `${stats.tasks_by_status.completed / stats.total_tasks * 100}%` }}></div>
                </div>
                <div className="flex text-xs mt-1 justify-between">
                    <span>Başlanmadı: {stats.tasks_by_status.not_started}</span>
                    <span>Devam Ediyor: {stats.tasks_by_status.in_progress}</span>
                    <span>Tamamlandı: {stats.tasks_by_status.completed}</span>
                </div>
            </div>
        </div>
    );
} 