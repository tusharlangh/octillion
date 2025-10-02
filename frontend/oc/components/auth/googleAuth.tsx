"use client";

import { supabase } from "@/supabaseClient";
import Image from "next/image";

interface Auth {
  title: string;
}

export default function GoogleAuth({ title }: Auth) {
  async function redirect_to_google() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      console.error(error);
    } else {
      console.log("redirecting to google auth");
    }
  }

  return (
    <section className="flex justify-center items-center">
      <div
        className="flex justify-center items-center gap-4 outline-[#464646] outline-1 rounded-[20px] p-2 px-6 cursor-pointer hover:outline-white transition-colors"
        onClick={() => redirect_to_google()}
      >
        <Image
          src={"/google_icon.png"}
          alt="google-icon"
          width={20}
          height={20}
        />
        <p className="font-(family-name:--font-dm-sans) font-bold text-white text-[16px]">
          {title}
        </p>
      </div>
    </section>
  );
}
