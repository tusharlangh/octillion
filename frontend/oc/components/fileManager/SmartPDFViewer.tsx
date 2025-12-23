"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import Portal from "../portal";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SmartPDFViewerProps {
  url: string;
  fileName: string;
  highlights: { x: number; y: number; width: number; height: number }[];
  initialPage?: string;
  onClose: () => void;
}

interface PDFPageProps {
  pdf: any;
  pageNum: number;
  scale: number;
  highlights?: { x: number; y: number; width: number; height: number }[];
  onVisible: (pageNum: number) => void;
}

const PDFPage = ({
  pdf,
  pageNum,
  scale,
  highlights,
  onVisible,
}: PDFPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<any>(null);
  const [baseDimensions, setBaseDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible(pageNum);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [pageNum, onVisible]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        const page = await pdf.getPage(pageNum);

        // Get unscaled viewport to establish the coordinate system baseline
        const unscaledViewport = page.getViewport({ scale: 1 });
        setBaseDimensions({
          width: unscaledViewport.width,
          height: unscaledViewport.height,
        });

        const newViewport = page.getViewport({ scale });
        setViewport(newViewport);

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(newViewport.width * outputScale);
        canvas.height = Math.floor(newViewport.height * outputScale);
        canvas.style.width = Math.floor(newViewport.width) + "px";
        canvas.style.height = Math.floor(newViewport.height) + "px";

        const renderContext = {
          canvasContext: context,
          viewport: newViewport,
          transform:
            outputScale !== 1
              ? [outputScale, 0, 0, outputScale, 0, 0]
              : undefined,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  return (
    <div
      ref={containerRef}
      className="relative mb-8 shadow-2xl rounded-lg overflow-hidden bg-white shrink-0"
      id={`page-${pageNum}`}
    >
      <canvas ref={canvasRef} />
      {viewport && baseDimensions && highlights && highlights.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {highlights.map((h, i) => {
            const height = h.height || 12;
            const width = h.width || 0;

            // Normalize coordinates to percentages
            // We use the base unscaled dimensions to calculate valid percentages
            // regardless of the current zoom level.
            const leftPct = (h.x / baseDimensions.width) * 100;

            // Assuming h.y is the bottom coordinate based on previous logic (y - height)
            // If h.y is top: remove the subtraction. Keeping logic consistent with previous version.
            const topPct = ((h.y - height) / baseDimensions.height) * 100;

            const widthPct = (width / baseDimensions.width) * 100;
            const heightPct = (height / baseDimensions.height) * 100;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  backgroundColor: "rgba(255, 215, 0, 0.4)",
                  mixBlendMode: "multiply",
                  borderRadius: "2px",
                  borderBottom: "1.5px solid rgba(255, 160, 0, 0.5)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function SmartPDFViewer({
  url,
  fileName,
  highlights,
  initialPage,
  onClose,
}: SmartPDFViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const targetPage = initialPage ? parseInt(initialPage.split(".")[1], 10) : 1;

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjs.getDocument({
          url,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });
        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [url]);

  useEffect(() => {
    if (pdf && !loading && targetPage > 0) {
      setTimeout(() => {
        const pageEl = document.getElementById(`page-${targetPage}`);
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  }, [pdf, loading, targetPage]);

  const handlePrevPage = () => {
    const prev = Math.max(1, pageNum - 1);
    document
      .getElementById(`page-${prev}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNextPage = () => {
    const next = Math.min(pdf?.numPages || 1, pageNum + 1);
    document
      .getElementById(`page-${next}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center z-[1000] font-[family-name:--font-dm-sans]">
        <div className="w-full max-w-6xl flex justify-between items-center p-4 md:p-6 text-white shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold truncate max-w-md">
              {fileName}
            </h2>
            <p className="text-sm text-neutral-400">
              Page {pageNum} of {pdf?.numPages || "?"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-neutral-900/80 border border-neutral-800 rounded-full px-4 py-1.5 gap-4 items-center shadow-2xl backdrop-blur-sm">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-neutral-400 hover:text-white"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white text-xs font-medium w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(4, s + 0.25))}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-neutral-400 hover:text-white"
              >
                <ZoomIn size={18} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        <div
          className="flex-1 w-full overflow-y-auto px-4 md:px-10 pb-20 scroll-smooth scrollbar-thin scrollbar-thumb-neutral-700"
          ref={scrollContainerRef}
        >
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            {pdf &&
              Array.from({ length: pdf.numPages }, (_, i) => (
                <PDFPage
                  key={i + 1}
                  pdf={pdf}
                  pageNum={i + 1}
                  scale={scale}
                  onVisible={setPageNum}
                  highlights={i + 1 === targetPage ? highlights : []}
                />
              ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-700 border-t-white" />
            </div>
          )}
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex bg-neutral-900/90 border border-neutral-800 rounded-full px-6 py-3 gap-6 items-center shadow-2xl backdrop-blur-md z-[1001]">
          <button
            onClick={handlePrevPage}
            disabled={pageNum <= 1}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors cursor-pointer text-white text-sm"
          >
            <ChevronLeft size={20} />
            <span>Prev</span>
          </button>
          <div className="w-px h-6 bg-neutral-800" />
          <span className="text-white text-sm font-medium">
            Page {pageNum} / {pdf?.numPages || "?"}
          </span>
          <div className="w-px h-6 bg-neutral-800" />
          <button
            onClick={handleNextPage}
            disabled={pdf && pageNum >= pdf.numPages}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors cursor-pointer text-white text-sm"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Portal>
  );
}
