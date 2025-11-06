"use client";

import { useQuery } from "@/hooks/useQuery";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext } from "react";

interface QueryContextProps {
  search: string;
  setSearch: (string: string) => void;
  query: any[];
  setIsLoading: (loading: boolean) => void;
  setQuery: (query: any[]) => void;
  isLoading: boolean;
  lastSuccessfulSearch: string;
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
    setIsLoading,
    setQuery,
    isLoading,
    lastSuccessfulSearch,
  } = useQuery();

  const router = useRouter();

  return (
    <queryContext.Provider
      value={{
        search,
        setSearch,
        query,
        setIsLoading,
        setQuery,
        isLoading,
        lastSuccessfulSearch,
      }}
    >
      <div
        className="py-2 px-4 flex items-center gap-1.5 group cursor-pointer mt-0.25
                   
                   rounded-lg transition-all duration-200"
        onClick={() => router.replace("/")}
      >
        <Home
          className="text-neutral-400 dark:text-neutral-500 
                     group-hover:text-neutral-700 dark:group-hover:text-neutral-300 
                     transition-colors duration-200"
          height={18}
          width={18}
        />
        <p
          className="text-neutral-400 dark:text-neutral-500 text-[14px] 
                     group-hover:text-neutral-700 dark:group-hover:text-neutral-300 
                     transition-colors duration-200 mt-0.5"
        >
          Home
        </p>
      </div>
      <div
        className={`${
          isLoading ? "overflow-hidden" : "overflow-y-auto"
        } max-h-[calc(100vh-80px)] relative
           scrollbar-thin scrollbar-track-transparent
           scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300
           dark:scrollbar-thumb-neutral-800 dark:hover:scrollbar-thumb-neutral-700
           transition-colors duration-200`}
      >
        {children}
      </div>
    </queryContext.Provider>
  );
}
