"use client";

import { useQuery } from "@/hooks/useQuery";
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
      {children}
    </queryContext.Provider>
  );
}
