import { createClient } from "@/lib/server";

interface GetTasksProps {
    companyId: string;
}


export async function getTasks({ companyId }: GetTasksProps) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tasks").select("*").eq("company", companyId);
    if (error) {

        throw new Error(error.message);
    }
    return data;
}
