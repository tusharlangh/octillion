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
  const [searchType, setSearchType] = useState<"Enhanced" | "keyword">(
    "keyword"
  );

  if (!context)
    throw new Error("queryContext in Header component is not working");

  const { setIsLoading, setQuery, search, setSearch } = context;

  const handleSearch = async () => {
    if (!search.trim()) {
      return;
    }

    try {
      const query = new URLSearchParams({
        id: id,
        search: search,
      });
      const jwt = await handleTokenAction();
      console.log(jwt);

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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="relative backdrop-blur-2xl bg-[#F2F2F7] dark:bg-[#171717]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[52px] gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="h-9 w-9 flex items-center justify-center rounded-md  hover:bg-[rgba(0, 0, 0, 0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.15)] dark:active:bg-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <Image
                  src="/icons/menu_light.svg"
                  alt=""
                  height={20}
                  width={20}
                  className="block dark:hidden"
                />
                <Image
                  src="/icons/menu.svg"
                  alt=""
                  height={20}
                  width={20}
                  className="hidden dark:block"
                />
              </button>

              <button
                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-[rgba(0,0,0,0.05)] actvie:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(255,255,255,0.08)] dark:active:bg-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"
                onClick={() => router.replace("/")}
                aria-label="Home"
              >
                <Image
                  src="/icons/home_light.svg"
                  alt=""
                  height={20}
                  width={20}
                  className="block dark:hidden"
                />
                <Image
                  src="/icons/home.svg"
                  alt=""
                  height={20}
                  width={20}
                  className="hidden dark:block"
                />
              </button>
            </div>

            <div className="flex-1 max-w-2xl mx-4">
              <div className="flex items-center">
                <div className="relative group cursor-pointer flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 group-focus-within:opacity-100 transition-opacity">
                    <Image
                      src="/icons/search.svg"
                      alt=""
                      height={18}
                      width={18}
                    />
                  </div>
                  <div className="relative w-full">
                    <input
                      placeholder="Search documents"
                      className={`${font} px-8 w-full h-9 text-[15px] text-black dark:text-white placeholder-[rgba(0,0,0,0.4)] bg-[rgba(0,0,0,0.04)]
 dark:placeholder-[rgba(255,255,255,0.5)] dark:bg-[rgba(255,255,255,0.06)] spl-10 pr-16 outline-none transition-all border border-transparent rounded-l-md`}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
                <div className="w-1 h-9 bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)] pr-2">
                  <div className="w-[1px] py-3 bg-black/10 dark:bg-white/10 mt-1.5"></div>
                </div>
                <div className="relative h-9 inline-flex items-center bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)] rounded-r-md p-0.5 shrink-0 pr-2">
                  <button
                    onClick={() => setSearchType("keyword")}
                    className={`${font} relative z-10 px-1 text-[13px] font-medium rounded-[5px] transition-all duration-200 ease-out ${
                      searchType === "keyword"
                        ? "text-black dark:text-white"
                        : "text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.55)] dark:text-[rgba(255,255,255,0.5)] dark:hover:text-[rgba(255,255,255,0.8)]"
                    }`}
                  >
                    Keyword
                  </button>
                  <button
                    onClick={() => setSearchType("Enhanced")}
                    className={`${font} relative z-10 px-1 text-[13px] font-medium rounded-[5px] transition-all duration-200 ease-out ${
                      searchType === "Enhanced"
                        ? "text-black dark:text-white"
                        : "text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.55)] dark:text-[rgba(255,255,255,0.5)] dark:hover:text-[rgba(255,255,255,0.8)]"
                    }`}
                  >
                    Enhanced
                  </button>
                </div>
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
