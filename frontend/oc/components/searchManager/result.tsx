"use client";

import { useContext, useState, useEffect } from "react";
import { queryContext } from "./searchManger";
import SearchLoading from "../animations/searchLoading";
import { File, LayoutGrid, List } from "lucide-react";
import { DM_Sans } from "next/font/google";
import SmartPDFViewer from "../fileManager/SmartPDFViewer";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

type ViewerState = {
  isOpen: boolean;
  url: string;
  fileName: string;
  highlights: Record<number, { x: number; y: number; width: number; height: number }[]>;
  initialPage: number;
};

export default function Result() {
  const context = useContext(queryContext);
  if (!context) throw new Error("queryContext not found");

  const { isLoading, query, termStats, fileMapping, lastSuccessfulSearch } =
    context;

  const [viewMode, setViewMode] = useState<"list" | "stats">("stats");
  const [viewerState, setViewerState] = useState<ViewerState>({
    isOpen: false,
    url: "",
    fileName: "",
    highlights: {},
    initialPage: 0,
  });

  useEffect(() => {
    if (query.length > 0) setViewMode("list");
    else if (Object.keys(termStats || {}).length > 0) setViewMode("stats");
  }, [query, termStats]);

  const handleOpenViewer = (
    fileName: string,
    initialPage: number,
    rects: { x: number; y: number; width: number; height: number }[]
  ) => {
    const url = fileMapping[fileName];
    if (!url) {
      console.warn("Missing presigned URL for", fileName);
      return;
    }

    // Only highlight the specific match selected by the user
    // per user request: "whatever word the user select should be the only one hihglighted"
    const fileHighlights: Record<number, { x: number; y: number; width: number; height: number }[]> = {
      [initialPage]: rects
    };

    setViewerState({
      isOpen: true,
      url,
      fileName,
      highlights: fileHighlights,
      initialPage: initialPage, // 0-indexed page
    });
  };

  if (isLoading) return <SearchLoading />;

  if (
    lastSuccessfulSearch.trim() === "" &&
    query.length === 0 &&
    Object.keys(termStats || {}).length === 0
  ) {
    return (
      <div className="pt-2 px-4 md:px-13 flex flex-col items-center justify-center h-[60vh] gap-5">
        <p className={`${dmSans.className} text-8xl`}>(◠‿◠)</p>
        <p className={`${dmSans.className} text-2xl`}>Start your search</p>
      </div>
    );
  }

  if (
    lastSuccessfulSearch.trim() !== "" &&
    query.length === 0 &&
    Object.keys(termStats || {}).length === 0
  ) {
    return (
      <div className="pt-2 px-4 md:px-13 flex flex-col items-center justify-center h-[60vh] gap-5">
        <p className={`${dmSans.className} text-8xl`}>(^_^)</p>
        <p className={`${dmSans.className} text-2xl`}>
          No results found for "{lastSuccessfulSearch}"
        </p>
      </div>
    );
  }

  const hasStats = Object.keys(termStats || {}).length > 0;

  return (
    <div className="relative h-full">
      {/* Header */}
      <div className="pt-2 px-4 md:px-13 flex items-center justify-between pb-6">
        <div>
          <h2 className={`${dmSans.className} text-lg font-semibold`}>
            Search Results
          </h2>
          <p className="text-sm text-neutral-500">
            {hasStats ? `${Object.keys(termStats).length} terms found` : ""}
          </p>
        </div>
        {hasStats && (
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("stats")}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                viewMode === "stats" ? "bg-white shadow" : ""
              }`}
            >
              <LayoutGrid size={16} /> Insights
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                viewMode === "list" ? "bg-white shadow" : ""
              }`}
            >
              <List size={16} /> List
            </button>
          </div>
        )}
      </div>

      {/* Stats View */}
      {viewMode === "stats" && hasStats && (
        <div className="space-y-4 pb-16">
          {Object.entries(termStats).map(([term, entries]: [string, any]) => (
            <div
              key={term}
              className="border rounded-2xl p-4 hover:bg-neutral-100 transition"
            >
              <p className="font-semibold text-lg">{term}</p>
              {entries.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="ml-4 mt-2 cursor-pointer border-l-2 border-neutral-300 pl-3"
                  onClick={() =>
                    handleOpenViewer(entry.file_name, entry.page, entry.rects)
                  }
                >
                  <p className="text-sm">{entry.file_name}</p>
                  <p className="text-xs text-neutral-500">
                    Page {entry.page + 1}, {entry.total} matches
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && hasStats && (
        <div className="space-y-4 pb-16">
          {Object.entries(termStats).map(([term, entries]: [string, any]) =>
            entries.map((entry: any, i: number) => (
              <div
                key={`${term}-${i}`}
                onClick={() =>
                  handleOpenViewer(entry.file_name, entry.page, entry.rects)
                }
                className="cursor-pointer border rounded-2xl p-6 hover:bg-neutral-100 transition"
              >
                <p className="text-lg font-medium">{term}</p>
                <div className="flex gap-3 text-sm text-neutral-600 mt-2">
                  <span className="flex items-center gap-1">
                    <File size={14} />
                    {entry.file_name}
                  </span>
                  <span>Page {entry.page + 1}</span>
                  <span>{entry.total} matches</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PDF Viewer */}
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
