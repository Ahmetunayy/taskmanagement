"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tag } from '@/lib/types';

interface FilterBarProps {
    onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
    status: string;
    priority: string;
    sortBy: string;
    query: string;
    tagIds: string[];
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        priority: 'all',
        sortBy: 'date',
        query: '',
        tagIds: []
    });

    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        async function fetchTags() {
            const { data } = await supabase
                .from('tags')
                .select('*');

            if (data) setTags(data);
        }

        fetchTags();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedFilters = { ...filters, [name]: value };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arama</label>
                <div className="relative">
                    <input
                        type="text"
                        name="query"
                        value={filters.query}
                        onChange={handleFilterChange}
                        placeholder="Görev ara..."
                        className="w-full p-2 pl-8 border dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                >
                    <option value="all">Tümü</option>
                    <option value="not_started">Başlanmadı</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Öncelik</label>
                <select
                    name="priority"
                    value={filters.priority}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                >
                    <option value="all">Tümü</option>
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sırala</label>
                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md"
                >
                    <option value="date">Tarih</option>
                    <option value="priority">Öncelik</option>
                    <option value="title">Başlık</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiketler</label>
                <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                                const newFilters = {
                                    ...filters,
                                    tagIds: filters.tagIds.includes(tag.id)
                                        ? filters.tagIds.filter(id => id !== tag.id)
                                        : [...filters.tagIds, tag.id]
                                };
                                setFilters(newFilters);
                                onFilterChange(newFilters);
                            }}
                            className={`px-2 py-1 rounded-full text-xs transition-colors ${filters.tagIds.includes(tag.id)
                                    ? 'bg-opacity-100'
                                    : 'bg-opacity-20'
                                }`}
                            style={{
                                backgroundColor: filters.tagIds.includes(tag.id)
                                    ? tag.color
                                    : tag.color + '20',
                                color: filters.tagIds.includes(tag.id)
                                    ? 'white'
                                    : tag.color
                            }}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 