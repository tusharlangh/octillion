"use client";

import Image from "next/image";
import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import SeeFilesManager from "../animations/seeFiles/seeFilesManager";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { queryContext } from "./searchManger";
import Logo from "../logo";

interface Props {
  id: string;
}

export default function Header({ id }: Props) {
  const font: string = "font-(family-name:--font-dm-sans)";
  const router = useRouter();
  const context = useContext(queryContext);

  if (!context)
    throw new Error("queryContext in Header component is not working");

  const { setIsLoading, setQuery, search, setSearch } = context;

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

        const data = await res.json();

        if (data.success) {
          setIsLoading(true);
          setQuery(data.searchResults);
          setIsLoading(false);
        } else {
          console.log(data.error);
        }
      } catch (error) {
        console.error(error);
      }
    }
    get();
  }, [search]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="relative backdrop-blur-2xl bg-[#171717]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[52px] gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <Image src={"/icons/menu.svg"} alt="" height={20} width={20} />
              </button>

              <button
                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"
                onClick={() => router.replace("/")}
                aria-label="Home"
              >
                <Image src={"/icons/home.svg"} alt="" height={20} width={20} />
              </button>
            </div>

            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative group cursor-pointer">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 group-focus-within:opacity-100 transition-opacity">
                  <Image
                    src="/icons/search.svg"
                    alt=""
                    height={18}
                    width={18}
                  />
                </div>
                <input
                  placeholder="Search documents"
                  className={`${font} w-full h-9 text-[15px] text-white placeholder-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.08)] rounded-md pl-10 pr-3 outline-none transition-all border border-transparent `}
                  type="text"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <SeeFilesManager id={id} />

              <div className="cursor-pointer">
                <Logo dynamicSize="text-xl" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
