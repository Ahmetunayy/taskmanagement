"use client";

import { UserProvider, useUser } from "@/providers/UserProvider";
import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import { SidebarProvider, useSidebar } from "@/providers/SidebarContext";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar/Sidebar";
import AddTask from "@/components/AddTask";
import EditTask from "@/components/EditTask";
import { useState } from "react";
import { useEffect } from "react";
import Comments from "@/components/Comments";
import { supabase } from "@/lib/supabase";
import { Comment, User } from "@/lib/types";
import { PermissionProvider } from '@/providers/PermissionProvider';
import Link from "next/link";
import CompanySelector from "@/components/companySelector";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { selectedCompany } = useUser();

    if (!user) {
        return null;
    }

    return (
        <PermissionProvider>
            <UserProvider>
                <SidebarProvider>
                    <div className="h-screen w-screen overflow-hidden">
                        <Navbar />
                        <main className="flex h-[94vh] bg-grid bg-white">
                            <Sidebar />
                            <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-6 lg:py-10 flex-1 overflow-y-auto">
                                <div className="px-4 py-2 border-b">
                                    <div className="flex items-center justify-between">
                                        <CompanySelector />

                                        {/* Şirket yoksa veya şirket oluşturma yetkisi varsa bağlantıyı göster */}
                                        {!selectedCompany && (
                                            <Link
                                                href="/createcompany"
                                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Yeni Şirket Oluştur
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {children}
                            </div>
                        </main>
                        <RightSidebarWrapper />
                    </div>
                </SidebarProvider>
            </UserProvider>
        </PermissionProvider>
    );
}

async function getCommentsFromServer(companyId: string | null): Promise<Comment[]> {
    if (!companyId) return [];

    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('company_id', companyId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

async function getAllUsersFromServer(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
        console.error("Error fetching users:", error.message);
        return [];
    }
    return data || [];
}
// Wrapper for Right Sidebar so it listens to global state
function RightSidebarWrapper() {
    const { activeComponent, setActiveComponent, taskId, comments, setComments } = useSidebar();
    const { selectedCompany } = useUser();
    const [title, setTitle] = useState("");
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (selectedCompany) {
            const fetchComments = async () => {
                const comments = await getCommentsFromServer(selectedCompany);
                setComments(comments);
            }
            const fetchUsers = async () => {
                const users = await getAllUsersFromServer();
                setUsers(users);
            }
            fetchComments();
            fetchUsers();
        }
    }, [selectedCompany, setComments]);

    useEffect(() => {
        if (activeComponent === "addTask") {
            setTitle("Add Task");
        } else if (activeComponent === "editTask") {
            setTitle("Edit Task");
        } else if (activeComponent === "comments") {
            setTitle("Comments");
        }
    }, [activeComponent]);

    return (
        <AnimatePresence>
            {activeComponent && (
                <RightSideBar isOpen={!!activeComponent} onClose={() => setActiveComponent(null)} title={title}>
                    <div className="p-4">
                        {activeComponent === "addTask" && selectedCompany && <AddTask companyId={selectedCompany} />}
                        {activeComponent === "editTask" && selectedCompany && taskId && <EditTask companyId={selectedCompany} taskId={taskId} />}
                        {activeComponent === "comments" && selectedCompany && taskId && <Comments taskId={taskId} comments={comments} users={users} companyId={selectedCompany} />}
                    </div>
                </RightSideBar>
            )}
        </AnimatePresence>
    );
}
