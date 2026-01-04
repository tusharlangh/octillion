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
    console.log(item);

    const rects = item.preciseHighlight.boundingBoxes;

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
    <div className="relative h-full pt-12 pb-24">
      <div className="mx-auto max-w-[680px] px-6 pb-50">
        {overview !== "NA" && (
          <article className="mb-16 animate-[fadeIn_0.6s_ease-out]">
            <div className="mb-2 flex items-center gap-2">
              <Sparkle
                size={14}
                className="text-black dark:text-white"
                strokeWidth={1.5}
              />
              <span
                className={`${dmSans.className} text-[15px] font-normal tracking-wide 
                text-black dark:text-white`}
              >
                Overview
              </span>
            </div>

            {overviewLoading && <SurfingLoading />}

            <div
              className={`${dmSans.className} text-[17px] leading-[1.75] 
              text-neutral-800 dark:text-neutral-200 font-light
              mb-12`}
            >
              {overview.split(/(\[\d+\])/g).map((text, idx) => {
                if (text.startsWith("[") && text.endsWith("]")) {
                  const chunk_idx = Number(text.slice(1, -1)) - 1;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOpenViewer(result[chunk_idx])}
                      className="inline-flex items-center align-baseline mx-[2px] px-[5px] py-[1px]
                      text-[11px] font-normal tabular-nums
                      text-black dark:text-white
                      border-b border-black dark:border-white
                      hover:text-black/50 dark:hover:text-white/80
                      hover:border-black/50 dark:hover:border-white/80
                      transition-all duration-150"
                    >
                      {chunk_idx + 1}
                    </button>
                  );
                }

                return (
                  <ReactMarkdown
                    key={idx}
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                );
              })}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
          </article>
        )}

        <section className="space-y-12">
          {result.map((item, index) => (
            <article
              key={`${item.chunk_id}-${index}`}
              onClick={() => handleOpenViewer(item)}
              className="group cursor-pointer
              opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className="mb-3 flex items-center gap-3 flex-wrap
                transition-opacity duration-300"
              >
                <span
                  className={`${dmSans.className} text-[15px] font-medium
                  text-black dark:text-white`}
                >
                  {item.file_name}
                </span>
                <span className="text-black dark:text-white">·</span>
                <span
                  className={`${dmSans.className} text-[14px] font-normal
                  text-black dark:text-white`}
                >
                  Page {item.page_number}
                </span>

                <ResultBadges item={item} totalResults={result.length} />
              </div>

              <div className="mb-4">
                <ResultPreview item={item} />
              </div>

              <div
                className="flex items-center gap-4 text-[12px]
                text-neutral-400 dark:text-neutral-600
                opacity-0 group-hover:opacity-100
                transition-all duration-300
                translate-y-[-4px] group-hover:translate-y-0"
              >
                {item.keyword_rank !== null && (
                  <span className={`${dmSans.className} font-normal`}>
                    Keyword #{item.keyword_rank + 1}
                  </span>
                )}
                {item.semantic_rank !== null && (
                  <>
                    {item.keyword_rank !== null && (
                      <span className="opacity-40">·</span>
                    )}
                    <span className={`${dmSans.className} font-normal`}>
                      Semantic #{item.semantic_rank + 1}
                    </span>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
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
