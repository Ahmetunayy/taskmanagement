"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/providers/UserProvider";
import Tasks from "@/components/Tasks";
import { useSidebar } from "@/providers/SidebarContext";
import FilterBar, { FilterOptions } from "@/components/FilterBar";
import { Task } from "@/lib/types";
import StatisticsPanel from "@/components/StatisticsPanel";
import TagManager from "@/components/TagManager";
import { supabase } from "@/lib/supabase";

export default function TasksPage() {
    const { selectedCompany } = useUser();
    const { tasks, steps, comments, setTaskId, setActiveComponent, refreshData } = useSidebar();
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

    // Sayfa yüklendiğinde veya şirket değiştiğinde veriyi yenile
    useEffect(() => {
        if (selectedCompany) {
            refreshData();
        }
    }, [selectedCompany, refreshData]);

    // Başlangıçta tüm görevleri göster
    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    // Filtreleme fonksiyonu
    const handleFilterChange = async (filters: FilterOptions) => {
        let result = [...tasks];

        // Metin araması
        if (filters.query) {
            const query = filters.query.toLowerCase();
            result = result.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            );
        }

        // Durum filtresi
        if (filters.status !== 'all') {
            result = result.filter(task => task.status === filters.status);
        }

        // Öncelik filtresi
        if (filters.priority !== 'all') {
            result = result.filter(task => task.priority === filters.priority);
        }

        // Etiket filtresi - asenkron işlem için özel kod
        if (filters.tagIds && filters.tagIds.length > 0) {
            // Tüm görevlerin tag ilişkilerini tek seferde getir
            const { data: allTaskTags } = await supabase
                .from('task_tags')
                .select('task_id, tag_id')
                .in('task_id', result.map(task => task.id));

            if (allTaskTags) {
                // task_id -> tag_id[] nesnesine dönüştür
                const taskTagsMap: Record<string, string[]> = {};
                allTaskTags.forEach(item => {
                    if (!taskTagsMap[item.task_id]) {
                        taskTagsMap[item.task_id] = [];
                    }
                    taskTagsMap[item.task_id].push(item.tag_id);
                });

                // Filtreleme işlemini yap
                result = result.filter(task => {
                    const taskTagIds = taskTagsMap[task.id] || [];
                    return filters.tagIds.some(tagId => taskTagIds.includes(tagId));
                });
            } else {
                // Veri yoksa hiçbir görevi gösterme
                result = [];
            }
        }

        // Sıralama
        if (filters.sortBy === 'date') {
            result.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        } else if (filters.sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            result.sort((a, b) =>
                priorityOrder[a.priority as keyof typeof priorityOrder] -
                priorityOrder[b.priority as keyof typeof priorityOrder]
            );
        } else if (filters.sortBy === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        setFilteredTasks(result);
    };

    // tasks sorgusu için düzeltme
    const getTasksFromServer = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('company_id', selectedCompany); // 'company' yerine 'company_id'

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return [];
        }
    };

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* İstatistik Panosu */}
            <StatisticsPanel />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <FilterBar onFilterChange={handleFilterChange} />

                    <Tasks
                        tasks={filteredTasks}
                        steps={steps}
                        comments={comments}
                        setActiveComponent={setActiveComponent}
                        setTaskId={setTaskId}
                    />
                </div>

                <div className="space-y-6">
                    <TagManager />

                    {/* Buraya farklı widget'lar eklenebilir */}
                </div>
            </div>
        </div>
    );
}
