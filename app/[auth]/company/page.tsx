"use client";
import React, { useState } from 'react';

import { useUser } from '@/providers/UserProvider';
import UserManagement from '@/components/company/UserManagement';
import RoleManagement from '@/components/company/RoleManagement';
import CompanySettings from '@/components/company/CompanySettings';
import TagManagement from '@/components/company/TagManagement';


export default function CompanyPage() {
    const [activeTab, setActiveTab] = useState('users');

    const { selectedCompany } = useUser();


    // Yetki kontrolü
    const canManageUsers = true; // Geliştirme için geçici olarak true yap
    const canManageRoles = true;
    const canManageCompany = true;
    const canManageTags = true;

    // Hiçbir yetki yoksa erişimi engelle
    /*
    if (!canManageUsers && !canManageRoles && !canManageCompany && !canManageTags) {
        router.push('/unauthorized');
        return null;
    }
    */

    // Şirket seçilmemişse uyarı göster
    if (!selectedCompany) {
        return (
            <div className="p-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p className="font-bold">Uyarı</p>
                    <p>Şirket yönetimini görüntülemek için bir şirket seçmelisiniz.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Şirket Yönetimi</h1>

            {/* Sekmeler */}
            <div className="border-b border-gray-200 mb-6">
                <ul className="flex flex-wrap -mb-px">
                    {canManageUsers && (
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'users'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                Kullanıcı Yönetimi
                            </button>
                        </li>
                    )}
                    {canManageRoles && (
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('roles')}
                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'roles'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                Rol Yönetimi
                            </button>
                        </li>
                    )}
                    {canManageCompany && (
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'settings'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                Şirket Ayarları
                            </button>
                        </li>
                    )}
                    {canManageTags && (
                        <li>
                            <button
                                onClick={() => setActiveTab('tags')}
                                className={`inline-block p-4 rounded-t-lg ${activeTab === 'tags'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                Etiket Yönetimi
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            {/* Aktif sekmeye göre içerik */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {activeTab === 'users' && canManageUsers && <UserManagement />}
                {activeTab === 'roles' && canManageRoles && <RoleManagement />}
                {activeTab === 'settings' && canManageCompany && <CompanySettings />}
                {activeTab === 'tags' && canManageTags && <TagManagement />}
            </div>
        </div>
    );
} 