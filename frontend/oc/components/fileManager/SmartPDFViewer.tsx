"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { DM_Sans } from "next/font/google";
import { ChevronLeft, Highlighter, Minus, Plus, X } from "lucide-react";
import SurfingLoading from "../animations/surfingLoading";
import { motion } from "framer-motion";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [pdf, setPdf] = useState<any>(null);
  const [scale, setScale] = useState<number>(1.5);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isHighlightsPanelOpen, setIsHighlightsPanelOpen] =
    useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjs.getDocument(url);
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
    };
    loadPdf();
  }, [url]);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#191919] z-50 flex flex-col">
      <div className="w-full">
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
            animate={{ x: isHighlightsPanelOpen ? 0 : -100 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="absolute top-16 z-10 pl-3 py-2 pr-1 flex justify-center items-center gap-1.5 bg-[rgb(247,247,247)] dark:bg-[rgb(32,32,32)] rounded-r-xl mt-2 shadow-lg"
          >
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
                    className={`${dmSans.className} rounded-md text-xs text-neutral-700 dark:text-neutral-300`}
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
              className="cursor-pointer p-0.5 rounded-md transition-colors"
              aria-label={
                isHighlightsPanelOpen ? "Hide highlights" : "Show highlights"
              }
            >
              <ChevronLeft
                size={18}
                className="text-neutral-700 dark:text-neutral-300"
              />
            </motion.button>
          </motion.div>
        )}
      </div>

      <div className="flex-1 w-full overflow-auto" ref={containerRef}>
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
            Array.from({ length: pdf.numPages }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
              >
                <PDFPage
                  pdf={pdf}
                  pageNum={i + 1}
                  scale={scale}
                  highlights={highlights[i] || []}
                  termColors={termColors}
                  isCurrentPage={i === currentPage}
                  isKeywordResult={isKeywordResult}
                />
              </div>
            ))}
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
}

const PDFPage = ({
  pdf,
  pageNum,
  scale,
  highlights,
  termColors,
  isCurrentPage,
  isKeywordResult,
}: PDFPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * dpr });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({ canvasContext: ctx, viewport }).promise;
      setIsRendered(true);
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  useEffect(() => {
    console.log("highlights: ", highlights);
  }, []);

  return (
    <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      {isRendered && highlights.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {highlights.map((h, i) => {
            const matchedTerm =
              isKeywordResult && h.base
                ? Object.keys(termColors).find((term) =>
                    h.base!.toLowerCase().includes(term.toLowerCase())
                  )
                : undefined;
            const highlightColor = matchedTerm
              ? termColors[matchedTerm]
              : "rgba(0, 98, 255, 0.31)";

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${h.x * scale}px`,
                  top: `${h.y * scale}px`,
                  width: `${h.width * scale}px`,
                  height: `${h.height * scale}px`,
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
