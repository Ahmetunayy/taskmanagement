"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';

export default function CompanySettings() {
    const { selectedCompany } = useUser();
    const [company, setCompany] = useState<any>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Şirket bilgilerini yükle
    useEffect(() => {
        async function fetchCompanyData() {
            if (!selectedCompany) return;

            setIsLoading(true);

            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', selectedCompany)
                    .single();

                if (error) throw error;

                if (data) {
                    setCompany(data);

                    // Logo varsa önizleme oluştur
                    if (data.logo_url) {
                        setLogoPreview(data.logo_url);
                    }
                }
            } catch (error) {
                console.error('Şirket bilgileri alınırken hata:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCompanyData();
    }, [selectedCompany]);

    // Şirket bilgilerini güncelle
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompany({ ...company, [name]: value });
    };

    // Logo seçimi
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);

            // Önizleme URL'si oluştur
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Logoyu kaldır
    const handleRemoveLogo = () => {
        setLogo(null);
        setLogoPreview(null);
        setCompany({ ...company, logo_url: null });
    };

    // Formu gönder
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!company || !selectedCompany) return;

        setIsSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            // Eğer yeni logo yüklendiyse
            let logoUrl = company.logo_url;

            if (logo) {
                const fileName = `company_logo_${selectedCompany}_${Date.now()}`;
                const fileExt = logo.name.split('.').pop();
                const filePath = `company_logos/${fileName}.${fileExt}`;

                // Logoyu storage'a yükle
                const { error: uploadError } = await supabase.storage
                    .from('public')
                    .upload(filePath, logo);

                if (uploadError) throw uploadError;

                // Public URL al
                const { data: publicUrlData } = supabase.storage
                    .from('public')
                    .getPublicUrl(filePath);

                logoUrl = publicUrlData.publicUrl;
            }

            // Şirket bilgilerini güncelle
            const { error: updateError } = await supabase
                .from('companies')
                .update({
                    name: company.name,
                    description: company.description,
                    address: company.address,
                    phone: company.phone,
                    website: company.website,
                    tax_id: company.tax_id,
                    logo_url: logoUrl
                })
                .eq('id', selectedCompany);

            if (updateError) throw updateError;

            setSuccessMessage('Şirket bilgileri başarıyla güncellendi.');

            // 3 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (error: any) {
            console.error('Şirket bilgileri güncellenirken hata:', error);
            setErrorMessage(error.message || 'Şirket bilgileri güncellenirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Yükleniyor...</div>;
    }

    if (!company) {
        return <div className="text-center py-4 text-red-600">Şirket bilgileri bulunamadı.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Şirket Ayarları</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Şirket Logosu */}
                <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-3">Şirket Logosu</h3>

                    <div className="flex items-start space-x-4">
                        <div className="w-32 h-32 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Şirket Logosu"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="text-gray-400">Logo Yok</span>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Logo Yükle
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-medium
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>

                            {logoPreview && (
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                                >
                                    Logoyu Kaldır
                                </button>
                            )}

                            <p className="mt-2 text-xs text-gray-500">
                                Önerilen logo boyutu: 200x200 piksel, maksimum 2MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Temel Bilgiler */}
                <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-3">Temel Bilgiler</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Şirket Adı
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={company.name || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Vergi Numarası
                            </label>
                            <input
                                type="text"
                                id="tax_id"
                                name="tax_id"
                                value={company.tax_id || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Şirket Açıklaması
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={company.description || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-3">İletişim Bilgileri</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={company.phone || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Web Sitesi
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={company.website || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="https://www.example.com"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Adres
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={company.address || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* Sonuç Mesajları */}
                {successMessage && (
                    <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                        {errorMessage}
                    </div>
                )}

                {/* Gönder Butonu */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
} 