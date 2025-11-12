"use client";
import { DM_Sans } from "next/font/google";
import React, { useState, useContext } from "react";
import { chatContext } from "./charManger";
import { Search } from "lucide-react";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function ChatSearchBar() {
  const context = useContext(chatContext);
  if (!context)
    throw new Error("queryContext in Header component is not working");

  const { search, setSearch } = context;

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
        />
      </div>
    </section>
  );
}
