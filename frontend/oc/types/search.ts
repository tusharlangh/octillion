export interface SearchRect {
  x: number;
  y: number;
  width: number;
  height: number;
  base: string;
  surface: string;
}

export interface TextSpan {
  span_text_id: number;
  span: string;
  span_bbox: any;
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

export interface TermBreakdown {
  count: number;
  score: number;
  rects: SearchRect[];
  text_spans: TextSpan[];
}

export interface ResultMetadata {
  terms?: string[];
  match_count?: number;
  term_breakdown?: Record<string, TermBreakdown>;
}

export interface HybridSearchResult {
  chunk_id: number;
  file_name: string;
  page_number: number;
  score: number;
  source: string;
  text: string;
  rects: SearchRect[];
  rank: number;
  metadata: {
    intent_boost?: number;
    density_boost?: number;
    best_sentence?: string;
    texts_span?: TextSpan[];
    terms?: string[];
    match_count?: number;
    term_breakdown?: Record<string, TermBreakdown>;
    keyword_rank?: number | null;
    semantic_rank?: number | null;
  };
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
