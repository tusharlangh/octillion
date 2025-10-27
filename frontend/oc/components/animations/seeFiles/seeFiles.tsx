"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FileOpener from "@/components/fileManager/fileOpener";

interface SeeFilesProps {
  setOpenSeeFiles: (value: boolean) => void;
  files: Record<string, any>[];
}

export default function SeeFiles({ setOpenSeeFiles, files }: SeeFilesProps) {
  const font: string = "font-(family-name:--font-dm-sans)";
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenSeeFiles(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenSeeFiles]);

  const openPdf = (previewUrl: string, fileName: string) => {
    setIsOpen(true);
    setPreviewUrl(previewUrl);
    setFileName(fileName);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 280, // pulls faster
        damping: 13, // keeps bounce tight
        mass: 0.3, // lighter feel
      }}
      className="relative bg-[#1C1C1E] px-8 py-3 rounded-[30px] flex flex-col justify-center items-center shrink-0"
    >
      <ul>
        {files.map((file, i) => (
          <li key={i}>
            <div
              className="flex justify-start items-center gap-2 opacity-80"
              onClick={() => openPdf(file.presignedUrl, file.file_name)}
            >
              <Image
                src={"/icons/draft.svg"}
                height={14}
                width={14}
                alt="draft-icon"
              />
              <p
                className={`${font} text-[18px] md:text-[18px] font-medium text-white hover:underline cursor-pointer max-w-30 truncate`}
              >
                {file.file_name}
              </p>
            </div>
            {files.length - 1 !== i && (
              <div className="bg-[#463A3A] opacity-40 h-[1px] w-full my-1"></div>
            )}
          </li>
        ))}
      </ul>
      <FileOpener
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        url={previewUrl}
        fileName={fileName}
      />
    </motion.div>
  );
}
