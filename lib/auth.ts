import { supabase } from "./supabase";


export async function signUp(email: string, password: string, phoneNumber: string, country_code: string, firstname: string, lastname: string) {
    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return { error };
    }

    // Get the newly created user's ID from Supabase Auth
    const authId = data.user?.id;

    if (authId) {
        const phoneNumberWithoutCountryCode = country_code + phoneNumber;

        const { error: insertError } = await supabase.from("users").insert([
            { auth_id: authId, email, phone_number: phoneNumberWithoutCountryCode, firstname, lastname }

        ]);

        if (insertError) {
            return { error: insertError };
        }
    }

    return { data };
}

export async function signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
    return await supabase.auth.signOut();
}



