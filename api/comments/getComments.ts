import { createClient } from "@/lib/server";

interface GetTasksProps {
    companyId: string;
}


export async function getComments({ companyId }: GetTasksProps) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tasks").select("*").eq("company_id", companyId);
    if (error) {

        throw new Error(error.message);
    }
    return data;
}
