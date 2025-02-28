"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import { Role, Permission } from '@/lib/types';

export default function RoleManagement() {
    const { selectedCompany } = useUser();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!selectedCompany) return;

            setIsLoading(true);

            // Rolleri getir
            const { data: rolesData } = await supabase
                .from('roles')
                .select('*')
                .eq('company_id', selectedCompany);

            if (rolesData) setRoles(rolesData);

            // İzinleri getir
            const { data: permissionsData } = await supabase
                .from('permissions')
                .select('*');

            if (permissionsData) setPermissions(permissionsData);

            setIsLoading(false);
        }

        fetchData();
    }, [selectedCompany]);

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

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRole.name || !selectedCompany) return;

        setIsLoading(true);

        if (isEditing && selectedRole) {
            // Rol güncelleme
            const { data } = await supabase
                .from('roles')
                .update({
                    name: newRole.name,
                    description: newRole.description
                })
                .eq('id', selectedRole.id)
                .select();

            if (data) {
                setRoles(roles.map(role => role.id === selectedRole.id ? data[0] : role));
                setSelectedRole(data[0]);
            }
        } else {
            // Yeni rol oluşturma
            const { data } = await supabase
                .from('roles')
                .insert([{
                    name: newRole.name,
                    description: newRole.description,
                    company_id: selectedCompany
                }])
                .select();

            if (data) {
                setRoles([...roles, data[0]]);
                setSelectedRole(data[0]);
            }
        }

        setNewRole({ name: '', description: '' });
        setIsEditing(false);
        setIsLoading(false);
    };

    const handleEditRole = (role: Role) => {
        setNewRole({ name: role.name, description: role.description });
        setSelectedRole(role);
        setIsEditing(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm('Bu rolü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', roleId);

        if (!error) {
            setRoles(roles.filter(role => role.id !== roleId));
            if (selectedRole?.id === roleId) {
                setSelectedRole(null);
                setNewRole({ name: '', description: '' });
                setIsEditing(false);
            }
        }
    };

    const handlePermissionToggle = async (permissionId: string) => {
        if (!selectedRole) return;

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

    if (isLoading && roles.length === 0) {
        return <div className="text-center py-4">Yükleniyor...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">Rol Yönetimi</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sol panel: Rol listesi */}
                <div className="md:col-span-1">
                    <h3 className="font-medium text-lg mb-3">Roller</h3>
                    <div className="space-y-2 mb-4">
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedRole?.id === role.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''
                                    }`}
                                onClick={() => setSelectedRole(role)}
                            >
                                <div className="flex justify-between">
                                    <h4 className="font-medium">{role.name}</h4>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditRole(role);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRole(role.id);
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleCreateRole} className="space-y-3 border-t pt-4">
                        <h3 className="font-medium text-lg">{isEditing ? 'Rolü Düzenle' : 'Yeni Rol Ekle'}</h3>
                        <div>
                            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Rol Adı
                            </label>
                            <input
                                type="text"
                                id="roleName"
                                value={newRole.name}
                                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Açıklama
                            </label>
                            <textarea
                                id="roleDescription"
                                value={newRole.description}
                                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                rows={3}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={!newRole.name}
                            >
                                {isEditing ? 'Güncelle' : 'Ekle'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewRole({ name: '', description: '' });
                                        setIsEditing(false);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    İptal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Sağ panel: İzin yönetimi */}
                <div className="md:col-span-2">
                    <h3 className="font-medium text-lg mb-3">
                        {selectedRole ? `İzinler: ${selectedRole.name}` : 'İzinleri yönetmek için bir rol seçin'}
                    </h3>

                    {selectedRole ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {permissions.map(permission => (
                                <div
                                    key={permission.id}
                                    className="p-3 border rounded-md"
                                >
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id={`perm-${permission.id}`}
                                            checked={selectedRolePermissions.includes(permission.id)}
                                            onChange={() => handlePermissionToggle(permission.id)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`perm-${permission.id}`} className="ml-2 block">
                                            <span className="text-sm font-medium">{permission.name}</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{permission.description}</p>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border rounded-md p-8 text-center text-gray-500">
                            <p>Lütfen izinlerini yönetmek için soldaki listeden bir rol seçin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 