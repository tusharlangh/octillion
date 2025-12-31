"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { queryContext } from "./searchManger";
import { Search, Home } from "lucide-react";
import { DM_Sans } from "next/font/google";
import { SidebarContext } from "../ConditionalLayout";
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
  const sidebarContext = useContext(SidebarContext);
  if (!sidebarContext) throw new Error("SidebarContext is not working");
  const { setNotis } = sidebarContext;

  if (!context)
    throw new Error("queryContext in Header component is not working");

  const { setIsLoading, setQuery, search, setSearch } = context;

  const handleSearch = async () => {
    if (!search?.trim()) {
      setNotis({ message: "Search is empty", type: "error" });
      return;
    }

    if (!id) {
      setNotis({ message: "Id not found", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const jwt = await handleTokenAction();
      if (!jwt) {
        throw new Error("Failed to get authentication token");
      }

      const query = new URLSearchParams({
        id: id,
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

        setNotis({ message: errorMessage, type: "error" });

        if (res.status === 401 || res.status === 403) {
          setTimeout(() => router.replace("/login_signin/login"), 2000);
        }

        return;
      }

      console.log(data.result);

      setQuery(data.result || {}, data.fileMapping || {});
    } catch (error) {
      console.error("Search error: ", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setNotis({
          message: "Network error. Please check your connection.",
          type: "error",
        });
      } else if (error instanceof Error && error.message.includes("token")) {
        setNotis({
          message: "Authentication failed. Please log in again.",
          type: "error",
        });
        setTimeout(() => router.replace("/login_signin/login"), 2000);
      } else {
        setNotis({
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
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
    <section className="w-full pt-2 px-2 md:px-8 sticky -top-20 bg-white dark:bg-[#0B0B0C] z-1 transition-colors duration-200">
      <div className="px-2 relative w-full mt-20 group flex flex-col md:flex-row border-b border-neutral-200 dark:border-neutral-800">
        <div className="relative flex-1 flex items-center">
          <Search
            className={`${
              search.length === 0
                ? "text-neutral-400 dark:text-neutral-600"
                : "text-neutral-900 dark:text-neutral-200"
            } absolute top-2.75 md:top-3 left-0
            group-hover:text-neutral-700 dark:group-hover:text-neutral-400 
            transition-colors duration-200`}
            height={18}
            width={18}
          />
          <input
            placeholder="Search files"
            className={`${dmSans.className} w-full 
            p-2 pl-7 text-base md:text-lg outline-none 
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
        </div>
      </div>
    </section>
  );
}
