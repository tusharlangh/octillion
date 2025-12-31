"use client";

import { useContext, useState } from "react";
import { queryContext } from "./searchManger";
import SearchLoading from "../animations/searchLoading";
import { FileText, Hash, Sparkles } from "lucide-react";
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

    const rects =
      item.rects?.map((r) => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      })) || [];

    const fileHighlights: Record<
      number,
      { x: number; y: number; width: number; height: number }[]
    > =
      rects.length > 0
        ? {
            [item.page_number - 1]: rects,
          }
        : {};

    setViewerState({
      isOpen: true,
      url,
      fileName: item.file_name,
      highlights: fileHighlights,
      initialPage: item.page_number - 1,
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

  const stats = {
    total: result.length,
    both: result.filter((r) => r.source === "both").length,
    semantic: result.filter((r) => r.source === "semantic").length,
    keyword: result.filter((r) => r.source === "keyword").length,
  };

  return (
    <div className="relative h-full px-4 md:px-12 pt-8 max-w-5xl mx-auto">
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <p
            className={`${dmSans.className} text-neutral-500 font-medium text-base tracking-wide`}
          >
            Best matches
          </p>
          <p className={`${dmSans.className} text-neutral-400 text-sm`}>
            {stats.total} {stats.total === 1 ? "result" : "results"}
          </p>
        </div>

        {stats.total > 0 && (
          <div className="flex items-center gap-3 text-xs">
            {stats.both > 0 && (
              <span
                className={`${dmSans.className} text-emerald-600 dark:text-emerald-400`}
              >
                {stats.both} found by both
              </span>
            )}
            {stats.semantic > 0 && (
              <span
                className={`${dmSans.className} text-blue-600 dark:text-blue-400`}
              >
                {stats.semantic} semantic only
              </span>
            )}
            {stats.keyword > 0 && (
              <span
                className={`${dmSans.className} text-purple-600 dark:text-purple-400`}
              >
                {stats.keyword} keyword only
              </span>
            )}
          </div>
        )}
      </div>

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
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <div
                  className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 
                  dark:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors"
                >
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

            <ResultPreview item={item} />

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
