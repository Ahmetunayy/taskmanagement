/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ✅ Use the Client Supabase instance
import { getCompany } from "@/app/api/company/companyStorage"; // ✅ LocalStorage support
import { PermissionProvider } from "@/providers/PermissionProvider";

interface User {
    firstname: string;
    lastname: string;
    id: string;
    email: string;
}

interface Company {
    id: string;
    name: string;
}


interface UserContextType {
    user: User | null;
    companies: Company[];
    selectedCompany: string | null;
    setSelectedCompany: (companyId: string) => void;
    setCompanies: (companies: Company[]) => void;
}


const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(getCompany()); // ✅ Get from localStorage
    const [session, setSession] = useState<any>(null);


    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user) {
                setUser(null);
                return;
            }

            try {
                // Auth bilgilerini kullanarak public.users tablosundan veri çekme
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error("Kullanıcı verisi alınırken hata oluştu:", error);

                    // Kullanıcı kaydı yoksa oluşturalım
                    if (error.code === 'PGRST116') {
                        console.log("Kullanıcı kaydı bulunamadı, yeni kayıt oluşturuluyor");

                        // Yeni kullanıcı kaydı oluştur
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert({
                                id: session.user.id,
                                email: session.user.email,
                                firstname: '',
                                lastname: ''
                            });

                        if (insertError) {
                            console.error("Kullanıcı kaydı oluşturulamadı:", insertError);
                            setUser(session.user); // En azından auth verisini kullan
                        } else {
                            // Yeni kullanıcı verilerini getir
                            const { data: newData } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();

                            setUser(newData || session.user);
                        }
                    } else {
                        setUser(session.user); // Hata durumunda auth verisini kullan
                    }
                } else {
                    setUser(data); // Kullanıcı verisi varsa kullan
                }
            } catch (err) {
                console.error("Kullanıcı verisi işlenirken hata:", err);
                setUser(session.user); // Hata durumunda auth verisini kullan
            }
        };

        fetchUserData();

    }, [session]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{
            user,
            companies,
            selectedCompany,
            setSelectedCompany,
            setCompanies
        }}>
            <PermissionProvider>
                {children}
            </PermissionProvider>
        </UserContext.Provider>
    );

}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
}
