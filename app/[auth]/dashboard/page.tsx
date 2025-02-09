"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/providers/UserProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar.tsx/Sidebar";
import Tasks from "@/components/Tasks";
import { supabase } from "@/lib/supabase";
import { Task, Step } from "@/lib/types";
import RightSideBar from '@/components/RightSideBar'
import { AnimatePresence } from "framer-motion";
import AddTask from "@/components/AddTask";

// Fetch all tasks for a company
async function getTasksFromServer(companyId: string | null): Promise<Task[]> {
    if (!companyId) return [];

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("company", companyId);

    if (error) {
        console.error("Error fetching tasks:", error.message);
        return [];
    }

    return data || [];
}

// Fetch all steps for a list of task IDs
async function getAllStepsFromServer(taskIds: string[]): Promise<Step[]> {
    if (taskIds.length === 0) return []; // No tasks exist

    const { data, error } = await supabase
        .from("steps")
        .select("*")
        .in("task_belong_to", taskIds); // Fetch steps for all task IDs

    if (error) {
        console.error("Error fetching steps:", error.message);
        return [];
    }

    return data || [];
}

export default function DashboardPage() {
    const { user, selectedCompany } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [steps, setSteps] = useState<Step[]>([]);
    const [editTask, setEditTask] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeComponent, setActiveComponent] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedCompany) return;

        const fetchTasksAndSteps = async () => {
            setLoading(true);

            // Fetch tasks first
            const taskData = await getTasksFromServer(selectedCompany);
            setTasks(taskData);

            // Extract task IDs to fetch steps
            const taskIds = taskData.map(task => task.id);

            // Fetch all steps related to these tasks
            const stepsData = await getAllStepsFromServer(taskIds);
            setSteps(stepsData);

            setLoading(false);
        };

        fetchTasksAndSteps();
    }, [selectedCompany]);

    if (!user) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className={`h-screen w-screen overflow-hidden `}>
            <div className={`${activeComponent ? "blur-sm" : ""}`}>
                <Navbar setActiveComponent={setActiveComponent} />
            </div>
            <main className={`flex h-full bg-grid ${activeComponent ? "blur-sm" : ""}`}>
                <Sidebar />
                <div className="px-20 py-10">
                    {loading ? <p>Loading tasks...</p> : <Tasks setActiveComponent={setActiveComponent} tasks={tasks} steps={steps} setEditTask={setEditTask} editTask={editTask} setTaskId={setTaskId} />}

                </div>
            </main>
            <div >
                <AnimatePresence>
                    {activeComponent && (
                        <RightSideBar isOpen={!!activeComponent} onClose={() => setActiveComponent(null)} >
                            <div className="p-4">
                                {activeComponent === "addTask" && selectedCompany && taskId !== null && (
                                    <AddTask companyId={selectedCompany} taskId={taskId} />
                                )}
                                {activeComponent === "editTask" && selectedCompany && taskId !== null && (
                                    <AddTask companyId={selectedCompany} taskId={taskId} />
                                )}
                            </div>

                        </RightSideBar>
                    )}
                </AnimatePresence>
            </div>
        </div>

    );
}
