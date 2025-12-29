"use client";

import { useContext, useState, useEffect } from "react";
import { queryContext } from "./searchManger";
import SearchLoading from "../animations/searchLoading";
import { FileText, CornerDownLeft, CornerDownRight } from "lucide-react";
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

  {
    /*
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


   */
  }

  if (isLoading) return <SearchLoading />;

  return (
    <div className="relative h-full px-4 md:px-12 pt-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <p
          className={`${dmSans.className} text-neutral-500 font-medium text-base tracking-wide`}
        >
          Best matches
        </p>
      </div>
      <div className="flex flex-col gap-1">
        {Object.keys(result).map((fileName, index) => (
          <div
            className="group flex items-center justify-between px-4 py-4 -mx-3 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
            key={index}
          >
            <div className="">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 transition-colors">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <p
                    className={`${dmSans.className} flex items-center text-neutral-800 dark:text-neutral-200 font-medium text-base truncate`}
                  >
                    {fileName}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 ml-2 text-neutral-500 mt-1">
                {result[fileName].result.map((item, i) => (
                  <div className="flex gap-2 items-center" key={i}>
                    <CornerDownRight size={16} />

                    <p
                      className={`${dmSans.className} dark:text-neutral-200 font-normal text-base truncate`}
                    >
                      <span
                        className="hover:underline"
                        onClick={() =>
                          handleOpenViewer(
                            fileName,
                            item.page.slice(1) - 1,
                            item.rects
                          )
                        }
                      >
                        Page {item.page.slice(1)}
                      </span>
                    </p>
                    <span
                      className={`${dmSans.className} bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors`}
                    >
                      {item.query}
                    </span>
                    <span
                      className={`${dmSans.className} bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors`}
                    >
                      {item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-4 text-neutral-400 text-sm">
              {index / Object.keys(result).length < 0.33 && (
                <span
                  className={`${dmSans.className} bg-[rgb(59,117,198)] px-1.5 py-0.5 rounded text-white`}
                >
                  High relevancy
                </span>
              )}

              <span
                className={`${dmSans.className} bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors`}
              >
                {result[fileName].result.reduce(
                  (sum, item) => sum + item.total,
                  0
                )}{" "}
                matches
              </span>
              <div className="hidden group-hover:block">
                <CornerDownLeft size={16} />
              </div>
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
