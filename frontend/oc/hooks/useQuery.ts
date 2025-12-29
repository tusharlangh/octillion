useQuery;
import { useState } from "react";

export function useQuery() {
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<any[]>([]);
  const [result, setResult] = useState<
    Record<string, { result: any[]; score: number }>
  >({});
  const [termStats, setTermStats] = useState<any>({});
  const [fileMapping, setFileMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState<string>("");
  const [lastSearchType, setLastSearchType] = useState<string>("keyword");

  const updateQueryResults = (newResult?: any, newFileMapping?: any) => {
    if (newResult) setResult(newResult);
    if (newFileMapping) setFileMapping(newFileMapping);
    setLastSuccessfulSearch(search);
  };

  return {
    result,
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
