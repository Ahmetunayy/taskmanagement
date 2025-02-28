"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { Tag } from '@/lib/types';

export default function TagManagement() {
    const { selectedCompany } = useUser();
    const [tags, setTags] = useState<Tag[]>([]);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [newTag, setNewTag] = useState({ name: '', color: '#4f46e5' });
    const [isLoading, setIsLoading] = useState(false);

    // Etiketleri yükle
    useEffect(() => {
        async function fetchTags() {
            if (!selectedCompany) return;

            setIsLoading(true);

            const { data } = await supabase
                .from('tags')
                .select('*')
                .eq('company_id', selectedCompany);

            if (data) setTags(data);

            setIsLoading(false);
        }

        fetchTags();
    }, [selectedCompany]);

    // Yeni etiket oluştur veya güncelle
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.name || !selectedCompany) return;

        setIsLoading(true);

        try {
            if (editingTag) {
                // Etiketi güncelle
                const { data } = await supabase
                    .from('tags')
                    .update({
                        name: newTag.name,
                        color: newTag.color
                    })
                    .eq('id', editingTag.id)
                    .select();

                if (data) {
                    setTags(tags.map(tag => tag.id === editingTag.id ? data[0] : tag));
                }
            } else {
                // Yeni etiket oluştur
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
                }
            }

            // Formu sıfırla
            setNewTag({ name: '', color: '#4f46e5' });
            setEditingTag(null);
        } catch (error) {
            console.error('Etiket kaydedilirken hata oluştu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Etiketi düzenlemeye başla
    const handleEdit = (tag: Tag) => {
        setEditingTag(tag);
        setNewTag({
            name: tag.name,
            color: tag.color
        });
    };

    // Etiketi sil
    const handleDelete = async (tagId: string) => {
        if (!confirm('Bu etiketi silmek istediğinize emin misiniz?')) return;

        setIsLoading(true);

        try {
            await supabase
                .from('tags')
                .delete()
                .eq('id', tagId);

            setTags(tags.filter(tag => tag.id !== tagId));

            if (editingTag?.id === tagId) {
                setEditingTag(null);
                setNewTag({ name: '', color: '#4f46e5' });
            }
        } catch (error) {
            console.error('Etiket silinirken hata oluştu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Etiket Yönetimi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Etiket Listesi */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-3">Mevcut Etiketler</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tags.map(tag => (
                            <div
                                key={tag.id}
                                className="p-3 border rounded-md shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: tag.color }}
                                        ></div>
                                        <span className="font-medium">{tag.name}</span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(tag)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tag.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500">
                                    Renk kodu: {tag.color}
                                </div>
                            </div>
                        ))}

                        {tags.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                <p>Henüz tanımlanmış etiket bulunmuyor.</p>
                                <p className="mt-2">Yeni etiket oluşturmak için formu kullanın.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Etiket Ekleme/Düzenleme Formu */}
                <div className="border rounded-md p-4 h-fit">
                    <h3 className="text-lg font-medium mb-3">
                        {editingTag ? 'Etiketi Düzenle' : 'Yeni Etiket Ekle'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Etiket Adı
                            </label>
                            <input
                                type="text"
                                id="tagName"
                                value={newTag.name}
                                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Örn: Acil, Beklemede, Müşteri"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tagColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Renk
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    id="tagColor"
                                    value={newTag.color}
                                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                    className="h-10 w-14 border rounded"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={newTag.color}
                                        onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                        placeholder="#4f46e5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !newTag.name}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex-1"
                            >
                                {isLoading
                                    ? 'Kaydediliyor...'
                                    : editingTag ? 'Güncelle' : 'Ekle'
                                }
                            </button>

                            {editingTag && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingTag(null);
                                        setNewTag({ name: '', color: '#4f46e5' });
                                    }}
                                    className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50 flex-1"
                                >
                                    İptal
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 