"use client";

import Image from "next/image";
import { useUser } from "@/providers/UserProvider";
import CompanySelectorWrapper from "./CompanySelectorWrapper";
import SvgAddButton from "./SvgAddButton";


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
                    <SvgAddButton color="#ef4444" />
                    <p className="text-sm">Create</p>
                </button>


            </div>

        </div>
    );
}
