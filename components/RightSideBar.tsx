import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function RightSideBar({ isOpen, onClose, children }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
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
            {/* Overlay that closes sidebar when clicked */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <motion.div
                ref={sidebarRef}
                initial={{ x: "100%" }}
                animate={{ x: isOpen ? "0%" : "100%" }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 120, damping: 20, duration: 0.1 }}
                className="fixed z-50 h-full border-l inset-y-0 right-0 lg:w-1/3 bg-surface-200 p-0 flex flex-col gap-0 
                            !min-w-[100vw] lg:!min-w-[600px] shadow-lg bg-white"
            >
                {/* Close Button */}

                <div className="flex justify-start gap-4 border-b items-center p-2 text-gray-500 text-lg"  >
                    <button
                        className=""
                        onClick={onClose}
                    >
                        ✖
                    </button>
                    <span>
                        <span className="text-gray-300">|</span>
                    </span>
                    <div>
                        Title
                    </div>
                </div>

                <div>
                    {children}
                </div>
            </motion.div>
        </>
    );
}
