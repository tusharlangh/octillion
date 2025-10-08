import AddFile from "@/components/addFile";
import AddFileEx from "@/components/addFileEx";
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
    <main className="h-screen w-screen bg-[#211717] flex flex-col justify-center items-center relative">
      <section
        about="header"
        className="absolute top-2 left-2 right-2 flex justify-between items-center"
      >
        <div className="rounded-full h-[50px] w-[50px] bg-[rgba(41, 31, 29, 1)] flex justify-center items-center border-1 border-[rgb(46,38,37)] hover:bg-[#463A3A] hover:border-[#504343] transition-all cursor-pointer">
          <Image
            src={"/icons/menu.svg"}
            alt="menu-icon"
            height={24}
            width={24}
          />
        </div>

        <div className="rounded-full bg-[#465C88] h-[40px] w-[40px] cursor-pointer"></div>
      </section>
      <section about="central">
        <div>{<Logo dynamicSize={"text-6xl md:text-7xl"} />}</div>

        <AddFile />
      </section>
    </main>
  );
}
