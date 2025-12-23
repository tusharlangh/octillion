"use client";

import { useContext, useState, useEffect } from "react";
import { queryContext } from "./searchManger";
import SearchLoading from "../animations/searchLoading";
import { File, LayoutGrid, List } from "lucide-react";
import { DM_Sans } from "next/font/google";
import TermStatsResults from "./termStatsResults";
import SmartPDFViewer from "../fileManager/SmartPDFViewer";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Result() {
  const context = useContext(queryContext);
  const [viewMode, setViewMode] = useState<"list" | "stats">("stats");
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
    highlights: any[];
    initialPage: string;
  }>({
    isOpen: false,
    url: "",
    fileName: "",
    highlights: [],
    initialPage: "1.1",
  });

  if (!context) throw new Error("queryContext is not working");

  const {
    isLoading,
    query,
    termStats,
    fileMapping,
    lastSuccessfulSearch,
    lastSearchType,
  } = context;

  useEffect(() => {
    // Determine default view mode based on search results
    if (Object.keys(termStats || {}).length > 0 && query.length === 0) {
      setViewMode("stats");
    } else if (query.length > 0) {
      setViewMode("list");
    }
  }, [query, termStats]);

  const handlePageClick = (fileName: string, pageNo: string, coords: any[]) => {
    const url = fileMapping[fileName];
    if (!url) {
      console.warn("URL not found for file:", fileName);
      return;
    }

    setViewerState({
      isOpen: true,
      url,
      fileName,
      highlights: coords,
      initialPage: `1.${pageNo}`,
    });
  };

  const handleResultClick = (result: any) => {
    const url = fileMapping[result.file_name];
    if (!url) {
      console.warn("URL not found for file:", result.file_name);
      return;
    }

    const pageNo = result.pageId.split(".")[1];

    const highlights = result.coords || [
      {
        x: 0,
        y: result.startY || 0,
        width: 600,
        height: result.endY - result.startY || 20,
      },
    ];

    setViewerState({
      isOpen: true,
      url,
      fileName: result.file_name,
      highlights,
      initialPage: `1.${pageNo}`,
    });
  };

  function renderSentence(sentence: string) {
    const s: string = sentence;
    const search: string = lastSuccessfulSearch.toLowerCase();
    let keyCounter = 0;
    let seen: number[][] = [];

    for (let word of search.split(" ")) {
      if (!word) continue;
      let pos = 0;
      while ((pos = s.toLowerCase().indexOf(word, pos)) !== -1) {
        seen.push([pos, pos + word.length - 1]);
        pos += 1;
      }
    }
    seen.sort((a, b) => a[0] - b[0]);

    const arr: any[] = new Array(s.length).fill(null);
    let range_i = 0;

    for (let i = 0; i < s.length; i++) {
      while (range_i < seen.length - 1 && i > seen[range_i][1]) {
        range_i++;
      }

      if (
        range_i < seen.length &&
        i >= seen[range_i][0] &&
        i <= seen[range_i][1]
      ) {
        arr[i] = (
          <span
            key={keyCounter++}
            className="bg-amber-100 text-amber-900 
                     dark:bg-blue-400/10 dark:text-blue-300 
                     py-[2px] font-medium transition-colors duration-200"
          >
            {s[i]}
          </span>
        );
      } else {
        arr[i] = (
          <span
            key={keyCounter++}
            className="text-neutral-800 dark:text-neutral-200 transition-colors duration-200"
          >
            {s[i]}
          </span>
        );
      }
    }

    return arr;
  }

  if (
    lastSuccessfulSearch.trim() === "" &&
    query.length === 0 &&
    Object.keys(termStats || {}).length === 0
  ) {
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

  if (
    lastSuccessfulSearch.trim() !== "" &&
    query.length === 0 &&
    Object.keys(termStats || {}).length === 0 &&
    !isLoading
  ) {
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

  if (isLoading) {
    return <SearchLoading />;
  }

  const hasStats = Object.keys(termStats || {}).length > 0;
  const hasQuery = query.length > 0;

  return (
    <div className="relative h-full">
      <div className="pt-2 px-4 md:px-13">
        <div className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2
                className={`${dmSans.className} text-lg font-semibold text-neutral-900 dark:text-neutral-100`}
              >
                Search Results
              </h2>
              <p className={`${dmSans.className} text-sm text-neutral-500`}>
                {hasQuery
                  ? `${query.length} matches found`
                  : hasStats
                  ? `${Object.keys(termStats).length} terms discovered`
                  : ""}
              </p>
            </div>

            {hasStats && hasQuery && (
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("stats")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "stats"
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                  }`}
                >
                  <LayoutGrid size={16} />
                  Insights
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                  }`}
                >
                  <List size={16} />
                  List
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pb-16">
          {viewMode === "stats" && hasStats ? (
            <TermStatsResults
              termStats={termStats}
              onPageClick={handlePageClick}
            />
          ) : (
            <div className="space-y-4">
              {query.map((result, i) => (
                <div
                  key={i}
                  onClick={() => handleResultClick(result)}
                  className="group backdrop-blur-xl 
                           border border-neutral-200 dark:border-neutral-800
                           bg-white/50 dark:bg-neutral-900/50
                           rounded-[20px] p-6 sm:p-8
                           hover:bg-neutral-100 dark:hover:bg-neutral-800/50
                           hover:shadow-xs
                           transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    <p
                      className={`${dmSans.className} text-[16px] md:text-[18px] leading-[1.8] 
                                 font-light tracking-[-0.01em]
                                 text-neutral-800 dark:text-neutral-200
                                 transition-colors duration-200`}
                    >
                      {lastSearchType === "keyword"
                        ? renderSentence(result.sentence)
                        : result.sentence}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="inline-flex items-center gap-1.5 
                                     px-3 py-1 rounded-full
                                     bg-neutral-100 dark:bg-neutral-800
                                     text-neutral-600 dark:text-neutral-300
                                     font-medium tracking-wide"
                      >
                        <File
                          className="text-neutral-500 dark:text-neutral-400"
                          height={14}
                          width={14}
                        />
                        <span className="mt-0.5 truncate max-w-80">
                          {result.file_name}
                        </span>
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Page {result.pageId.split(".")[1]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewerState.isOpen && (
        <SmartPDFViewer
          url={viewerState.url}
          fileName={viewerState.fileName}
          highlights={viewerState.highlights}
          initialPage={viewerState.initialPage}
          onClose={() => setViewerState({ ...viewerState, isOpen: false })}
        />
      )}
    </div>
  );
}
