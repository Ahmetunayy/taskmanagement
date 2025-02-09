"use client";
import React, { useState, useEffect } from "react";
import { createTask } from "@/app/api/task/createTask";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddTask({ companyId, taskId }: { companyId: string; taskId?: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [steps, setSteps] = useState<{ id?: string; title: string }[]>([]);
    const router = useRouter();

    // Fetch existing task and steps if editing
    useEffect(() => {
        if (!taskId) return;
        console.log(taskId)

        const fetchTask = async () => {
            setLoading(true);

            // Fetch task details
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

            // Fetch steps
            const { data: stepsData, error: stepsError } = await supabase
                .from("steps")
                .select("*")
                .eq("task_belong_to", taskId);

            if (stepsError) {
                setError("Failed to load steps.");
                setLoading(false);
                return;
            }

            setSteps(stepsData || []);
            setLoading(false);
        };

        fetchTask();
    }, [taskId]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await createTask(title, companyId, description, taskId || "", steps);

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setLoading(false);

        // Ensure state is cleared before refreshing
        setTitle("");
        setDescription("");
        setSteps([]);

        // Force a refresh
        router.refresh();
    };


    // Handle step input changes
    const handleStepChange = (index: number, newTitle: string) => {
        setSteps((prevSteps) => prevSteps.map((step, i) => (i === index ? { ...step, title: newTitle } : step)));
    };

    // Add new step
    const addStep = () => {
        setSteps([...steps, { title: "" }]); // New step without an ID
    };

    return (
        <div>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                {/* Task Name Input */}
                <input
                    type="text"
                    placeholder="Task Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />

                {/* Task Description Input */}
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="px-4 py-2 border rounded-md"
                />

                {/* Steps List */}
                <div className="flex flex-col gap-2">
                    {steps.map((step, index) => (
                        <input
                            key={step.id || index}
                            type="text"
                            placeholder={`Step ${index + 1}`}
                            value={step.title}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                            className="px-4 py-2 border rounded-md"
                        />
                    ))}
                </div>

                {/* Add Step Button */}
                <button type="button" onClick={addStep} className="px-4 py-2 bg-green-500 text-white rounded-md">
                    Add Step
                </button>

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
