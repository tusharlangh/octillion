"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";

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
          block: "center"
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
        if (pageRect.top <= containerCenter && pageRect.bottom >= containerCenter) {
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
    <div className="fixed inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 z-50 flex flex-col items-center animate-in fade-in duration-200">
      {/* Header */}
      <div className="w-full border-b border-white/5 backdrop-blur-xl bg-white/[0.02] z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-base font-medium text-white/90 truncate">
                {fileName}
              </h2>
            </div>
            {pdf && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs font-medium text-white/60">
                  Page {currentPage + 1} of {pdf.numPages}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="px-3 py-1.5 hover:bg-white/10 rounded-md transition-all duration-200 text-white/70 hover:text-white text-sm font-medium"
                aria-label="Zoom out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-2 text-sm font-medium text-white/80 min-w-[52px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                className="px-3 py-1.5 hover:bg-white/10 rounded-md transition-all duration-200 text-white/70 hover:text-white text-sm font-medium"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white/90 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div
        className="flex-1 w-full overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        ref={containerRef}
      >
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center gap-6">
          {!pdf && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-12 h-12 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
              <p className="text-sm text-white/50 font-medium">Loading document...</p>
            </div>
          )}
          {pdf &&
            Array.from({ length: pdf.numPages }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                className="transition-all duration-300"
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

const PDFPage = ({ pdf, pageNum, scale, highlights, isCurrentPage }: PDFPageProps) => {
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
    <div className={`relative transition-all duration-500 ${
      isCurrentPage ? 'ring-2 ring-violet-500/30 shadow-2xl shadow-violet-500/10' : 'shadow-xl'
    } rounded-lg overflow-hidden bg-white`}>
      <canvas ref={canvasRef} className="block" />
      {isRendered && highlights.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="animate-in fade-in duration-500"
              style={{
                position: "absolute",
                left: `${h.x * scale}px`,
                top: `${h.y * scale}px`,
                width: `${h.width * scale}px`,
                height: `${h.height * scale}px`,
                background: "linear-gradient(120deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.2) 100%)",
                boxShadow: "inset 0 0 0 1px rgba(139, 92, 246, 0.1), 0 1px 3px rgba(139, 92, 246, 0.1)",
                borderRadius: "2px",
                animation: `highlight-pulse 2s ease-in-out ${i * 0.1}s`,
              }}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-[2px]"
                style={{
                  background: "linear-gradient(90deg, rgba(139, 92, 246, 0.4) 0%, rgba(167, 139, 250, 0.6) 50%, rgba(139, 92, 246, 0.4) 100%)",
                }}
              />
            </div>
          ))}
        </div>
      )}
      {highlights.length > 0 && (
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-violet-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg border border-violet-400/30">
          {highlights.length} {highlights.length === 1 ? 'match' : 'matches'}
        </div>
      )}
    </div>
  );
};
