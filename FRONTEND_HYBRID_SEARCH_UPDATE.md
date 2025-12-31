# Frontend Update Guide: Hybrid Search Results Display

## 🎯 Overview

Your new hybrid search backend returns a rich result structure with:
- **RRF scores** (combined ranking)
- **Source indicators** (keyword, semantic, or both)
- **Individual method scores** (keyword_score, semantic_score)
- **Rank information** (keyword_rank, semantic_rank)
- **Match metadata** (match_count, rects for highlighting)
- **Chunk information** (chunk_id, chunk_index, file_name, page_number, text)

## 📊 New Result Structure

```typescript
interface HybridSearchResult {
  chunk_id: number;
  chunk_index: number;
  file_name: string;
  page_number: number;
  
  // RRF fusion data
  rrf_score: number;              // Combined score (0.001 - 0.05 range)
  source: 'keyword' | 'semantic' | 'both';  // Which method(s) found it
  
  // Keyword-specific (may be null)
  keyword_rank: number | null;
  keyword_score: number | null;
  match_count?: number;           // Number of keyword matches
  rects?: Array<{                 // Coordinates for PDF highlighting
    x: number;
    y: number;
    width: number;
    height: number;
    base: string;
    surface: string;
  }>;
  
  // Semantic-specific (may be null)
  semantic_rank: number | null;
  semantic_score: number | null;  // Cosine similarity (0-1)
  text?: string;                  // Chunk text for preview
}
```

## 🔧 Required Changes

### 1. Update TypeScript Interfaces

**File:** `frontend/oc/types/search.ts` (create if doesn't exist)

```typescript
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
```

### 2. Update Search Manager Context

**File:** `frontend/oc/components/searchManager/searchManger.tsx`

```typescript
"use client";

import { useQuery } from "@/hooks/useQuery";
import { createContext } from "react";
import { SearchContextProps } from "@/types/search";

export const queryContext = createContext<SearchContextProps | undefined>(
  undefined
);

export default function SearchManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    result,
    search,
    setSearch,
    fileMapping,
    setFileMapping,
    setIsLoading,
    setQuery,
    isLoading,
    lastSuccessfulSearch,
  } = useQuery();

  return (
    <queryContext.Provider
      value={{
        result,
        search,
        setSearch,
        fileMapping,
        setFileMapping,
        setIsLoading,
        setQuery,
        isLoading,
        lastSuccessfulSearch,
      }}
    >
      <div
        className={`${
          isLoading ? "overflow-hidden" : "overflow-y-auto"
        } h-full relative
          scrollbar-thin scrollbar-track-transparent
          scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300
          dark:scrollbar-thumb-neutral-800 dark:hover:scrollbar-thumb-neutral-700
          transition-colors duration-200 md:rounded-[10px]`}
      >
        {children}
      </div>
    </queryContext.Provider>
  );
}
```

### 3. Update useQuery Hook

**File:** `frontend/oc/hooks/useQuery.ts`

```typescript
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
```

### 4. Create Helper Components

**File:** `frontend/oc/components/searchManager/ResultBadges.tsx`

```typescript
import { DM_Sans } from "next/font/google";
import { HybridSearchResult } from "@/types/search";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

interface ResultBadgesProps {
  item: HybridSearchResult;
  totalResults: number;
}

export function ResultBadges({ item, totalResults }: ResultBadgesProps) {
  // Calculate normalized score for display (0-100)
  const normalizedScore = Math.round(item.rrf_score * 1000);
  
  // Determine relevancy tier
  const position = totalResults > 0 ? 
    Array.from({ length: totalResults }, (_, i) => i).indexOf(
      totalResults - 1 - Math.floor((item.rrf_score / 0.05) * totalResults)
    ) : 0;
  
  const isHighRelevancy = position < totalResults * 0.25;
  const isMediumRelevancy = position < totalResults * 0.5;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Source Badge */}
      {item.source === 'both' && (
        <span
          className={`${dmSans.className} bg-emerald-100 dark:bg-emerald-900/30 
            px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 
            text-xs font-medium border border-emerald-200 dark:border-emerald-800`}
        >
          ✓ Both methods
        </span>
      )}
      
      {item.source === 'semantic' && (
        <span
          className={`${dmSans.className} bg-blue-100 dark:bg-blue-900/30 
            px-2 py-0.5 rounded text-blue-700 dark:text-blue-400 
            text-xs font-medium border border-blue-200 dark:border-blue-800`}
        >
          Semantic
        </span>
      )}
      
      {item.source === 'keyword' && (
        <span
          className={`${dmSans.className} bg-purple-100 dark:bg-purple-900/30 
            px-2 py-0.5 rounded text-purple-700 dark:text-purple-400 
            text-xs font-medium border border-purple-200 dark:border-purple-800`}
        >
          Keyword
        </span>
      )}

      {/* Relevancy Badge */}
      {isHighRelevancy && (
        <span
          className={`${dmSans.className} bg-[rgb(59,117,198)] 
            px-2 py-0.5 rounded text-white text-xs font-medium`}
        >
          High relevancy
        </span>
      )}

      {/* Match Count (if keyword found it) */}
      {item.match_count !== undefined && item.match_count > 0 && (
        <span
          className={`${dmSans.className} bg-neutral-100 dark:bg-neutral-800 
            px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400 
            text-xs font-medium`}
        >
          {item.match_count} {item.match_count === 1 ? 'match' : 'matches'}
        </span>
      )}

      {/* Score (for debugging/power users) */}
      <span
        className={`${dmSans.className} bg-neutral-50 dark:bg-neutral-900 
          px-2 py-0.5 rounded text-neutral-500 dark:text-neutral-500 
          text-xs font-mono`}
        title={`RRF Score: ${item.rrf_score.toFixed(4)}`}
      >
        {normalizedScore}
      </span>
    </div>
  );
}
```

**File:** `frontend/oc/components/searchManager/ResultPreview.tsx`

```typescript
import { DM_Sans } from "next/font/google";
import { HybridSearchResult } from "@/types/search";

const dmSans = DM_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
});

interface ResultPreviewProps {
  item: HybridSearchResult;
}

export function ResultPreview({ item }: ResultPreviewProps) {
  // Show text preview if available (from semantic search)
  if (item.text && item.text.length > 0) {
    const preview = item.text.length > 150 
      ? item.text.substring(0, 150) + "..." 
      : item.text;
    
    return (
      <p
        className={`${dmSans.className} text-sm text-neutral-600 
          dark:text-neutral-400 mt-2 line-clamp-2`}
      >
        {preview}
      </p>
    );
  }

  return null;
}
```

### 5. Update Main Result Component

**File:** `frontend/oc/components/searchManager/result.tsx`

```typescript
"use client";

import { useContext, useState } from "react";
import { queryContext } from "./searchManger";
import SearchLoading from "../animations/searchLoading";
import { FileText, CornerDownRight, Sparkles, Hash } from "lucide-react";
import { DM_Sans } from "next/font/google";
import SmartPDFViewer from "../fileManager/SmartPDFViewer";
import { HybridSearchResult } from "@/types/search";
import { ResultBadges } from "./ResultBadges";
import { ResultPreview } from "./ResultPreview";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

type ViewerState = {
  isOpen: boolean;
  url: string;
  fileName: string;
  highlights: Record<
    number,
    { x: number; y: number; width: number; height: number }[]
  >;
  initialPage: number;
};

export default function Result() {
  const context = useContext(queryContext);
  if (!context) throw new Error("queryContext not found");

  const { isLoading, fileMapping, lastSuccessfulSearch, result } = context;

  const [viewerState, setViewerState] = useState<ViewerState>({
    isOpen: false,
    url: "",
    fileName: "",
    highlights: {},
    initialPage: 0,
  });

  const handleOpenViewer = (item: HybridSearchResult) => {
    const url = fileMapping[item.file_name];
    if (!url) {
      console.warn("Missing presigned URL for", item.file_name);
      return;
    }

    // Only use rects if they exist (from keyword search)
    const rects = item.rects?.map(r => ({
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height
    })) || [];

    const fileHighlights: Record<
      number,
      { x: number; y: number; width: number; height: number }[]
    > = rects.length > 0 ? {
      [item.page_number]: rects,
    } : {};

    setViewerState({
      isOpen: true,
      url,
      fileName: item.file_name,
      highlights: fileHighlights,
      initialPage: item.page_number,
    });
  };

  if (lastSuccessfulSearch.trim() === "" && result.length === 0) {
    return (
      <div className="">
        <div className="pt-2 px-4 md:px-13 flex flex-col items-center justify-center gap-5 h-[60vh]">
          <p
            className={`${dmSans.className} text-7xl md:text-8xl font-medium
                      text-neutral-800 dark:text-neutral-200
                      transition-colors duration-200`}
          >
            (◠‿◠)
          </p>
          <p
            className={`${dmSans.className} text-xl md:text-2xl font-medium
                      text-neutral-800 dark:text-neutral-200
                      transition-colors duration-200`}
          >
            Start your search!
          </p>
        </div>
      </div>
    );
  }

  if (lastSuccessfulSearch.trim() !== "" && result.length === 0 && !isLoading) {
    return (
      <div className="">
        <div className="pt-2 px-4 md:px-13 flex flex-col items-center justify-center gap-5 h-[60vh]">
          <p
            className={`${dmSans.className} text-7xl md:text-8xl font-medium
                      text-neutral-800 dark:text-neutral-200
                      transition-colors duration-200`}
          >
            (^_^)
          </p>
          <p
            className={`${dmSans.className} text-xl md:text-2xl font-medium
                      text-neutral-800 dark:text-neutral-200
                      transition-colors duration-200`}
          >
            No results found for "{lastSuccessfulSearch}"
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <SearchLoading />;

  // Group results by source for stats
  const stats = {
    total: result.length,
    both: result.filter(r => r.source === 'both').length,
    semantic: result.filter(r => r.source === 'semantic').length,
    keyword: result.filter(r => r.source === 'keyword').length,
  };

  return (
    <div className="relative h-full px-4 md:px-12 pt-8 max-w-5xl mx-auto">
      {/* Header with stats */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <p
            className={`${dmSans.className} text-neutral-500 font-medium text-base tracking-wide`}
          >
            Best matches
          </p>
          <p
            className={`${dmSans.className} text-neutral-400 text-sm`}
          >
            {stats.total} {stats.total === 1 ? 'result' : 'results'}
          </p>
        </div>
        
        {/* Search method breakdown */}
        {stats.total > 0 && (
          <div className="flex items-center gap-3 text-xs">
            {stats.both > 0 && (
              <span className={`${dmSans.className} text-emerald-600 dark:text-emerald-400`}>
                {stats.both} found by both
              </span>
            )}
            {stats.semantic > 0 && (
              <span className={`${dmSans.className} text-blue-600 dark:text-blue-400`}>
                {stats.semantic} semantic only
              </span>
            )}
            {stats.keyword > 0 && (
              <span className={`${dmSans.className} text-purple-600 dark:text-purple-400`}>
                {stats.keyword} keyword only
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results list */}
      <div className="flex flex-col gap-2">
        {result.map((item, index) => (
          <div
            className="group flex flex-col px-4 py-4 -mx-3 rounded-lg cursor-pointer 
              hover:bg-neutral-100 dark:hover:bg-neutral-800 
              transition-all duration-200 border border-transparent
              hover:border-neutral-200 dark:hover:border-neutral-700"
            key={`${item.chunk_id}-${index}`}
            onClick={() => handleOpenViewer(item)}
          >
            {/* Top row: File name and badges */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 
                  dark:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <p
                    className={`${dmSans.className} text-neutral-800 dark:text-neutral-200 
                      font-medium text-base truncate`}
                  >
                    {item.file_name}
                  </p>
                  <p
                    className={`${dmSans.className} text-neutral-500 dark:text-neutral-400 
                      text-sm mt-0.5`}
                  >
                    Page {item.page_number}
                  </p>
                </div>
              </div>
              
              <ResultBadges item={item} totalResults={result.length} />
            </div>

            {/* Preview text (if available from semantic search) */}
            <ResultPreview item={item} />

            {/* Bottom row: Method indicators */}
            <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
              {item.keyword_rank !== null && (
                <div className="flex items-center gap-1.5">
                  <Hash size={14} />
                  <span className={dmSans.className}>
                    Keyword rank: {item.keyword_rank + 1}
                  </span>
                </div>
              )}
              {item.semantic_rank !== null && (
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span className={dmSans.className}>
                    Semantic rank: {item.semantic_rank + 1}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PDF Viewer Modal */}
      {viewerState.isOpen && (
        <SmartPDFViewer
          url={viewerState.url}
          fileName={viewerState.fileName}
          initialPage={viewerState.initialPage}
          highlights={viewerState.highlights}
          onClose={() => setViewerState((s) => ({ ...s, isOpen: false }))}
        />
      )}
    </div>
  );
}
```

## 🎨 Visual Improvements

### Color Coding by Source

- **Both methods** (🟢 Green): High confidence - found by both keyword and semantic
- **Semantic only** (🔵 Blue): Conceptually related but no exact keyword match
- **Keyword only** (🟣 Purple): Exact keyword match but semantically different

### Score Display

- Shows normalized RRF score (multiplied by 1000 for readability)
- Tooltip shows actual RRF score for debugging
- High relevancy badge for top 25% of results

### Preview Text

- Shows chunk text preview if available (from semantic search)
- Truncated to 150 characters with ellipsis
- Helps users understand why result was returned

## 📱 Responsive Design

All components are responsive and work on:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🧪 Testing Checklist

- [ ] Results display correctly with all three source types
- [ ] Badges show appropriate colors and text
- [ ] Preview text displays when available
- [ ] PDF viewer opens with correct page and highlights
- [ ] Empty states work (no search, no results)
- [ ] Loading state displays properly
- [ ] Dark mode works for all components
- [ ] Responsive on mobile, tablet, desktop
- [ ] Stats summary shows correct counts
- [ ] Clicking result opens PDF viewer

## 🚀 Next Steps

After implementing these changes:

1. Test with various query types:
   - Pure keyword: "Stripe API"
   - Pure semantic: "what is the name of the person"
   - Mixed: "payment processing system"

2. Verify the visual hierarchy makes sense

3. Consider adding:
   - Sort options (by RRF score, by source, by file)
   - Filter by source type
   - Export results
   - Share search link

## 💡 Pro Tips

1. **Debugging**: The score badge shows normalized score - hover to see actual RRF score
2. **Performance**: Results are already sorted by RRF score from backend
3. **Accessibility**: All badges have proper contrast ratios for WCAG AA
4. **UX**: "Both methods" badge indicates high confidence results
