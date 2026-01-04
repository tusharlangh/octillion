"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { DM_Sans } from "next/font/google";
import { Minus, Plus, X } from "lucide-react";

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
}

interface SmartPDFViewerProps {
  url: string;
  fileName: string;
  initialPage: number;
  highlights: Record<number, Highlight[]>;
  onClose: () => void;
}

export default function SmartPDFViewer({
  url,
  fileName,
  initialPage,
  highlights,
  onClose,
}: SmartPDFViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [scale, setScale] = useState<number>(1.5);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
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
        <div className="mx-2 md:mx-4 px-4 md:px-8 h-14 flex justify-between items-center bg-black/3 dark:bg-white/3 rounded-xl m-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2
              className={`${dmSans.className} text-sm md:text-md font-medium text-neutral-900 dark:text-neutral-100 truncate`}
            >
              {fileName}
            </h2>
            {pdf && (
              <span
                className={`${dmSans.className} text-xs text-neutral-500 dark:text-neutral-400`}
              >
                {currentPage + 1} of {pdf.numPages}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-black/3 dark:bg-white/3 p-1 gap-1">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="p-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md cursor-pointer"
                aria-label="Zoom out"
              >
                <Minus className="text-neutral-500" size={16} />
              </button>
              <span
                className={`${dmSans.className} px-3 text-xs text-neutral-600 dark:text-neutral-200 font-semibold bg-white dark:bg-black rounded-md p-1`}
              >
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                className="p-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md cursor-pointer"
                aria-label="Zoom in"
              >
                <Plus className="text-neutral-500" size={16} />
              </button>
            </div>

            <button
              onClick={onClose}
              className={`${dmSans.className} text-xs text-neutral-700 dark:text-neutral-300 rounded-lg cursor-pointer`}
            >
              <X className="text-neutral-500" size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-auto" ref={containerRef}>
        <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col items-center gap-4">
          {!pdf && (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
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
                  isCurrentPage={i === currentPage}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

interface PDFPageProps {
  pdf: any;
  pageNum: number;
  scale: number;
  highlights: Highlight[];
  isCurrentPage: boolean;
}

const PDFPage = ({
  pdf,
  pageNum,
  scale,
  highlights,
  isCurrentPage,
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

  return (
    <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      {isRendered && highlights.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {highlights.map((h, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${h.x * scale}px`,
                top: `${h.y * scale}px`,
                width: `${h.width * scale}px`,
                height: `${h.height * scale}px`,
                backgroundColor: "rgba(0, 98, 255, 0.31)",
                borderRadius: "2px",
              }}
            />
          ))}
        </div>
      )}
      {highlights.length > 0 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded">
          {highlights.length}
        </div>
      )}
    </div>
  );
};
