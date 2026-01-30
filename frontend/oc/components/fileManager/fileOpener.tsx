"use client";

import Portal from "../portal";
import { X } from "lucide-react";

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
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <div>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-100">
            <div className="bg-white dark:bg-[rgb(18,18,18)] px-6 py-4 rounded-[20px] w-[90vw] h-[80vh] md:w-[60vw] flex flex-col relative max-h-[80vh]">
              <section className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2
                  className={`${font} text-[20px] md:text-[30px] font-bold truncate w-3/4 text-black dark:text-white`}
                >
                  {fileName}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-transparent hover:bg-[rgba(0, 0, 0, 0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(0, 0, 0, 0.12)] dark:active:bg-[rgba(255,255,255,0.12)] transition-all cursor-pointer"
                >
                  <X className="text-black dark:text-white" size={24} />
                </button>
              </section>
              <section
                className="bg-white dark:bg-white w-full overflow-y-auto overflow-x-hidden flex-1 relative"
                style={{
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <iframe
                  src={url}
                  className="w-full border-0"
                  style={{
                    height: "100vh",
                    minHeight: "100vh",
                  }}
                  title={fileName}
                ></iframe>
              </section>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
