"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
    taskId: string;
    onUploadComplete: () => void;
}

export default function FileUpload({ taskId, onUploadComplete }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Lütfen bir dosya seçin');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Dosya boyutu 10MB\'dan küçük olmalıdır');
            return;
        }

        setUploading(true);

        // Dosya adında çakışma olmaması için timestamp ekle
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `task-files/${taskId}/${fileName}`;

        try {
            // Dosyayı Storage'a yükle
            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Dosya referansını veritabanına kaydet
            const { error: dbError } = await supabase
                .from('attachments')
                .insert({
                    task_id: taskId,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    storage_path: filePath,
                });

            if (dbError) throw dbError;

            setFile(null);
            onUploadComplete();
        } catch (err: unknown) {
            console.error('Upload error:', err);
            setError('Dosya yüklenirken bir hata oluştu');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                    disabled={uploading}
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {uploading ? 'Yükleniyor...' : 'Yükle'}
                </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {file && !error && (
                <div className="mt-2 text-sm text-gray-600">
                    Seçilen dosya: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
            )}
        </div>
    );
} 