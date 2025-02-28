"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tag } from '@/lib/types';

interface TagFilterProps {
    taskIds: string[];
    onChange: (filteredTaskIds: string[]) => void;
}

export default function TagFilter({ taskIds, onChange }: TagFilterProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    // Tüm etiketleri yükle
    useEffect(() => {
        async function fetchTags() {
            const { data } = await supabase
                .from('tags')
                .select('*');

            if (data) setTags(data);
        }

        fetchTags();
    }, []);

    // Seçilen etiketler değiştiğinde filtreyi uygula
    useEffect(() => {
        async function applyFilter() {
            if (selectedTagIds.length === 0) {
                onChange(taskIds); // Tüm görevleri göster
                return;
            }

            // Seçilen etiketlere sahip görevleri bul
            const { data } = await supabase
                .from('task_tags')
                .select('task_id')
                .in('tag_id', selectedTagIds);

            if (data) {
                const filteredTaskIds = data.map(item => item.task_id);
                // Sadece mevcut taskIds listesindeki görevleri filtrele
                onChange(taskIds.filter(id => filteredTaskIds.includes(id)));
            }
        }

        applyFilter();
    }, [selectedTagIds, taskIds, onChange]);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiketler</label>
            <div className="flex flex-wrap gap-1 mt-1">
                {tags.map(tag => (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                            setSelectedTagIds(prev =>
                                prev.includes(tag.id)
                                    ? prev.filter(id => id !== tag.id)
                                    : [...prev, tag.id]
                            );
                        }}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${selectedTagIds.includes(tag.id)
                                ? 'bg-opacity-100'
                                : 'bg-opacity-20'
                            }`}
                        style={{
                            backgroundColor: selectedTagIds.includes(tag.id)
                                ? tag.color
                                : tag.color + '20',
                            color: selectedTagIds.includes(tag.id)
                                ? 'white'
                                : tag.color
                        }}
                    >
                        {tag.name}
                    </button>
                ))}
            </div>
        </div>
    );
} 