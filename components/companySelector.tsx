"use client";

import { useEffect, useCallback } from "react";
import { setCompany } from "@/app/api/company/companyStorage";
import { useUser } from "@/providers/UserProvider";
import { supabase } from "@/lib/supabase";

export default function CompanySelector() {
    const { companies, selectedCompany, setSelectedCompany, setCompanies, user } = useUser();

    // fetchUserCompanies fonksiyonunu useCallback ile sarmalıyoruz 
    // ve bağımlılık olarak sadece user?.id kullanıyoruz
    const fetchUserCompanies = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data: companiesData, error } = await supabase
                .from('company_employees')
                .select(`
                    company:company_id(
                        id,
                        name,
                        description
                    )
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error("Şirket verisi alınamadı:", error);
                return;
            }

            // .flat() kullanarak iç içe dizilerden kurtuluyoruz
            const formattedCompanies = companiesData
                .map((item) => item.company)
                .filter(Boolean)
                .flat();

            setCompanies(formattedCompanies);
        } catch (err) {
            console.error("Şirket verisi işlenirken hata:", err);
        }
    }, [user?.id, setCompanies]); // fetchUserCompanies bağımlılıklar doğru ayarlandı

    useEffect(() => {
        fetchUserCompanies();
    }, [fetchUserCompanies]);

    useEffect(() => {
        if (!selectedCompany && companies.length > 0) {
            const defaultCompany = companies[0].id;
            setSelectedCompany(defaultCompany);
            setCompany(defaultCompany);
        }
    }, [companies, selectedCompany, setSelectedCompany]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompanyId = event.target.value;
        setSelectedCompany(newCompanyId); // ✅ Update context first
        setCompany(newCompanyId); // ✅ Then store in localStorage
    };

    return (
        <select
            value={selectedCompany || (companies.length > 0 ? companies[0].id : "")}
            onChange={handleChange}
            className="p-2 border rounded"
        >
            {companies.map((company) => (
                <option key={company.id} value={company.id}>
                    {company.name}
                </option>
            ))}
        </select>
    );
}
