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
  highlights: Record<
    number,
    { x: number; y: number; width: number; height: number }[]
  >;
  initialPage: number;
};

export default function Result() {
  const context = useContext(queryContext);
  if (!context) throw new Error("queryContext not found");

  const {
    isLoading,
    query,
    termStats,
    fileMapping,
    lastSuccessfulSearch,
    result,
  } = context;

  const [viewerState, setViewerState] = useState<ViewerState>({
    isOpen: false,
    url: "",
    fileName: "",
    highlights: {},
    initialPage: 0,
  });
  useEffect(() => {
    console.log(result);
  });

  const handleOpenViewer = (
    fileName: string,
    initialPage: number,
    rects: { x: number; y: number; width: number; height: number }[]
  ) => {
    console.log("this is the result: ", result);
    const url = fileMapping[fileName];
    if (!url) {
      console.warn("Missing presigned URL for", fileName);
      return;
    }

    const fileHighlights: Record<
      number,
      { x: number; y: number; width: number; height: number }[]
    > = {
      [initialPage]: rects,
    };

    setViewerState({
      isOpen: true,
      url,
      fileName,
      highlights: fileHighlights,
      initialPage: initialPage,
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
    result.length === 0 &&
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

  return (
    <div className="relative h-full">
      <div>
        {result.map((item, index) => (
          <div
            key={item.page}
            onClick={() =>
              handleOpenViewer(
                item.file_name,
                Number(item.page.slice(1)) - 1,
                item.rects
              )
            }
          >
            {item.page}
            {item.query}
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
