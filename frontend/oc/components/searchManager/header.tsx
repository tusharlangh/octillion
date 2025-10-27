"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SeeFiles from "../animations/seeFiles/seeFiles";
import { motion, AnimatePresence } from "framer-motion";
import SeeFilesManager from "../animations/seeFiles/seeFilesManager";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";

interface Props {
  id: string;
}

export default function Header({ id }: Props) {
  const font: string = "font-(family-name:--font-dm-sans)";
  const [search, setSearch] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (search === "") {
      return;
    }

    async function get() {
      try {
        const query = new URLSearchParams({ id: id, search: search });
        const jwt = await handleTokenAction();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/parse-files/?${query}`,
          {
            method: "GET",
            headers: {
              method: "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        console.log(res);
      } catch (error) {
        console.error(error);
      }
    }
    get();
  }, [search]);

  return (
    <div>
      <section className="absolute top-2 left-2 right-2 flex justify-between items-center">
        <section className="flex gap-2 w-full p-2">
          <div className="shrink-0 rounded-full h-[50px] w-[50px] flex justify-center items-center bg-transparent hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.12)] border-1 border-[#1C1C1E] hover:bg-[#1C1C1E] transition-all cursor-pointer">
            <Image
              src={"/icons/menu.svg"}
              alt="menu-icon"
              height={24}
              width={24}
            />
          </div>

          <div
            className="shrink-0 rounded-full h-[50px] w-[50px] flex justify-center items-center bg-[#1C1C1E] hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.12)] border-1 border-[#1C1C1E] transition-all cursor-pointer"
            onClick={() => router.replace("/")}
          >
            <Image
              src={"/icons/home.svg"}
              alt="home-icon"
              height={24}
              width={24}
            />
          </div>

          <section className="relative w-1/2 min-w-100 md:w-lg shadow-xs md:ml-4">
            <div className="absolute left-4 top-[13px]">
              <Image
                src="/icons/search.svg"
                alt="search-icon"
                height={26}
                width={26}
              />
            </div>

            <input
              placeholder="Search documents"
              className={`${font} text-[16px] h-[50px] text-white placeholder-[#EAEAEA] font-normal rounded-full pl-12 px-1 w-full bg-[#1C1C1E] hover:bg-[rgba(255,255,255,0.06)] transition-all`}
              type="text"
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          <SeeFilesManager id={id} />
        </section>
      </section>
    </div>
  );
}
