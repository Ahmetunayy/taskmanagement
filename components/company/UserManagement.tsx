/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { User, Role } from '@/lib/types';
import UserInviteForm from './UserInviteForm';

export default function UserManagement() {
    const { selectedCompany } = useUser();
    const [users, setUsers] = useState<User[]>([]);
    const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!selectedCompany) return;

            setIsLoading(true);

            // Şirketteki çalışanları getir
            const { data: employees } = await supabase
                .from('company_employees')
                .select('*')
                .eq('company_id', selectedCompany);

            if (employees) {
                setCompanyEmployees(employees);

                // Çalışanların kullanıcı bilgilerini getir
                const userIds = employees.map(emp => emp.user_id);

                if (userIds.length > 0) {
                    const { data: usersData } = await supabase
                        .from('users')
                        .select('*')
                        .in('id', userIds);

                    if (usersData) setUsers(usersData);
                }
            }

            // Rolleri getir
            const { data: rolesData } = await supabase
                .from('roles')
                .select('*')
                .eq('company_id', selectedCompany);

            if (rolesData) setRoles(rolesData);

            setIsLoading(false);
        }

        fetchData();
    }, [selectedCompany]);

    const getUserRole = (userId: string) => {
        const employee = companyEmployees.find(emp => emp.user_id === userId);
        return employee?.role || 'user';
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!selectedCompany) return;

        try {
            const { error } = await supabase
                .from('company_employees')
                .update({ role: newRole })
                .eq('user_id', userId)
                .eq('company_id', selectedCompany);

            if (error) throw error;

            // UI'da güncelle
            setCompanyEmployees(prev =>
                prev.map(emp =>
                    emp.user_id === userId ? { ...emp, role: newRole } : emp
                )
            );
        } catch (error) {
            console.error('Rol değiştirme işlemi sırasında hata:', error);
            alert('Rol değiştirilemedi');
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!selectedCompany || !confirm('Bu kullanıcıyı şirketten çıkarmak istediğinize emin misiniz?')) return;

        // company_employees tablosundan kaydı sil
        const { error } = await supabase
            .from('company_employees')
            .delete()
            .eq('company_id', selectedCompany)
            .eq('user_id', userId);

        if (!error) {
            // Yerel state'leri güncelle
            setCompanyEmployees(prev => prev.filter(emp => emp.user_id !== userId));
            setUsers(prev => prev.filter(user => user.id !== userId));
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Yükleniyor...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
                <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {showInviteForm ? 'İptal' : 'Kullanıcı Davet Et'}
                </button>
            </div>

            {showInviteForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <UserInviteForm
                        onComplete={() => setShowInviteForm(false)}
                        roles={roles}
                    />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">E-posta</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-medium text-gray-700 dark:text-gray-300">
                                            {user.firstname?.[0]}{user.lastname?.[0]}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{user.firstname} {user.lastname}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-300">{user.email}</div>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <select
                                        value={getUserRole(user.id)}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="user">Kullanıcı</option>
                                        <option value="admin">Yönetici</option>
                                        <option value="editor">Editör</option>
                                    </select>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {/* Kullanıcı rollerini yönet */ }}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Rolleri Yönet
                                        </button>
                                        <button
                                            onClick={() => handleRemoveUser(user.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Çıkar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Şirkette henüz kullanıcı bulunmuyor.</p>
                        <p className="mt-2">Yeni kullanıcılar davet etmek için Kullanıcı Davet Et butonunu kullanın.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 