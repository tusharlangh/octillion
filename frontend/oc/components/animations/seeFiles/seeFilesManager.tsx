"use client";

import { motion, AnimatePresence } from "framer-motion";
import SeeFiles from "./seeFiles";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SeeFileManagerProps {
  id: string;
}

export default function SeeFilesManager({ id }: SeeFileManagerProps) {
  const [openSeeFiles, setOpenSeeFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    async function get() {
      try {
        const query = new URLSearchParams({ id: id });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-files/?${query}`,
          {
            method: "GET",
            headers: { method: "application/json" },
          }
        );

        const data = await res.json();

        setFiles(data.data);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    if (openSeeFiles) {
      get();
    }
  }, [openSeeFiles]);

  return (
    <AnimatePresence initial={false} mode="wait">
      {openSeeFiles ? (
        <SeeFiles
          key="seeFiles"
          setOpenSeeFiles={setOpenSeeFiles}
          files={files}
        />
      ) : (
        <motion.div
          key="folderButton"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.1,
            ease: "linear",
          }}
          className="rounded-full bg-[rgb(46,38,37)] h-[50px] w-[50px] cursor-pointer flex justify-center items-center hover:bg-[#463A3A] hover:border-[#504343] border-1 border-[rgb(46,38,37)] hover:border-[#504343] transition-all"
          onClick={() => setOpenSeeFiles(true)}
        >
          <Image
            src="/icons/folder.svg"
            alt="folder-icon"
            height={26}
            width={26}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
