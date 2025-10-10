"use client";

import Portal from "../portal";
import Image from "next/image";

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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-[#211717] px-6 py-4 rounded-[20px] w-[90vw] h-[80vh] md:w-[60vw] overflow-hidden relative">
              <section className="flex justify-between items-center">
                <h2
                  className={`${font} text-[20px] md:text-[30px] font-bold truncate w-3/4 text-white`}
                >
                  {fileName}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[rgb(42,35,35)] opacity-70 hover:opacity-100 transition-all cursor-pointer"
                >
                  <Image
                    src={"/icons/close.svg"}
                    alt="close-icon"
                    height={30}
                    width={30}
                  />
                </button>
              </section>
              <section className="mt-8 md:mt-4 bg-white h-full w-full ">
                <iframe src={url} className="h-full w-full"></iframe>
              </section>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
