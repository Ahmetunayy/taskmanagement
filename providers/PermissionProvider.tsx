"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserProvider';

interface PermissionContextType {
    userPermissions: string[];
    hasPermission: (permission: string) => boolean;
    isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, selectedCompany } = useUser();
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserPermissions = async () => {
            if (!user || !selectedCompany) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                // Kullanıcının bu şirketteki rollerini al
                const { data: userRoles } = await supabase
                    .from('user_roles')
                    .select('role_id')
                    .eq('user_id', user.id);

                if (!userRoles || userRoles.length === 0) {
                    setUserPermissions([]);
                    setIsLoading(false);
                    return;
                }

                const roleIds = userRoles.map(ur => ur.role_id);

                // Bu rollere ait tüm izinleri al
                const { data: rolePermissions } = await supabase
                    .from('role_permissions')
                    .select('permission_id')
                    .in('role_id', roleIds);

                if (!rolePermissions || rolePermissions.length === 0) {
                    setUserPermissions([]);
                    setIsLoading(false);
                    return;
                }

                const permissionIds = rolePermissions.map(rp => rp.permission_id);

                // İzinlerin isimlerini al
                const { data: permissions } = await supabase
                    .from('permissions')
                    .select('name')
                    .in('id', permissionIds);

                if (permissions) {
                    setUserPermissions(permissions.map(p => p.name));
                } else {
                    setUserPermissions([]);
                }
            } catch (error) {
                console.error('İzinler alınırken hata oluştu:', error);
                setUserPermissions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPermissions();
    }, [user, selectedCompany]);

    const hasPermission = (permission: string): boolean => {
        return userPermissions.includes(permission);
    };

    const value = {
        userPermissions,
        hasPermission,
        isLoading
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}; 