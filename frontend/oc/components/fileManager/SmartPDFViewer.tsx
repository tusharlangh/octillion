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
        pageRefs.current[initialPage]?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [pdf, initialPage]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center">
      <div className="w-full bg-neutral-900 text-white p-4 flex justify-between items-center shadow-md z-10">
        <h2 className="text-lg font-medium truncate max-w-2xl">{fileName}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-800 rounded px-2">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
              className="px-2 py-1 hover:text-blue-400"
            >
              -
            </button>
            <span className="text-sm min-w-[3ch] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(3, s + 0.25))}
              className="px-2 py-1 hover:text-blue-400"
            >
              +
            </button>
          </div>
          <button
            onClick={onClose}
            className="bg-white text-black px-4 py-1.5 rounded hover:bg-neutral-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>

      <div
        className="flex-1 w-full overflow-auto p-8 flex flex-col items-center gap-4"
        ref={containerRef}
      >
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
              />
            </div>
          ))}
      </div>
    </div>
  );
}

interface PDFPageProps {
  pdf: any;
  pageNum: number;
  scale: number;
  highlights: Highlight[];
}

const PDFPage = ({ pdf, pageNum, scale, highlights }: PDFPageProps) => {
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
    <div className="relative shadow-lg bg-white">
      <canvas ref={canvasRef} />
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
                backgroundColor: "rgba(255, 226, 52, 0.4)",
                mixBlendMode: "multiply",
                borderBottom: "2px solid rgba(255, 180, 0, 0.8)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
