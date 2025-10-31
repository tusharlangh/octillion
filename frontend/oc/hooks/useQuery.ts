import { useState } from "react";

export function useQuery() {
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState<string>("");

  // Wrapper to update both query and lastSuccessfulSearch
  const updateQueryResults = (newQuery: any[]) => {
    setQuery(newQuery);
    setLastSuccessfulSearch(search); // Store the search term that generated these results
  };

  return {
    search,
    setSearch,
    query,
    setQuery: updateQueryResults,
    isLoading,
    setIsLoading,
    lastSuccessfulSearch,
  };
}
