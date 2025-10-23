import FileManager from "@/components/fileManager/fileManager";
import Logo from "@/components/logo";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const font: string = "font-(family-name:--font-dm-sans)";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login_signin/login");
  }

  return (
    <main className="h-screen w-screen bg-[#0B0B0C] flex flex-col justify-center items-center relative">
      <section
        about="header"
        className="absolute top-2 left-2 right-2 flex justify-between items-center"
      >
        <div className="rounded-full h-[50px] w-[50px] flex justify-center items-center bg-transparent hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.12)] border-1 border-[#1C1C1E] hover:bg-[#1C1C1E]  transition-all cursor-pointer">
          <Image
            src={"/icons/menu.svg"}
            alt="menu-icon"
            height={24}
            width={24}
          />
        </div>

        <div className="rounded-full bg-white h-[40px] w-[40px] cursor-pointer"></div>
      </section>
      <section about="central">
        <div>{<Logo dynamicSize={"text-6xl md:text-7xl"} />}</div>

        <FileManager />
      </section>
    </main>
  );
}
