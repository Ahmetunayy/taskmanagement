'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/UserProvider';

export default function CreateCompanyPage() {
    const router = useRouter();
    const { user } = useUser();
    const [companyName, setCompanyName] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLoaded, setUserLoaded] = useState(false);

    // User yüklenme durumunu takip edelim - userLoaded değişkenini düzeltin
    useEffect(() => {
        if (user) {
            console.log("Kullanıcı bilgileri yüklendi:", user.id);
            setUserLoaded(true);
        } else {
            setUserLoaded(false);
        }
    }, [user]);

    console.log(userLoaded)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyName) {
            setError("Şirket adı gerekli");
            return;
        }

        if (!user) {
            console.error("Kullanıcı bilgileri yüklenemiyor");
            setError("Oturum bilgileri alınamadı. Lütfen tekrar giriş yapın.");
            return;
        }

        console.log("Form gönderiliyor, kullanıcı:", user.id);

        setIsLoading(true);
        setError(null);

        try {
            // 1. Şirketi oluştur
            console.log("1. Şirket oluşturuluyor:", companyName);
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .insert([{
                    name: companyName,
                    description: companyDescription,
                    owner: user.id  // Şirketin sahibini belirtelim
                }])
                .select()
                .single();

            if (companyError) {
                console.error("Şirket oluşturma hatası:", companyError);
                throw companyError;
            }

            console.log("Şirket oluşturuldu:", companyData);
            const newCompanyId = companyData.id;

            // 2. Kullanıcıyı admin olarak ekle
            console.log("2. Kullanıcı admin olarak ekleniyor:", user.id, newCompanyId);

            // Önce kullanıcının bu şirkette zaten var olup olmadığını kontrol et
            const { data: existingEmployees, error: checkError } = await supabase
                .from('company_employees')
                .select('id')
                .eq('user_id', user.id)
                .eq('company_id', newCompanyId);

            if (checkError) {
                console.error("Çalışan kontrolü hatası:", checkError);
                throw checkError;
            }

            if (!existingEmployees || existingEmployees.length === 0) {
                // Kullanıcı zaten ekli değilse, ekle
                const { data: employeeData, error: employeeError } = await supabase
                    .from('company_employees')
                    .insert([{
                        user_id: user.id,
                        company_id: newCompanyId,
                        role: 'admin',
                        status: 'active'
                    }])
                    .select();

                if (employeeError) {
                    console.error("Çalışan ekleme hatası:", employeeError);
                    throw employeeError;
                }

                console.log("Çalışan eklendi:", employeeData);
            } else {
                console.log("Kullanıcı zaten bu şirkette kayıtlı:", existingEmployees[0].id);
            }

            // 3. Temel rolleri oluştur
            const { data: adminRoleData, error: adminRoleError } = await supabase
                .from('roles')
                .insert([
                    {
                        name: 'admin',
                        description: 'Tam yetkili yönetici',
                        company_id: newCompanyId
                    }
                ])
                .select()
                .single();

            if (adminRoleError) throw adminRoleError;

            // 4. User rolü oluştur
            const { error: userRoleError } = await supabase
                .from('roles')
                .insert([
                    {
                        name: 'user',
                        description: 'Standart kullanıcı',
                        company_id: newCompanyId
                    }
                ]);

            if (userRoleError) throw userRoleError;

            // 5. İzinleri getir ve admin rolüne ekle
            const { data: permissions, error: permissionsError } = await supabase
                .from('permissions')
                .select('id');

            if (permissionsError) throw permissionsError;

            // 6. Admin rolüne tüm izinleri ekle
            if (permissions && permissions.length > 0) {
                const rolePermissions = permissions.map(permission => ({
                    role_id: adminRoleData.id,
                    permission_id: permission.id
                }));

                const { error: rolePermissionsError } = await supabase
                    .from('role_permissions')
                    .insert(rolePermissions);

                if (rolePermissionsError) throw rolePermissionsError;
            }

            // Başarılı! Kullanıcıyı dashboard'a yönlendir
            router.push('/dashboard');

        } catch (err) {
            if (err instanceof Error) {
                console.error('Şirket oluşturma hatası:', err.message);
                setError(err.message || 'Şirket oluşturulurken bir hata oluştu');
            } else {
                console.error('Şirket oluşturma hatası (bilinmeyen):', err);
                setError('Şirket oluşturulurken bir hata oluştu');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // User yüklenmedi veya hata varsa uyarı gösterelim
    if (!user) {
        return (
            <div className="max-w-md mx-auto my-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Yeni Şirket Oluştur</h1>
                <div className="text-center py-6">
                    <div className="animate-pulse">Kullanıcı bilgileri yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto my-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Yeni Şirket Oluştur</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Şirket Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Şirket Açıklaması
                    </label>
                    <textarea
                        id="companyDescription"
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        rows={3}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !companyName}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Oluşturuluyor...' : 'Şirket Oluştur'}
                </button>
            </form>
        </div>
    );
}