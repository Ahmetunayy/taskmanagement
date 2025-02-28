
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  const { data: authUser } = await (await supabase)
    .from('users')
    .select('username')
    .eq('auth_id', user?.id)
    .single();
  console.log(user);

  if (user) {
    redirect(`/${authUser?.username}/dashboard`);
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Navbar />
      <main className="flex h-[94vh">
        <Sidebar />
      </main>
    </div>
  );
}
