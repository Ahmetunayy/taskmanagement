"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { usePermissions } from '@/providers/PermissionProvider';
import { Role, User as UserType } from '@/lib/types';

export default function UserRoleManager() {
    const { selectedCompany } = useUser();
    const { hasPermission } = usePermissions();
    const [users, setUsers] = useState<UserType[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // İzin kontrolü
    const canManageRoles = hasPermission('manage_roles');

    // Kullanıcıları ve rolleri yükle
    useEffect(() => {
        async function fetchData() {
            if (!selectedCompany || !canManageRoles) return;

            // Şirketteki kullanıcıları al
            const { data: companyUsers } = await supabase
                .from('user_companies')
                .select('user_id')
                .eq('company', selectedCompany);

            if (companyUsers && companyUsers.length > 0) {
                const userIds = companyUsers.map(cu => cu.user_id);

                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .in('id', userIds);

                if (userData) setUsers(userData);
            }

            // Şirketteki rolleri al
            const { data: rolesData } = await supabase
                .from('roles')
                .select('*')
                .eq('company_id', selectedCompany);

            if (rolesData) setRoles(rolesData);
        }

        fetchData();
    }, [selectedCompany, canManageRoles]);

    // Seçilen kullanıcının rollerini yükle
    useEffect(() => {
        async function fetchUserRoles() {
            if (!selectedUser) return;

            const { data } = await supabase
                .from('user_roles')
                .select('role_id')
                .eq('user_id', selectedUser.id);

            if (data) {
                setUserRoles(data.map(item => item.role_id));
            } else {
                setUserRoles([]);
            }
        }

        fetchUserRoles();
    }, [selectedUser]);

    // Rol değişimini kaydet
    const handleRoleToggle = async (roleId: string) => {
        if (!selectedUser || !canManageRoles) return;

        setIsLoading(true);

        const isSelected = userRoles.includes(roleId);

        if (isSelected) {
            // Rolü kaldır
            await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', selectedUser.id)
                .eq('role_id', roleId);

            setUserRoles(prev => prev.filter(id => id !== roleId));
        } else {
            // Rol ekle
            await supabase
                .from('user_roles')
                .insert([{
                    user_id: selectedUser.id,
                    role_id: roleId
                }]);

            setUserRoles(prev => [...prev, roleId]);
        }

        setIsLoading(false);
    };

    if (!canManageRoles) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <p className="text-center text-gray-500">Kullanıcı rollerini yönetmek için yetkiniz bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Kullanıcı Rol Yönetimi</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol panel: Kullanıcı listesi */}
                <div>
                    <h3 className="text-md font-medium mb-2">Kullanıcılar</h3>
                    <div className="space-y-2">
                        {users.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-2 border rounded cursor-pointer ${selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <p className="font-medium">{user.firstname} {user.lastname}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ panel: Rol atama */}
                <div>
                    <h3 className="text-md font-medium mb-2">
                        {selectedUser ? `Roller: ${selectedUser.firstname} ${selectedUser.lastname}` : 'Kullanıcı seçin'}
                    </h3>

                    {selectedUser ? (
                        <div className="space-y-2">
                            {roles.map(role => (
                                <div
                                    key={role.id}
                                    className="flex items-center p-2 border rounded"
                                >
                                    <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={userRoles.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                        disabled={isLoading}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`role-${role.id}`} className="flex-1">
                                        <p className="font-medium">{role.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mt-10">Lütfen rollerini yönetmek için bir kullanıcı seçin</p>
                    )}
                </div>
            </div>
        </div>
    );
} 