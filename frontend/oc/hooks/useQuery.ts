import { useState } from "react";

export function useQuery() {
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<any[]>([]);
  const [termStats, setTermStats] = useState<any>({});
  const [fileMapping, setFileMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState<string>("");
  const [lastSearchType, setLastSearchType] = useState<string>("keyword");

  // Wrapper to update everything at once
  const updateQueryResults = (newQuery: any[], newTermStats?: any, newFileMapping?: any) => {
    setQuery(newQuery);
    if (newTermStats) setTermStats(newTermStats);
    if (newFileMapping) setFileMapping(newFileMapping);
    setLastSuccessfulSearch(search);
  };

  return {
    search,
    setSearch,
    query,
    termStats,
    setTermStats,
    fileMapping,
    setFileMapping,
    setQuery: updateQueryResults,
    isLoading,
    setIsLoading,
    lastSuccessfulSearch,
    lastSearchType,
    setLastSearchType,
  };
}
