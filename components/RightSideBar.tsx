import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface RightSideBarProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function RightSideBar({ isOpen, onClose, title, children }: RightSideBarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 0.5 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-40"
                onClick={onClose}
            />

            {/* Sidebar panel */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 120,
                    duration: 0.3
                }}
                className="fixed z-50 h-full border-l inset-y-0 right-0 w-full md:w-[450px] lg:w-[500px]
                          bg-white p-0 shadow-xl flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            </motion.div>
        </>
    );
}
