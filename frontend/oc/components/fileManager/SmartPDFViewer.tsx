"use client";

import React, { useEffect, useRef, useState } from "react";
import { DM_Sans } from "next/font/google";
import { ChevronLeft, Minus, Plus, X } from "lucide-react";
import SurfingLoading from "../animations/surfingLoading";
import { motion } from "framer-motion";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
  base?: string;
  surface?: string;
}

interface SmartPDFViewerProps {
  url: string;
  fileName: string;
  initialPage: number;
  highlights: Record<number, Highlight[]>;
  termColors?: Record<string, string>;
  isKeywordResult: boolean;
  onClose: () => void;
}

export default function SmartPDFViewer({
  url,
  fileName,
  initialPage,
  highlights,
  termColors = {},
  isKeywordResult,
  onClose,
}: SmartPDFViewerProps) {
  const getResponsiveScale = () => {
    const width = window.innerWidth;
    if (width < 640) return 1.2;
    if (width < 1024) return 1.4;
    if (width < 1440) return 1.6;
    return 1.8;
  };

  const [pdf, setPdf] = useState<any>(null);
  const [scale, setScale] = useState<number>(getResponsiveScale());
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isHighlightsPanelOpen, setIsHighlightsPanelOpen] =
    useState<boolean>(true);
  const [pageDimensions, setPageDimensions] = useState<Map<number, any>>(
    new Map(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const loadPdf = async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjs.getDocument(url);
      const loadedPdf = await loadingTask.promise;

      setPdf(loadedPdf);
    };
    loadPdf();
  }, [url]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newScale: number;
      if (width < 640) newScale = 1.2;
      else if (width < 1024) newScale = 1.4;
      else if (width < 1440) newScale = 1.6;
      else newScale = 1.8;

      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const pages = pageRefs.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page) continue;

        const pageRect = page.getBoundingClientRect();
        if (
          pageRect.top <= containerCenter &&
          pageRect.bottom >= containerCenter
        ) {
          setCurrentPage(i);
          break;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [pdf]);

  useEffect(() => {
    if (pdf && pageRefs.current[initialPage]) {
      setTimeout(() => {
        pageRefs.current[initialPage]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [pdf, initialPage]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#191919] z-50 flex flex-col">
      <div className="w-full relative overflow-visible">
        <div className="absolute top-0 z-10 left-0 right-0 mx-2 md:mx-4 px-4 md:px-8 h-14 flex justify-between items-center m-2 bg-white dark:bg-[rgb(32,32,32)] shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 min-w-0">
            <h2
              className={`${dmSans.className} text-sm md:text-md font-medium text-neutral-900 dark:text-neutral-100 truncate`}
            >
              {fileName}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`${dmSans.className} text-xs text-neutral-700 dark:text-neutral-300 rounded-lg cursor-pointer`}
            >
              <X className="text-neutral-500" size={20} />
            </button>
          </div>
        </div>

        {isKeywordResult && Object.keys(termColors).length > 0 && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: isHighlightsPanelOpen ? 0 : "calc(-100% + 40px)" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-[5.5rem] left-0 z-20 flex items-center"
          >
            <div className="pl-3 py-2 pr-2 bg-[rgb(247,247,247)] dark:bg-[rgb(32,32,32)] rounded-r-xl shadow-lg flex items-center gap-1.5">
              <div className="flex flex-col gap-1.5">
                {Object.keys(termColors).map((term, index) => (
                  <motion.div
                    key={term}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      style={{ backgroundColor: termColors[term] }}
                      className="p-1.5 rounded-full transition-transform hover:scale-110"
                    ></span>
                    <p
                      className={`${dmSans.className} rounded-md text-xs text-neutral-700 dark:text-neutral-300 whitespace-nowrap`}
                    >
                      {term}
                    </p>
                  </motion.div>
                ))}
              </div>
              <motion.button
                onClick={() => setIsHighlightsPanelOpen(!isHighlightsPanelOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  rotate: isHighlightsPanelOpen ? 0 : 180,
                }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer p-1 rounded-md transition-colors flex-shrink-0"
                aria-label={
                  isHighlightsPanelOpen ? "Hide highlights" : "Show highlights"
                }
              >
                <ChevronLeft
                  size={18}
                  className="text-neutral-700 dark:text-neutral-300"
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <div
        className="flex-1 w-full overflow-x-auto overflow-y-auto"
        ref={containerRef}
      >
        <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col items-center gap-4">
          {!pdf && (
            <div className="flex items-center justify-center gap-3 py-20">
              <SurfingLoading />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Loading document...
              </p>
            </div>
          )}

          {pdf &&
            initialPage - 1 > 0 &&
            initialPage - 1 < pdf._pdfInfo.numPages && (
              <div
                ref={(el) => {
                  pageRefs.current[initialPage - 1] = el;
                }}
              >
                <PDFPage
                  pdf={pdf}
                  pageNum={initialPage - 1 + 1}
                  scale={scale}
                  highlights={highlights[initialPage - 1] || []}
                  termColors={termColors}
                  isCurrentPage={false}
                  isKeywordResult={isKeywordResult}
                  shouldLoad={true}
                  pageDimensions={pageDimensions}
                  setPageDimensions={setPageDimensions}
                />
              </div>
            )}
          {pdf && (
            <div
              ref={(el) => {
                pageRefs.current[initialPage] = el;
              }}
            >
              <PDFPage
                pdf={pdf}
                pageNum={initialPage + 1}
                scale={scale}
                highlights={highlights[initialPage] || []}
                termColors={termColors}
                isCurrentPage={true}
                isKeywordResult={isKeywordResult}
                shouldLoad={true}
                pageDimensions={pageDimensions}
                setPageDimensions={setPageDimensions}
              />
            </div>
          )}
          {pdf &&
            initialPage - 1 > 0 &&
            initialPage - 1 < pdf._pdfInfo.numPages && (
              <div
                ref={(el) => {
                  pageRefs.current[initialPage + 1] = el;
                }}
              >
                <PDFPage
                  pdf={pdf}
                  pageNum={initialPage + 1 + 1}
                  scale={scale}
                  highlights={highlights[initialPage + 1] || []}
                  termColors={termColors}
                  isCurrentPage={false}
                  isKeywordResult={isKeywordResult}
                  shouldLoad={true}
                  pageDimensions={pageDimensions}
                  setPageDimensions={setPageDimensions}
                />
              </div>
            )}
        </div>
      </div>

      {pdf && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[rgb(32,32,32)] rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <span
            className={`${dmSans.className} text-sm text-neutral-700 dark:text-neutral-300 font-medium min-w-[60px]`}
          >
            {currentPage + 1} / {pdf.numPages}
          </span>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Zoom out"
          >
            <Minus
              className="text-neutral-600 dark:text-neutral-400"
              size={18}
            />
          </button>

          <span
            className={`${dmSans.className} text-sm text-neutral-700 dark:text-neutral-300 font-medium min-w-[50px] text-center`}
          >
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Zoom in"
          >
            <Plus
              className="text-neutral-600 dark:text-neutral-400"
              size={18}
            />
          </button>
        </div>
      )}
    </div>
  );
}

interface PDFPageProps {
  pdf: any;
  pageNum: number;
  scale: number;
  highlights: Highlight[];
  termColors: Record<string, string>;
  isCurrentPage: boolean;
  isKeywordResult: boolean;
  shouldLoad: boolean;
  pageDimensions: Map<number, any>;
  setPageDimensions: React.Dispatch<React.SetStateAction<Map<number, any>>>;
}

const PDFPage = ({
  pdf,
  pageNum,
  scale,
  highlights,
  termColors,
  isCurrentPage,
  isKeywordResult,
  shouldLoad,
  pageDimensions,
  setPageDimensions,
}: PDFPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [viewport, setViewport] = useState<any>(null);

  useEffect(() => {
    if (!shouldLoad) return;

    const cached = pageDimensions.get(pageNum);
    if (cached) {
      setViewport(cached);
      return;
    }

    const getPageDimensions = async () => {
      try {
        const page = await pdf.getPage(pageNum);
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const dpr = isMobile ? 2 : window.devicePixelRatio || 1;
        const vp = page.getViewport({ scale: scale * dpr });
        setViewport(vp);

        setPageDimensions((prev) => {
          const newMap = new Map(prev);
          newMap.set(pageNum, vp);
          return newMap;
        });
      } catch (error) {
        console.error(`Error loading page ${pageNum}:`, error);
      }
    };
    getPageDimensions();
  }, [pdf, pageNum, scale, shouldLoad, pageDimensions, setPageDimensions]);

  useEffect(() => {
    if (!shouldLoad || !viewport) return;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        await renderTaskRef.current.cancel();
      }

      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const dpr = isMobile ? 2 : window.devicePixelRatio || 1;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
        setIsRendered(true);
      } catch (error: any) {
        if (error.name !== "RenderingCancelledException") {
          console.error("Render error:", error);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdf, pageNum, scale, shouldLoad, viewport]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const dpr = isMobile ? 2 : window.devicePixelRatio || 1;
  const displayWidth = viewport ? viewport.width / dpr : 0;
  const displayHeight = viewport ? viewport.height / dpr : 0;

  if (!viewport) {
    const isMobileDevice =
      typeof window !== "undefined" && window.innerWidth < 768;
    const estimatedWidth = isMobileDevice
      ? (window.innerWidth - 48) * 0.9
      : 612 * scale;
    const estimatedHeight = estimatedWidth * (11 / 8.5);

    return (
      <div
        className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center"
        style={{
          width: `${estimatedWidth}px`,
          height: `${estimatedHeight}px`,
        }}
      >
        {shouldLoad && (
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            Loading page {pageNum}...
          </div>
        )}
      </div>
    );
  }

  if (!shouldLoad && viewport) {
    return (
      <div
        className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      />
    );
  }

  return (
    <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      {isRendered && highlights.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {highlights.map((h, i) => {
            const matchedTerm =
              isKeywordResult && h.base
                ? Object.keys(termColors).find((term) =>
                    h.base!.toLowerCase().includes(term.toLowerCase()),
                  )
                : undefined;
            const highlightColor = matchedTerm
              ? termColors[matchedTerm]
              : "rgba(0, 98, 255, 0.31)";

            const highlightScale = scale * (viewport.scale / (scale * dpr));
            
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${h.x * highlightScale}px`,
                  top: `${h.y * highlightScale}px`,
                  width: `${h.width * highlightScale}px`,
                  height: `${h.height * highlightScale}px`,
                  backgroundColor: highlightColor,
                  borderRadius: "2px",
                }}
              />
            );
          })}
        </div>
      )}
      {isKeywordResult && highlights.length > 0 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded">
          {highlights.length}
        </div>
      )}
    </div>
  );
};
