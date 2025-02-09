'use client'
import React, { useState } from 'react'
import { createCompany } from '@/app/api/company/createCompany'
import { useRouter } from 'next/navigation';

export default function CreateCompanyPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const router = useRouter();

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await createCompany(name);

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        alert("Company created successfully!");
        router.push("/");
    };
    return (
        <div>

            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleCreateCompany} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Company NAme"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
        </div>
    )
}