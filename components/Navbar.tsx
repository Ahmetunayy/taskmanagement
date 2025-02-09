"use client";

import Image from "next/image";
import { useUser } from "@/providers/UserProvider";
import CompanySelectorWrapper from "./CompanySelectorWrapper";


export default function Navbar({ setActiveComponent }: { setActiveComponent: (component: string) => void }) {
    const { user, companies, selectedCompany } = useUser();


    return (
        <div className="h-12 min-h-12 max-h-12 border-b shadow-sm flex items-center justify-between px-1 z-10 bg-white">
            <div className="flex items-center w-16 min-w-16 max-w-16 justify-center">
                <Image src="/Logo.png" alt="logo" width={35} height={35} />
            </div>
            <div className="flex items-center justify-between w-full px-2">
                <div className="flex items-center w-full">
                    {/* ✅ User Info */}
                    {user ? (
                        <div className="flex items-center">
                            <p className="text-sm font-medium first-letter:capitalize">{user.firstname}</p>
                            <span>&nbsp;</span>
                            <p className="text-sm font-medium first-letter:capitalize">{user.lastname}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Not logged in</p>
                    )}

                    {/* ✅ Separator */}
                    <span className="mx-4 text-2xl font-extralight">/</span>

                    {/* ✅ Company Info */}
                    {selectedCompany && (
                        <p className="text-sm font-medium">
                            {companies.find(c => c.id === selectedCompany)?.name}
                        </p>
                    )}

                    {/* ✅ Company Selector */}
                    <CompanySelectorWrapper companies={companies} />
                </div>

                <button
                    className="border-black border text-black px-3 py-2 rounded-3xl text-nowrap flex gap-2 items-center hover:bg-gray-100 group"
                    onClick={() => setActiveComponent("addTask")}
                >
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 16 16"
                        fill="#ef4444"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-transform duration-300 origin-center group-hover:rotate-180"
                    >
                        <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                    </svg>
                    <p className="text-sm">Create</p>
                </button>


            </div>

        </div>
    );
}
