import { supabase } from "@/lib/supabase";

export async function createComment(comment: string, taskId: string, companyId: string, userId: string) {
    const { data, error } = await supabase
        .from("comments")
        .insert({ comment, task_id: taskId, company: companyId, commentor: userId })
        .select();

    return { data, error };
}
