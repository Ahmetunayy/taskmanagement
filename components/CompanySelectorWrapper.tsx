"use client";

import { useUser } from "@/providers/UserProvider";
import CompanySelector from "./companySelector";

interface Company {
    id: string;
    name: string;
}

interface CompanySelectorWrapperProps {
    companies: Company[];
}

export default function CompanySelectorWrapper({ companies }: CompanySelectorWrapperProps) {
    const { setSelectedCompany } = useUser();

    const handleCompanyChange = (newCompanyId: string) => {
        setSelectedCompany(newCompanyId);
        localStorage.setItem("selectedCompany", newCompanyId);
        window.location.reload(); // Reload to fetch new tasks
    };

    return <CompanySelector companies={companies} onCompanyChange={handleCompanyChange} />;
}
