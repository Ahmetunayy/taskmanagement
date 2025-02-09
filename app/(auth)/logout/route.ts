import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST() {
    const supabase = await createClient();

    await supabase.auth.signOut();

    // Ensure absolute URL for NextResponse.redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = NextResponse.redirect(`${baseUrl}/login`);

    response.cookies.set("sb-igengpmlsrwuodblqjhm-auth-token", "", { maxAge: 0 });

    return response;
}
