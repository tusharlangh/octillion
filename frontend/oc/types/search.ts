// types/search.ts
export interface SearchRect {
  x: number;
  y: number;
  width: number;
  height: number;
  base: string;
  surface: string;
}

export interface PreciseHighlights {
  text: string;
  startChar: number;
  endChar: number;
  score: number;
  method: string;
  confidence: string;
  boundingBoxes: any[];
}

export interface HybridSearchResult {
  chunk_id: number;
  chunk_index: number;
  file_name: string;
  page_number: number;
  rrf_score: number;
  source: "keyword" | "semantic" | "both";
  keyword_rank: number | null;
  keyword_score: number | null;
  keyword_weight?: number;
  match_count?: number;
  rects?: SearchRect[];
  semantic_rank: number | null;
  semantic_score: number | null;
  semantic_weight?: number;
  text?: string;
  preciseHighlight: PreciseHighlights;
}

export interface SearchContextProps {
  result: HybridSearchResult[];
  search: string;
  setSearch: (search: string) => void;
  fileMapping: Record<string, string>;
  setFileMapping: (mapping: Record<string, string>) => void;
  setIsLoading: (loading: boolean) => void;
  setQuery: (
    result?: HybridSearchResult[],
    fileMapping?: Record<string, string>
  ) => void;
  isLoading: boolean;
  lastSuccessfulSearch: string;
}
