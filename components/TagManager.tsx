"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { usePermissions } from '@/providers/PermissionProvider';
import { Tag } from '@/lib/types';

export default function TagManager() {
    const { selectedCompany } = useUser();
    const { hasPermission } = usePermissions();
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState({ name: '', color: '#4f46e5' });
    const [isLoading, setIsLoading] = useState(false);

    // İzin kontrolü
    const canCreateTag = hasPermission('create_tag');
    const canDeleteTag = hasPermission('delete_tag');

    // Etiketleri yükle
    useEffect(() => {
        async function fetchTags() {
            if (!selectedCompany) return;

            const { data } = await supabase
                .from('tags')
                .select('*')
                .eq('company_id', selectedCompany);

            if (data) setTags(data);
        }

        fetchTags();
    }, [selectedCompany]);

    // Yeni etiket oluştur
    const createTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.name || !selectedCompany || !canCreateTag) return;

        setIsLoading(true);

        const { data } = await supabase
            .from('tags')
            .insert([{
                name: newTag.name,
                color: newTag.color,
                company_id: selectedCompany
            }])
            .select();

        if (data) {
            setTags([...tags, data[0]]);
            setNewTag({ name: '', color: '#4f46e5' });
        }

        setIsLoading(false);
    };

    // Etiketi sil
    const deleteTag = async (id: string) => {
        if (!canDeleteTag) return;

        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', id);

        if (!error) {
            setTags(tags.filter(tag => tag.id !== id));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Etiket Yönetimi</h2>

            {/* Etiket Listesi */}
            <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Mevcut Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <div
                            key={tag.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                            <span>{tag.name}</span>
                            {canDeleteTag && (
                                <button
                                    onClick={() => deleteTag(tag.id)}
                                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}

                    {tags.length === 0 && (
                        <p className="text-sm text-gray-500">Henüz etiket oluşturulmadı.</p>
                    )}
                </div>
            </div>

            {/* Etiket Ekleme Formu */}
            {canCreateTag && (
                <form onSubmit={createTag} className="flex gap-2">
                    <input
                        type="text"
                        value={newTag.name}
                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        placeholder="Yeni etiket adı"
                        className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <input
                        type="color"
                        value={newTag.color}
                        onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newTag.name}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                    >
                        {isLoading ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                </form>
            )}
        </div>
    );
} 