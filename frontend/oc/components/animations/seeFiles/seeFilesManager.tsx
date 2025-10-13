"use client";

import { motion, AnimatePresence } from "framer-motion";
import SeeFiles from "./seeFiles";
import Image from "next/image";
import { useState } from "react";

export default function SeeFilesManager() {
  const [openSeeFiles, setOpenSeeFiles] = useState<boolean>(false);
  return (
    <AnimatePresence initial={false} mode="wait">
      {openSeeFiles ? (
        <SeeFiles key="seeFiles" setOpenSeeFiles={setOpenSeeFiles} />
      ) : (
        <motion.div
          key="folderButton"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.1,
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
