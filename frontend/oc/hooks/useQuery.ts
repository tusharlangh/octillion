import { useState } from "react";
import { HybridSearchResult } from "@/types/search";

export function useQuery() {
  const [search, setSearch] = useState<string>("");
  const [result, setResult] = useState<HybridSearchResult[]>([]);
  const [fileMapping, setFileMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSuccessfulSearch, setLastSuccessfulSearch] = useState<string>("");

  const updateQueryResults = (
    newResult?: HybridSearchResult[],
    newFileMapping?: Record<string, string>
  ) => {
    if (newResult) setResult(newResult);
    if (newFileMapping) setFileMapping(newFileMapping);
    setLastSuccessfulSearch(search);
  };

  return {
    result,
    search,
    setSearch,
    fileMapping,
    setFileMapping,
    setQuery: updateQueryResults,
    isLoading,
    setIsLoading,
    lastSuccessfulSearch,
  };
}
