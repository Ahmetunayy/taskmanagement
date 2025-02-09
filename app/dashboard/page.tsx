import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();


    if (!user) {
        return redirect("/login");
    }

    return (
        <main className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold">Welcome, {user.email}!</h1>
            <p className="mt-2 text-gray-600">This is your dashboard.</p>

            <form action="/logout" method="post">
                <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
                    Logout
                </button>
            </form>
        </main>
    );
}
