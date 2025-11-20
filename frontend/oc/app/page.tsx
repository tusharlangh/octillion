import FileManager from "@/components/fileManager/fileManager";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login_signin/login");
  }

  return (
    <main className="h-full w-full bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] flex p-2 md:p-4">
      <section
        about="central"
        className="flex flex-col justify-center items-center relative h-full overflow-y-auto bg-white dark:bg-[#0B0B0C] w-full rounded-[10px] shadow-sm gap-2 md:gap-4 p-4 md:p-0"
      >
        <FileManager />
      </section>
    </main>
  );
}
