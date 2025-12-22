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

export default function SmartPDFViewer({
  url,
  fileName,
  highlights,
  initialPage,
  onClose,
}: SmartPDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewport, setViewport] = useState<any>(null);

  useEffect(() => {
    if (initialPage) {
      const p = parseInt(initialPage.split(".")[1], 10);
      if (!isNaN(p)) setPageNum(p);
    }
  }, [initialPage]);

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjs.getDocument(url);
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
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      const page = await pdf.getPage(pageNum);
      const newViewport = page.getViewport({ scale });
      setViewport(newViewport);

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = newViewport.height;
      canvas.width = newViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: newViewport,
      };

      await page.render(renderContext).promise;
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pdf && pageNum < pdf.numPages) setPageNum(pageNum + 1);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-[1000] p-4 md:p-10 font-[family-name:--font-dm-sans]">
        <div className="w-full max-w-5xl flex justify-between items-center mb-4 text-white">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold truncate max-w-md">
              {fileName}
            </h2>
            <p className="text-sm text-neutral-400">
              Page {pageNum} of {pdf?.numPages || "?"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex bg-neutral-900/80 border border-neutral-800 rounded-full px-6 py-2 gap-6 mb-6 items-center shadow-2xl backdrop-blur-sm">
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={pageNum <= 1}
              className="p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={pdf && pageNum >= pdf.numPages}
              className="p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex gap-2">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ZoomOut size={20} className="text-white" />
            </button>
            <span className="text-white text-sm font-medium w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(3, s + 0.25))}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ZoomIn size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 w-full flex justify-center overflow-auto scrollbar-hide">
          <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} />

            {viewport && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ width: viewport.width, height: viewport.height }}
              >
                {highlights.map((h, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: h.x * scale,
                        top: h.y * scale,
                        width: h.width * scale,
                        height: h.height * scale,
                        backgroundColor: "rgba(255, 220, 0, 0.4)",
                        mixBlendMode: "multiply",
                        borderRadius: "2px",
                        borderBottom: "2px solid rgba(255, 150, 0, 0.6)",
                      }}
                    />
                  );
                })}
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-300 border-t-neutral-900" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
