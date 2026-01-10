"use client";

import { useEffect, useState, useRef } from "react";
import Portal from "../portal";
import { X, ExternalLink, Minus, Plus, Download } from "lucide-react";
import { DM_Sans } from "next/font/google";
import * as pdfjs from "pdfjs-dist";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  url: string;
  fileName: string;
}

export default function FileOpener({
  isOpen,
  setIsOpen,
  url,
  fileName,
}: ModalProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [scale, setScale] = useState<number>(1.5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadPdf = async () => {
        try {
          const loadingTask = pdfjs.getDocument(url);
          const loadedPdf = await loadingTask.promise;
          setPdf(loadedPdf);
        } catch (error) {
          console.error("Error loading PDF:", error);
        }
      };
      loadPdf();
    }

    return () => {
      if (pdf) {
        pdf.destroy();
        setPdf(null);
      }
    };
  }, [isOpen, url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

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
          setCurrentPage(i + 1);
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

  return (
    <div>
      {isOpen && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white dark:bg-[#191919] rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-lg border border-neutral-200 dark:border-neutral-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2
                  className={`${dmSans.className} text-lg font-medium text-neutral-900 dark:text-neutral-100 truncate flex-1 pr-4`}
                >
                  {fileName}
                </h2>

                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    download={fileName}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    aria-label="Download"
                  >
                    <Download size={18} />
                  </a>

                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    aria-label="Open in new tab"
                  >
                    <ExternalLink size={18} />
                  </a>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-900"
                ref={containerRef}
              >
                <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col items-center gap-4">
                  {!pdf && (
                    <div className="flex items-center justify-center py-20">
                      <p
                        className={`${dmSans.className} text-sm text-neutral-500 dark:text-neutral-400`}
                      >
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
                        <PDFPage pdf={pdf} pageNum={i + 1} scale={scale} />
                      </div>
                    ))}
                </div>
              </div>

              {pdf && (
                <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
                  <span
                    className={`${dmSans.className} text-sm text-neutral-700 dark:text-neutral-300 font-medium min-w-[60px]`}
                  >
                    {currentPage} / {pdf.numPages}
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
          </div>
        </Portal>
      )}
    </div>
  );
}

interface PDFPageProps {
  pdf: any;
  pageNum: number;
  scale: number;
}

const PDFPage = ({ pdf, pageNum, scale }: PDFPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  return (
    <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-800">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
