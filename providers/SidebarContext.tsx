"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Comment, Task, Step } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useUser } from "./UserProvider";

interface SidebarContextType {
    activeComponent: string | null;
    setActiveComponent: (component: string | null) => void;
    taskId: string | null;
    setTaskId: (id: string | null) => void;
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    steps: Step[];
    setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
    refreshData: () => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [activeComponent, setActiveComponent] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [steps, setSteps] = useState<Step[]>([]);
    const { selectedCompany } = useUser();

    // Verileri yeniden yükleme fonksiyonu - useCallback ile optimize edildi
    const refreshData = useCallback(async () => {
        if (!selectedCompany) return;

        // Tüm görevleri yükle
        const { data: tasksData } = await supabase
            .from("tasks")
            .select("*")
            .eq("company_id", selectedCompany);

        if (tasksData) {
            setTasks(tasksData);

            // Görev ID'lerini al
            const taskIds = tasksData.map(task => task.id);

            // Tüm adımları yükle
            if (taskIds.length > 0) {
                const { data: stepsData } = await supabase
                    .from("steps")
                    .select("*")
                    .in("task_id", taskIds);

                if (stepsData) setSteps(stepsData);
            }

            // Tüm yorumları yükle
            const { data: commentsData } = await supabase
                .from("comments")
                .select("*")
                .eq("company_id", selectedCompany);

            if (commentsData) setComments(commentsData);
        }
    }, [selectedCompany]);  // selectedCompany bağımlılık olarak eklendi

    // Realtime abonelikleri ayarla
    useEffect(() => {
        if (!selectedCompany) return;

        // İlk yükleme
        refreshData();

        // Tasks tablosuna abone ol
        const tasksSubscription = supabase
            .channel('tasks-channel')
            .on('postgres_changes', {
                event: '*', // INSERT, UPDATE, DELETE olaylarını dinle
                schema: 'public',
                table: 'tasks',
                filter: `company=eq.${selectedCompany}`
            }, () => {
                refreshData();
            })
            .subscribe();

        // Steps tablosuna abone ol
        const stepsSubscription = supabase
            .channel('steps-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'steps'
            }, () => {
                refreshData();
            })
            .subscribe();

        // Comments tablosuna abone ol
        const commentsSubscription = supabase
            .channel('comments-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'comments',
                filter: `company=eq.${selectedCompany}`
            }, () => {
                refreshData();
            })
            .subscribe();

        // Cleanup
        return () => {
            tasksSubscription.unsubscribe();
            stepsSubscription.unsubscribe();
            commentsSubscription.unsubscribe();
        };
    }, [selectedCompany, refreshData]);

    return (
        <SidebarContext.Provider value={{
            activeComponent,
            setActiveComponent,
            taskId,
            setTaskId,
            comments,
            setComments,
            tasks,
            setTasks,
            steps,
            setSteps,
            refreshData,
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
