// types/search.ts
export interface SearchRect {
  x: number;
  y: number;
  width: number;
  height: number;
  base: string;
  surface: string;
}

export interface HybridSearchResult {
  chunk_id: number;
  chunk_index: number;
  file_name: string;
  page_number: number;
  
  // RRF fusion
  rrf_score: number;
  source: 'keyword' | 'semantic' | 'both';
  
  // Keyword data
  keyword_rank: number | null;
  keyword_score: number | null;
  keyword_weight?: number;
  match_count?: number;
  rects?: SearchRect[];
  
  // Semantic data
  semantic_rank: number | null;
  semantic_score: number | null;
  semantic_weight?: number;
  text?: string;
}

export interface SearchContextProps {
  result: HybridSearchResult[];
  search: string;
  setSearch: (search: string) => void;
  fileMapping: Record<string, string>;
  setFileMapping: (mapping: Record<string, string>) => void;
  setIsLoading: (loading: boolean) => void;
  setQuery: (result?: HybridSearchResult[], fileMapping?: Record<string, string>) => void;
  isLoading: boolean;
  lastSuccessfulSearch: string;
}
