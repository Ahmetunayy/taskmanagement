"use client";
import React, { useState, useEffect } from "react";
import { createTask } from "@/app/api/task/createTask";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import SvgAddButton from "./SvgAddButton";
import { Tag, User } from '@/lib/types';
import { useUser } from "@/providers/UserProvider";
import { useSidebar } from "@/providers/SidebarContext";

export default function AddTask({ companyId, taskId }: { companyId: string; taskId?: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Sadece local state'te tutuyoruz; DB'ye bu alanı kaydetmiyoruz
    const [steps, setSteps] = useState<{
        id?: string;
        title: string;
        description: string;
        showDescription: boolean; // ✅ Ensure every step has this property
        is_completed: boolean;
    }[]>([]);

    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

    const router = useRouter();
    const { user } = useUser();
    const { refreshData, setActiveComponent } = useSidebar();

    // Task düzenleme ekranındaysak mevcut task ve step bilgilerini çek
    useEffect(() => {
        if (!taskId) return;

        const fetchTask = async () => {
            setLoading(true);

            // 1) Task detayını çek
            const { data: taskData, error: taskError } = await supabase
                .from("tasks")
                .select("*")
                .eq("id", taskId)
                .single();

            if (taskError) {
                setError("Failed to load task.");
                setLoading(false);
                return;
            }

            setTitle(taskData.title);
            setDescription(taskData.description);

            // 2) Task'a ait adımları (steps) çek
            const { data: stepsData, error: stepsError } = await supabase
                .from("steps")
                .select("*")
                .eq("task_belong_to", taskId);

            if (stepsError) {
                setError("Failed to load steps.");
                setLoading(false);
                return;
            }

            setSteps(
                stepsData.map((step) => ({
                    ...step,
                    showDescription: false,
                }))
            );

            setLoading(false);
        };

        fetchTask();
    }, [taskId]);

    // Etiketleri ve takım üyelerini yükle
    useEffect(() => {
        async function fetchTagsAndUsers() {
            if (!companyId) return;

            // Etiketleri getir
            const { data: tagsData } = await supabase
                .from('tags')
                .select('*')
                .eq('company_id', companyId);

            if (tagsData) setAvailableTags(tagsData);

            // Takım üyelerini getir
            const { data: usersData } = await supabase
                .from('users')
                .select('*');

            if (usersData) setTeamMembers(usersData);

            // Görevin etiketlerini getir
            if (taskId) {
                const { data: taskTagsData } = await supabase
                    .from('task_tags')
                    .select('tag_id')
                    .eq('task_id', taskId);

                if (taskTagsData) {
                    setSelectedTags(taskTagsData.map(item => item.tag_id));
                }

                // Atanan kullanıcıları getir
                const { data: assignmentsData } = await supabase
                    .from('task_assignments')
                    .select('user_id')
                    .eq('task_id', taskId);

                if (assignmentsData) {
                    setAssignedUsers(assignmentsData.map(item => item.user_id));
                }
            }
        }

        fetchTagsAndUsers();
    }, [companyId, taskId]);

    // Task yarat veya güncelle
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const existingSteps = steps
            .filter((step) => step.id) // Only steps with an ID (already exist in DB)
            .map(({ id, title, description, is_completed }) => ({
                id,
                title,
                description,
                is_completed,
            }));

        const newSteps = steps
            .filter((step) => !step.id) // ID'si olmayan adımlar (yeni eklenenler)
            .map(({ title, description, is_completed }) => ({
                title: title || "Untitled Step",
                description: description || "No Description",
                is_completed: is_completed ?? false,
            }));

        // Send filtered steps to your API
        const response = await createTask(title, companyId, description, taskId || "", existingSteps, newSteps);

        // Hata kontrolü
        if (response.error) {
            setError(response.error.message);
            setLoading(false);
            return;
        }

        // İşlem başarılı
        setLoading(false);
        setTitle("");
        setDescription("");
        setSteps([]);
        router.refresh();

        // Etiketleri kaydet - hangi özelliğin var olduğunu kontrol et
        const savedTaskId = response.newTask?.id || response.updatedTask?.id || taskId;

        if (savedTaskId) {
            // Etiketleri kaydet
            if (selectedTags.length > 0) {
                // Önce eski etiketleri sil
                await supabase
                    .from('task_tags')
                    .delete()
                    .eq('task_id', savedTaskId);

                // Yeni etiketleri ekle
                const taskTagsToInsert = selectedTags.map(tagId => ({
                    task_id: savedTaskId,
                    tag_id: tagId
                }));

                await supabase
                    .from('task_tags')
                    .insert(taskTagsToInsert);
            }

            // Önce eski atamaları sil
            await supabase
                .from('task_assignments')
                .delete()
                .eq('task_id', savedTaskId);

            // Yeni atamaları ekle
            if (assignedUsers.length > 0) {
                const assignmentsToInsert = assignedUsers.map(userId => ({
                    task_id: savedTaskId,
                    user_id: userId,
                    assigned_by: user?.id,
                    status: 'pending'
                }));

                await supabase
                    .from('task_assignments')
                    .insert(assignmentsToInsert);
            }

            refreshData();
            setActiveComponent(null);
        }
    };

    // Bir step'in hem başlığını hem açıklamasını güncelleyen fonksiyon
    const handleStepChange = (index: number, newTitle: string, newDescription: string) => {
        setSteps((prevSteps) =>
            prevSteps.map((step, i) =>
                i === index
                    ? { ...step, title: newTitle, description: newDescription }
                    : step
            )
        );
    };

    // Yeni step ekle
    const addStep = () => {
        setSteps([
            ...steps,
            {
                title: "",
                description: "",
                showDescription: false, //
                is_completed: false,
            },
        ]);
    };

    // İlgili index'teki step'in description alanını açma-kapama
    const toggleDescription = (index: number) => {
        console.log("Toggling step index:", index);
        setSteps((prevSteps) =>
            prevSteps.map((step, i) =>
                i === index
                    ? { ...step, showDescription: !step.showDescription } // ✅ Fix the logic
                    : step
            )
        );
    };

    const handleStepCompletion = (index: number, is_completed: boolean) => {
        setSteps((prevSteps) =>
            prevSteps.map((step, i) =>
                i === index ? { ...step, is_completed } : step
            )
        );
    };

    // Etiket seçimi değiştiğinde
    const handleTagToggle = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    // Kullanıcı atama değiştiğinde
    const handleAssignmentToggle = (userId: string) => {
        setAssignedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div>
            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                {/* Task Title */}
                <input
                    type="text"
                    placeholder="Task Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />

                {/* Task Description */}
                <input
                    type="text"
                    placeholder="Description"
                    value={description ?? ""}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />

                {/* Steps List */}
                <div className="flex flex-col gap-2">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={step.is_completed}
                                onChange={(e) => handleStepCompletion(index, e.target.checked)}
                            />
                            <input
                                type="text"
                                placeholder={`Step ${index + 1}`}
                                value={step.title ?? ""}
                                onChange={(e) =>
                                    handleStepChange(index, e.target.value, step.description)
                                }
                                className="px-4 py-2 border rounded-md"
                            />

                            <button
                                type="button"
                                onClick={() => toggleDescription(index)}
                                className="flex items-center justify-center p-1 border rounded-md"
                            >
                                <SvgAddButton color="black" />
                            </button>

                            {/* ✅ Fixed: Make sure to use step.showDescription */}
                            {step.showDescription && (
                                <input
                                    type="text"
                                    placeholder="Step Description"
                                    value={step.description ?? ""}
                                    onChange={(e) =>
                                        handleStepChange(index, step.title, e.target.value)
                                    }
                                    className="px-4 py-2 border rounded-md"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Step Button */}
                <button
                    type="button"
                    onClick={addStep}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                    Add Step
                </button>

                {/* Etiketler */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Etiketler</label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag.id)
                                    ? 'bg-opacity-100'
                                    : 'bg-opacity-20'
                                    }`}
                                style={{
                                    backgroundColor: selectedTags.includes(tag.id)
                                        ? tag.color
                                        : tag.color + '20',
                                    color: selectedTags.includes(tag.id)
                                        ? 'white'
                                        : tag.color
                                }}
                            >
                                {tag.name}
                            </button>
                        ))}

                        {availableTags.length === 0 && (
                            <p className="text-sm text-gray-500">Henüz etiket oluşturulmadı.</p>
                        )}
                    </div>
                </div>

                {/* Kullanıcı Atamaları */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Görev Atama</label>
                    <div className="flex flex-wrap gap-2">
                        {teamMembers.map(member => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => handleAssignmentToggle(member.id)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${assignedUsers.includes(member.id)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                            >
                                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                    {member.firstname?.[0]}{member.lastname?.[0]}
                                </div>
                                {member.firstname} {member.lastname}
                            </button>
                        ))}

                        {teamMembers.length === 0 && (
                            <p className="text-sm text-gray-500">Kullanıcı bulunamadı.</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Saving..." : taskId ? "Update Task" : "Create Task"}
                </button>
            </form>
        </div>
    );
}
