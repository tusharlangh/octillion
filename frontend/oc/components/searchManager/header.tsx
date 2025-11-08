"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { queryContext } from "./searchManger";
import { Search, Home } from "lucide-react";
import { DM_Sans } from "next/font/google";
import ErrorPopUp from "../popUp/errorPopUp";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

interface Props {
  id: string;
}

export default function Header({ id }: Props) {
  const router = useRouter();
  const context = useContext(queryContext);
  const [searchType, setSearchType] = useState<"enhanced" | "keyword">(
    "keyword"
  );
  const [error, setError] = useState<string | null>(null);

  if (!context)
    throw new Error("queryContext in Header component is not working");

  const { setIsLoading, setQuery, search, setSearch, setLastSearchType } =
    context;

  const handleSearch = async () => {
    if (!search.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        id: id,
        searchType: searchType,
        search: search,
      });
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
        setQuery(data.searchResults);
        setIsLoading(false);
      } else {
        setError(data.error || "An error occurred while searching");
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="w-full pt-2 px-4 sticky -top-20 bg-white dark:bg-[#0B0B0C] z-1 transition-colors duration-200">
      <div className="px-7 relative w-full mt-20 group">
        <Search
          className={`${
            search.length === 0
              ? "text-neutral-400 dark:text-neutral-600"
              : "text-neutral-900 dark:text-neutral-200"
          } absolute top-3 
          group-hover:text-neutral-700 dark:group-hover:text-neutral-400 
          transition-colors duration-200`}
          height={18}
          width={18}
        />
        <input
          placeholder="Search files"
          className={`${
            dmSans.className
          } w-full border-b border-neutral-200 dark:border-neutral-800 
          p-2 pl-7 text-lg outline-none 
          placeholder:text-neutral-400 dark:placeholder:text-neutral-600
          ${
            search.length === 0
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-neutral-900 dark:text-neutral-200"
          } 
          focus:text-neutral-900 dark:focus:text-neutral-100 
          focus:border-neutral-400 dark:focus:border-neutral-600
          bg-transparent
          transition-colors duration-200`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute top-3 right-10 inline-flex items-center p-0.5 shrink-0">
          <button
            onClick={() => {
              setSearchType("keyword");
              setLastSearchType("keyword");
            }}
            className={`${
              dmSans.className
            } relative z-10 px-2 py-0.5 text-[13px] font-medium rounded-[5px] 
            transition-all duration-200 ease-out ${
              searchType === "keyword"
                ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            Keyword
          </button>
          <button
            onClick={() => {
              setSearchType("enhanced");
              setLastSearchType("enhanced");
            }}
            className={`${
              dmSans.className
            } relative z-10 px-2 py-0.5 text-[13px] font-medium rounded-[5px] 
            transition-all duration-200 ease-out ${
              searchType === "enhanced"
                ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            Enhanced
          </button>
        </div>
      </div>
      {error && (
        <ErrorPopUp
          errorMessage={error}
          onDismiss={() => setError(null)}
          duration={3000}
        />
      )}
    </section>
  );
}
