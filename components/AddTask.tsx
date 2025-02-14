"use client";
import React, { useState, useEffect } from "react";
import { createTask } from "@/app/api/task/createTask";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import SvgAddButton from "./SvgAddButton";

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
  }[]>([]);

  const router = useRouter();

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

  // Task yarat veya güncelle
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const existingSteps = steps
    .filter((step) => step.id) // Only steps with an ID (already exist in DB)
    .map(({ id, title, description }) => ({
      id,
      title,
      description,
    }));

  const newSteps = steps
    .filter((step) => !step.id) // Steps without an ID (new ones)
    .map(({ title, description }) => ({
      title,
      description,
    }));

  // Send filtered steps to your API
  const { error } = await createTask(title, companyId, description, taskId || "", existingSteps, newSteps);


    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // İşlem başarılı olduysa state’i sıfırla ve sayfayı yenile
    setLoading(false);
    setTitle("");
    setDescription("");
    setSteps([]);
    router.refresh();
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
        showDescription: false, // ✅ Ensure each new step has showDescription
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="px-4 py-2 border rounded-md"
        />

        {/* Steps List */}
        <div className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Step ${index + 1}`}
                value={step.title}
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
                  value={step.description}
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
