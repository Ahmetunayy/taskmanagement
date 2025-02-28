"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { usePermissions } from '@/providers/PermissionProvider';
import { Role, Permission } from '@/lib/types';

export default function RoleManager() {
    const { selectedCompany } = useUser();
    const { hasPermission } = usePermissions();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);

    // İzin kontrolü
    const canManageRoles = hasPermission('manage_roles');

    // Rolleri yükle
    useEffect(() => {
        async function fetchRoles() {
            if (!selectedCompany) return;

            const { data } = await supabase
                .from('roles')
                .select('*')
                .eq('company_id', selectedCompany);

            if (data) setRoles(data);
        }

        fetchRoles();
    }, [selectedCompany]);

    // Tüm izinleri yükle
    useEffect(() => {
        async function fetchPermissions() {
            const { data } = await supabase
                .from('permissions')
                .select('*');

            if (data) setPermissions(data);
        }

        fetchPermissions();
    }, []);

    // Seçilen rolün izinlerini yükle
    useEffect(() => {
        async function fetchRolePermissions() {
            if (!selectedRole) return;

            const { data } = await supabase
                .from('role_permissions')
                .select('permission_id')
                .eq('role_id', selectedRole.id);

            if (data) {
                setSelectedRolePermissions(data.map(item => item.permission_id));
            }
        }

        fetchRolePermissions();
    }, [selectedRole]);

    // Yeni rol oluştur
    const createRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRole.name || !selectedCompany || !canManageRoles) return;

        setIsLoading(true);

        const { data, error } = await supabase
            .from('roles')
            .insert([{
                name: newRole.name,
                description: newRole.description,
                company_id: selectedCompany
            }])
            .select();

        if (data) {
            setRoles([...roles, data[0]]);
            setNewRole({ name: '', description: '' });
        }

        setIsLoading(false);
    };

    // İzin değişikliğini kaydet
    const handlePermissionToggle = async (permissionId: string) => {
        if (!selectedRole || !canManageRoles) return;

        const isSelected = selectedRolePermissions.includes(permissionId);

        if (isSelected) {
            // İzni kaldır
            await supabase
                .from('role_permissions')
                .delete()
                .eq('role_id', selectedRole.id)
                .eq('permission_id', permissionId);

            setSelectedRolePermissions(prev => prev.filter(id => id !== permissionId));
        } else {
            // İzin ekle
            await supabase
                .from('role_permissions')
                .insert([{
                    role_id: selectedRole.id,
                    permission_id: permissionId
                }]);

            setSelectedRolePermissions(prev => [...prev, permissionId]);
        }
    };

    if (!canManageRoles) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <p className="text-center text-gray-500">Rol yönetimi için yetkiniz bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Rol Yönetimi</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol panel: Rol listesi ve ekleme */}
                <div>
                    <h3 className="text-md font-medium mb-2">Roller</h3>
                    <div className="space-y-2 mb-4">
                        {roles.map(role => (
                            <div
                                key={role.id}
                                onClick={() => setSelectedRole(role)}
                                className={`p-2 border rounded cursor-pointer ${selectedRole?.id === role.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <p className="font-medium">{role.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={createRole} className="space-y-3">
                        <h3 className="text-md font-medium">Yeni Rol Ekle</h3>
                        <input
                            type="text"
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            placeholder="Rol adı"
                            className="w-full px-3 py-2 border rounded-md"
                        />
                        <textarea
                            value={newRole.description}
                            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                            placeholder="Rol açıklaması"
                            className="w-full px-3 py-2 border rounded-md"
                            rows={3}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !newRole.name}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                        >
                            {isLoading ? 'Ekleniyor...' : 'Rol Ekle'}
                        </button>
                    </form>
                </div>

                {/* Sağ panel: İzin yönetimi */}
                <div>
                    <h3 className="text-md font-medium mb-2">
                        {selectedRole ? `İzinler: ${selectedRole.name}` : 'Rol seçin'}
                    </h3>

                    {selectedRole ? (
                        <div className="space-y-2">
                            {permissions.map(permission => (
                                <div
                                    key={permission.id}
                                    className="flex items-center p-2 border rounded"
                                >
                                    <input
                                        type="checkbox"
                                        id={`perm-${permission.id}`}
                                        checked={selectedRolePermissions.includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`perm-${permission.id}`} className="flex-1">
                                        <p className="font-medium">{permission.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{permission.description}</p>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mt-10">Lütfen izinlerini yönetmek için bir rol seçin</p>
                    )}
                </div>
            </div>
        </div>
    );
} 