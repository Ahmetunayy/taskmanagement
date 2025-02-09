export function getCompany(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("selectedCompany");
    }
    return null;
}

export function setCompany(companyId: string) {
    if (typeof window !== "undefined") {
        localStorage.setItem("selectedCompany", companyId);
    }
}
