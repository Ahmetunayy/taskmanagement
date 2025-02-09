"use client";

import { useEffect } from "react";
import { setCompany } from "@/app/api/company/companyStorage";
import { useUser } from "@/providers/UserProvider";



export default function CompanySelector() {
    const { companies, selectedCompany, setSelectedCompany } = useUser();

    useEffect(() => {
        if (!selectedCompany && companies.length > 0) {
            const defaultCompany = companies[0].id;
            setSelectedCompany(defaultCompany);
            setCompany(defaultCompany);
        }
    }, [companies, selectedCompany, setSelectedCompany]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompanyId = event.target.value;
        setCompany(newCompanyId); // ✅ Store in localStorage
        setSelectedCompany(newCompanyId); // ✅ Update context
    };

    return (
        <select value={selectedCompany || ""} onChange={handleChange} className="p-2 border rounded">
            {companies.map((company) => (
                <option key={company.id} value={company.id}>
                    {company.name}
                </option>
            ))}
        </select>
    );
}
