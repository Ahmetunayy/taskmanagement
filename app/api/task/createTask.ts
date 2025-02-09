import { supabase } from "@/lib/supabase";

export async function createTask(
    title: string,
    companyId: string,
    description: string,
    taskId: string | number, // Accept both string and number
    steps: { id?: string; title: string }[]
) {
    try {
        // Ensure taskId is a number if it exists
        const taskIdNum = Number(taskId) || null;

        // Update task if taskId exists
        if (taskIdNum) {

            const { data: updatedTask, error: taskError } = await supabase
                .from("tasks")
                .update({ title, company: companyId, description })
                .eq("id", taskIdNum) // Ensure correct type
                .select()
                .maybeSingle();
            // Set headers for single object response



            if (taskError) {
                console.error("Task update error:", taskError);
                return { error: taskError };
            }

            let stepData = [];

            if (steps.length > 0) {
                const stepsToUpdate = steps.filter(step => step.id); // Existing steps
                const newSteps = steps.filter(step => !step.id); // New steps

                // Update existing steps
                for (const step of stepsToUpdate) {
                    const { error: stepError } = await supabase
                        .from("steps")
                        .update({ title: step.title })
                        .eq("id", Number(step.id)); // Ensure correct type

                    if (stepError) {
                        console.error("Step update error:", stepError);
                        return { updatedTask, error: stepError };
                    }
                }

                // Insert new steps
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
            }

            return { updatedTask, stepData };
        }

        // If no taskId, create a new task (fallback)
        const { data: newTask, error: newTaskError } = await supabase
            .from("tasks")
            .insert([{ title, company: companyId, description }])
            .select()
            .maybeSingle();

        if (newTaskError) {
            console.error("Task creation error:", newTaskError);
            return { error: newTaskError };
        }

        return { newTask };

    } catch (error) {
        console.error("Unexpected error:", error);
        return { error: { message: "Failed to update task and steps" } };
    }
}
