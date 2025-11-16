"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { queryContext } from "./searchManger";
import { Search, Home } from "lucide-react";
import { DM_Sans } from "next/font/google";
import ErrorPopUp from "../popUp/errorPopUp";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";

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
  const [searchType, setSearchType] = useState<
    "enhanced" | "keyword" | "hybrid"
  >("keyword");
  const [error, setError] = useState<string | null>(null);

  if (!context)
    throw new Error("queryContext in Header component is not working");

  const { setIsLoading, setQuery, search, setSearch, setLastSearchType } =
    context;

  const handleSearch = async () => {
    if (!search?.trim()) {
      setError("Search is empty");
      return;
    }

    if (!id) {
      setError("Id not found");
      return;
    }

    if (!searchType) {
      setError("Search type not selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const jwt = await handleTokenAction();
      if (!jwt) {
        throw new Error("Failed to get authentication token");
      }

      const query = new URLSearchParams({
        id: id,
        searchType: searchType,
        search: search.trim(),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parse-files/?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.error?.message ||
          data.error ||
          getErrorMessageByStatus(res.status);

        console.error("Search failed:", {
          status: res.status,
          error: errorMessage,
          details: data.error?.details,
        });

        setError(errorMessage);

        if (res.status === 401 || res.status === 403) {
          setTimeout(() => router.replace("/login_signin/login"), 2000);
        }

        return;
      }

      setQuery(data.searchResults || []);
    } catch (error) {
      console.error("Search error: ", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Network error. Please check your connection.");
      } else if (error instanceof Error && error.message.includes("token")) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => router.replace("/login_signin/login"), 2000);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="w-full pt-2 px-8 sticky -top-20 bg-white dark:bg-[#0B0B0C] z-1 transition-colors duration-200">
      <div className="px-2 relative w-full mt-20 group flex border-b border-neutral-200 dark:border-neutral-800">
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
          className={`${dmSans.className} w-full 
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
        <div className="inline-flex items-center p-0.5 shrink-0">
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
          <button
            onClick={() => {
              setSearchType("hybrid");
              setLastSearchType("hybrid");
            }}
            className={`${
              dmSans.className
            } relative z-10 px-2 py-0.5 text-[13px] font-medium rounded-[5px] 
            transition-all duration-200 ease-out ${
              searchType === "hybrid"
                ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            Hybrid
          </button>
        </div>
      </div>
      {error && (
        <ErrorPopUp
          errorMessage={error}
          onDismiss={() => setError(null)}
          duration={3000}
          isHome={true}
        />
      )}
    </section>
  );
}
