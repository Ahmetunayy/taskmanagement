"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // ✅ Use the Client Supabase instance
import { getCompany, setCompany } from "@/app/api/company/companyStorage"; // ✅ LocalStorage support

interface User {
    firstname: string;
    lastname: string;
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
}





const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(getCompany()); // ✅ Get from localStorage


    useEffect(() => {
        const fetchUserData = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData.user) {
                console.error("User authentication failed:", authError);
                return;
            }

            const authId = authData.user.id;

            // Fetch user info
            const { data: userData } = await supabase
                .from("users")
                .select("firstname, lastname")
                .eq("auth_id", authId)
                .single();
            if (userData) setUser(userData);

            // Fetch companies
            const { data: companyData } = await supabase
                .from("companies")
                .select("id, name")
                .eq("owner", authId);
            if (companyData) {
                setCompanies(companyData || []);

                // ✅ If no company selected, use the first one
                if (!selectedCompany) {
                    const defaultCompany = companyData?.[0]?.id || null;
                    setSelectedCompany(defaultCompany);
                    setCompany(defaultCompany); // ✅ Save to localStorage
                }
            }

            // Fetch steps

        };

        fetchUserData();

    }, []); // ✅ Remove `selectedCompany` from dependencies to prevent infinite loops

    return (
        <UserContext.Provider value={{ user, companies, selectedCompany, setSelectedCompany }}>
            {children}
        </UserContext.Provider>
    );

}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
}
