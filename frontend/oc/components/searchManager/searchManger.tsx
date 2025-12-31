"use client";

import { useQuery } from "@/hooks/useQuery";
import { createContext } from "react";
import { SearchContextProps } from "@/types/search";

export const queryContext = createContext<SearchContextProps | undefined>(
  undefined
);

export default function SearchManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    result,
    search,
    setSearch,
    fileMapping,
    setFileMapping,
    setIsLoading,
    setQuery,
    isLoading,
    lastSuccessfulSearch,
  } = useQuery();

  return (
    <queryContext.Provider
      value={{
        result,
        search,
        setSearch,
        fileMapping,
        setFileMapping,
        setIsLoading,
        setQuery,
        isLoading,
        lastSuccessfulSearch,
      }}
    >
      <div
        className={`${
          isLoading ? "overflow-hidden" : "overflow-y-auto"
        } h-full relative
          scrollbar-thin scrollbar-track-transparent
          scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300
          dark:scrollbar-thumb-neutral-800 dark:hover:scrollbar-thumb-neutral-700
          transition-colors duration-200 md:rounded-[10px]`}
      >
        {children}
      </div>
    </queryContext.Provider>
  );
}
