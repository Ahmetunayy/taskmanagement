"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { Role } from '@/lib/types';

interface UserInviteFormProps {
    onComplete: () => void;
    roles: Role[];
}

export default function UserInviteForm({ onComplete, roles }: UserInviteFormProps) {
    const { selectedCompany, user } = useUser();
    const [email, setEmail] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [companyRole, setCompanyRole] = useState('user');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !selectedCompany || !user) return;

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Davetiye oluştur ve e-posta gönder
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email,
                    companyId: selectedCompany,
                    invitedBy: user.id,
                    companyRole, // admin, user, editor vs.
                    selectedRoles // rol ID'leri
                }
            });

            if (error) throw error;

            setSuccessMessage(`${email} adresine davet gönderildi!`);
            setEmail('');
            setSelectedRoles([]);

            // 3 saniye sonra başarı mesajını kaldır ve formu kapat
            setTimeout(() => {
                setSuccessMessage('');
                onComplete();
            }, 3000);

        } catch (error: any) {
            console.error('Davet gönderilirken hata oluştu:', error);
            setErrorMessage(error.message || 'Davet gönderilirken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-posta Adresi
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ornek@sirket.com"
                    required
                />
            </div>

            <div>
                <label htmlFor="companyRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Şirket Rolü
                </label>
                <select
                    id="companyRole"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Yönetici</option>
                    <option value="editor">Editör</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">Bu, kullanıcının şirketteki temel rolüdür.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sistem Rolleri
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {roles.map(role => (
                        <div key={role.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onChange={() => handleRoleToggle(role.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                {role.name} <span className="text-xs text-gray-500">{role.description}</span>
                            </label>
                        </div>
                    ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">Kullanıcıya atanacak izin rolleri.</p>
            </div>

            {errorMessage && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onComplete}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? 'Gönderiliyor...' : 'Davet Gönder'}
                </button>
            </div>
        </form>
    );
} 