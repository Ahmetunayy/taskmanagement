"use client";
import { useSidebar } from '@/providers/SidebarContext';
import React, { useState, useEffect } from 'react'
import Progress from './components/Progress';
import FilterBar, { FilterOptions } from '@/components/FilterBar';
import { Task } from '@/lib/types';

export default function ProgressPage() {
    const { tasks, steps } = useSidebar();
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

    // Başlangıçta tüm görevleri göster
    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    // Filtreleme fonksiyonu
    const handleFilterChange = (filters: FilterOptions) => {
        let result = [...tasks];

        // Metin araması
        if (filters.query) {
            const query = filters.query.toLowerCase();
            result = result.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            );
        }

        // Durum filtresi
        if (filters.status !== 'all') {
            result = result.filter(task => task.status === filters.status);
        }

        // Öncelik filtresi
        if (filters.priority !== 'all') {
            result = result.filter(task => task.priority === filters.priority);
        }

        // Sıralama
        if (filters.sortBy === 'date') {
            result.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        } else if (filters.sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            result.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
        } else if (filters.sortBy === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredTasks(result);
    };

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">İlerleme Takibi</h1>

            <FilterBar onFilterChange={handleFilterChange} />


            <Progress tasks={filteredTasks} steps={steps} loading={false} />

        </>
    );
}