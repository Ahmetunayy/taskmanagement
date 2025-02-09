import { supabase } from "./supabase";

function generateInvitationCode(length = 6) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export async function generateUniqueCode() {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = generateInvitationCode();
        const { data, error } = await supabase
            .from("companies")
            .select("id")
            .eq("invitation_code", code)
            .maybeSingle(); // ✅ Use `maybeSingle()` to avoid errors if no record is found

        if (!data && !error) {
            isUnique = true;
        }
    }

    return code;
}
