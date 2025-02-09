import { supabase } from "@/lib/supabase";
import { generateUniqueCode } from "@/lib/invitationCodeGenerator";


export async function createCompany(name: string) {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return { error: { message: error?.message || "Failed to retrieve user." } };
    }

    const authId = data.user?.id;
    const invitationCode = await generateUniqueCode();



    const { data: insertData, error: insertError } = await supabase.from("companies").insert([
        { name, owner: authId, invitation_code: invitationCode }
    ]);

    return insertError ? { error: { message: insertError.message } } : { data: insertData };
}
