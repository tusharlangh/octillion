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
            <div className="bg-white dark:bg-[rgb(18,18,18)] px-6 py-4 rounded-[20px] w-[90vw] h-[80vh] md:w-[60vw] overflow-hidden relative">
              <section className="flex justify-between items-center">
                <h2
                  className={`${font} text-[20px] md:text-[30px] font-bold truncate w-3/4 text-black dark:text-white`}
                >
                  {fileName}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-transparent hover:bg-[rgba(0, 0, 0, 0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(0, 0, 0, 0.12)] dark:active:bg-[rgba(255,255,255,0.12)] transition-all cursor-pointer"
                >
                  <X className="text-black dark:text-white" size={26} />
                </button>
              </section>
              <section className="mt-8 md:mt-4 bg-white dark:bg-white h-full w-full ">
                <iframe src={url} className="h-full w-full"></iframe>
              </section>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
