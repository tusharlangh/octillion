import { useState } from "react";

export function useQuery() {
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    search,
    setSearch,
    query,
    setQuery,
    isLoading,
    setIsLoading,
  };
}
