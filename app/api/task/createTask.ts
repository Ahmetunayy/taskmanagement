import { supabase } from "@/lib/supabase";

export async function createTask(
    title: string,
    companyId: string,
    description: string,
    taskId: string | number, // Accept both string and number
    existingSteps: { id?: string; title: string, description: string, is_completed: boolean }[],
    newSteps: { title: string, description: string, is_completed: boolean }[]
) {
    try {
        const taskIdNum = Number(taskId) || null;

        // Eğer taskId varsa güncelleme yap
        if (taskIdNum) {
            const { data: updatedTask, error: taskError } = await supabase
                .from("tasks")
                .update({ title, company: companyId, description })
                .eq("id", taskIdNum)
                .select()
                .maybeSingle();

            if (taskError) {
                console.error("Task update error:", taskError);
                return { error: taskError };
            }

            let stepData = [];

            // Var olan stepleri güncelle
            if (existingSteps.length > 0) {
                for (const step of existingSteps) {
                    const { error: stepError } = await supabase
                        .from("steps")
                        .update({
                            title: step.title,
                            description: step.description,
                            is_completed: step.is_completed
                        })
                        .eq("id", Number(step.id));

                    if (stepError) {
                        console.error("Step update error:", stepError);
                        return { updatedTask, error: stepError };
                    }
                }
            }

            // Yeni stepleri ekle
            if (newSteps.length > 0) {
                const { data, error: newStepError } = await supabase
                    .from("steps")
                    .insert(newSteps.map(step => ({ ...step, task_belong_to: taskIdNum })))
                    .select();

                if (newStepError) {
                    console.error("New step creation error:", newStepError);
                    return { updatedTask, error: newStepError };
                }

                stepData = data;
            }

            return { updatedTask, stepData };
        }

        // Eğer yeni bir task oluşturuluyorsa
        const { data: newTask, error: newTaskError } = await supabase
            .from("tasks")
            .insert([{ title, company: companyId, description }])
            .select()
            .maybeSingle();

        if (newTaskError) {
            console.error("Task creation error:", newTaskError);
            return { error: newTaskError };
        }

        // Yeni task ID'si ile stepleri ekle
        if (newSteps.length > 0 && newTask?.id) {
            const { data: stepData, error: newStepError } = await supabase
                .from("steps")
                .insert(newSteps.map(step => ({ ...step, task_belong_to: newTask.id })))
                .select();

            if (newStepError) {
                console.error("New step creation error:", newStepError);
                return { newTask, error: newStepError };
            }

            return { newTask, stepData };
        }

        return { newTask };

    } catch (error) {
        console.error("Unexpected error:", error);
        return { error: { message: "Failed to update task and steps" } };
    }
}
