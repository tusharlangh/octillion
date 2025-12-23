"use client";

import { useQuery } from "@/hooks/useQuery";
import { createContext } from "react";

interface QueryContextProps {
  search: string;
  setSearch: (string: string) => void;
  query: any[];
  termStats: any;
  setTermStats: (stats: any) => void;
  fileMapping: Record<string, string>;
  setFileMapping: (mapping: Record<string, string>) => void;
  setIsLoading: (loading: boolean) => void;
  setQuery: (query: any[], termStats?: any, fileMapping?: any) => void;
  isLoading: boolean;
  lastSuccessfulSearch: string;
  lastSearchType: string;
  setLastSearchType: (type: string) => void;
}

export const queryContext = createContext<QueryContextProps | undefined>(
  undefined
);

export default function SearchManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    search,
    setSearch,
    query,
    termStats,
    setTermStats,
    fileMapping,
    setFileMapping,
    setIsLoading,
    setQuery,
    isLoading,
    lastSuccessfulSearch,
    lastSearchType,
    setLastSearchType,
  } = useQuery();

  return (
    <queryContext.Provider
      value={{
        search,
        setSearch,
        query,
        termStats,
        setTermStats,
        fileMapping,
        setFileMapping,
        setIsLoading,
        setQuery,
        isLoading,
        lastSuccessfulSearch,
        lastSearchType,
        setLastSearchType,
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
