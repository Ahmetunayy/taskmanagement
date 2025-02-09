import { createClient } from "@/lib/server";

export async function getCompanies(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("owner", userId);

    if (error) {
        console.error("Error fetching companies:", error.message);
        return [];
    }

    return data || [];
}