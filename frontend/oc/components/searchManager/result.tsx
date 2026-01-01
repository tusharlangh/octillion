"use client";

import { useContext, useEffect, useState } from "react";
import { queryContext } from "./searchManger";
import SearchLoading from "../animations/searchLoading";
import { ChevronDown, FileText, Hash, Sparkle, Sparkles } from "lucide-react";
import { DM_Sans } from "next/font/google";
import SmartPDFViewer from "../fileManager/SmartPDFViewer";
import { HybridSearchResult } from "@/types/search";
import { ResultBadges } from "./ResultBadges";
import { ResultPreview } from "./ResultPreview";
import ReactMarkdown from "react-markdown";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";
import { SidebarContext } from "../ConditionalLayout";
import { useRouter } from "next/navigation";
import SurfingLoading from "../animations/surfingLoading";

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
  const router = useRouter();

  const context = useContext(queryContext);
  if (!context) throw new Error("queryContext not found");

  const sidebarContext = useContext(SidebarContext);
  if (!sidebarContext) throw new Error("sidebarContext is not working");

  const { setNotis } = sidebarContext;
  const { search, isLoading, fileMapping, lastSuccessfulSearch, result } =
    context;

  const [viewerState, setViewerState] = useState<ViewerState>({
    isOpen: false,
    url: "",
    fileName: "",
    highlights: {},
    initialPage: 0,
  });

  const [overview, setOverview] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(false);

  useEffect(() => {
    async function GET() {
      setOverviewLoading(true);
      setOverview("");
      const hybridSearchResults = result.filter(
        (item) => item.source === "semantic" || item.source === "both"
      );

      if (hybridSearchResults.length === 0) {
        setOverviewLoading(false);
        setOverview("NA");
        return;
      }
      try {
        const jwt = await handleTokenAction();
        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-ai-overview`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              hybridSearchResults: hybridSearchResults,
              search: search,
            }),
          }
        );

        const data = await res.json();
        setOverview(data.response);

        console.log(data.response);

        if (!res.ok) {
          const errorMessage =
            data.error?.message ||
            data.error ||
            getErrorMessageByStatus(res.status);

          console.error("Fetch ai overview failed:", {
            status: res.status,
            error: errorMessage,
            details: data.error?.details,
          });

          setNotis({ message: errorMessage, type: "error" });

          if (res.status === 401 || res.status === 403) {
            setTimeout(() => router.replace("/login"), 2000);
          }

          return;
        }
      } catch (error) {
        console.error("ai overview error: ", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
          setNotis({
            message: "Network error. Please check your connection.",
            type: "error",
          });
        } else if (error instanceof Error && error.message.includes("token")) {
          setNotis({
            message: "Authentication failed. Please log in again.",
            type: "error",
          });
          setTimeout(() => router.replace("/login"), 2000);
        } else {
          setNotis({
            message: "An unexpected error occurred. Please try again.",
            type: "error",
          });
        }
      } finally {
        setOverviewLoading(false);
      }
    }

    if (result.length !== 0) {
      GET();
    }
  }, [result]);

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
        <div className="pt-2 px-4 md:px-13 flex flex-col items-center justify-center gap-5 h-[60vh] animate-[fadeIn_0.5s_ease-out]">
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
        <div className="pt-2 px-4 md:px-13 flex flex-col items-center justify-center gap-5 h-[60vh] animate-[fadeIn_0.5s_ease-out]">
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

  return (
    <div className="relative h-full px-4 md:px-12 pt-8 max-w-5xl mx-auto">
      <div
        className="flex flex-col px-2 py-8 gap-6
                   animate-[fadeIn_0.5s_ease-out]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg animate-[pulse_3s_ease-in-out_infinite]">
              <Sparkle size={16} className="text-blue-500" strokeWidth={2.5} />
            </div>
            <p
              className={`${dmSans.className} text-neutral-900 dark:text-neutral-100 
              font-semibold text-[15px] tracking-tight`}
            >
              AI Overview
            </p>
          </div>
        </div>

        {overviewLoading && <SurfingLoading />}

        <div
          className={`flex flex-wrap items-baseline gap-x-1 leading-relaxed
                     transition-all duration-300 ease-out overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60 pb-6`}
        >
          {overview.split(/(\[\d+\])/g).map((text, idx) => {
            if (text.startsWith("[") && text.endsWith("]")) {
              const chunk_idx = Number(text.slice(1, -1)) - 1;

              return (
                <button
                  key={idx}
                  onClick={() => handleOpenViewer(result[chunk_idx])}
                  className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 
                     text-[11px] font-medium text-blue-600 dark:text-blue-400 
                     hover:text-blue-700 dark:hover:text-blue-300
                     bg-blue-50/50 dark:bg-blue-500/10 
                     hover:bg-blue-100/80 dark:hover:bg-blue-500/20
                     rounded border border-blue-200/50 dark:border-blue-500/20
                     transition-all duration-200 ease-out
                     hover:scale-110 active:scale-95
                     hover:shadow-sm"
                >
                  {chunk_idx + 1}
                </button>
              );
            }

            return (
              <span
                key={idx}
                className={`${dmSans.className} text-neutral-700 dark:text-neutral-300 
                  font-normal text-[15px] leading-[1.7]`}
              >
                <ReactMarkdown>{text}</ReactMarkdown>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {result.map((item, index) => (
          <div
            className="group flex flex-col px-4 py-4 -mx-3 rounded-lg cursor-pointer 
              hover:bg-neutral-100 dark:hover:bg-neutral-800 
              transition-all duration-200 border border-transparent
              hover:border-neutral-200 dark:hover:border-neutral-700
              hover:shadow-sm
              animate-[fadeInUp_0.4s_ease-out]"
            style={{ animationDelay: `${index * 50}ms` }}
            key={`${item.chunk_id}-${index}`}
            onClick={() => handleOpenViewer(item)}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <div
                  className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 
                  dark:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors duration-200"
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
