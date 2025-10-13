"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface SeeFilesProps {
  setOpenSeeFiles: (value: boolean) => void;
}

export default function SeeFiles({ setOpenSeeFiles }: SeeFilesProps) {
  const font: string = "font-(family-name:--font-dm-sans)";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // if click target is outside the modal
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenSeeFiles(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenSeeFiles]);

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
      className="relative bg-[rgb(46,38,37)] px-8 py-3 rounded-[30px] flex flex-col justify-center items-center shrink-0"
    >
      <div>
        <div className="flex justify-start items-center gap-2 opacity-80">
          <Image
            src={"/icons/draft.svg"}
            height={14}
            width={14}
            alt="draft-icon"
          />
          <p
            className={`${font} text-[18px] md:text-[18px] font-medium text-white hover:underline cursor-pointer max-w-30 truncate`}
          >
            sample.pdf
          </p>
        </div>
        <div className="bg-[#463A3A] opacity-40 h-[1px] w-full my-1"></div>
        <div className="flex justify-start items-center gap-2 opacity-80">
          <Image
            src={"/icons/draft.svg"}
            height={14}
            width={14}
            alt="draft-icon"
          />
          <p
            className={`${font} text-[18px] md:text-[18px] font-medium text-white hover:underline cursor-pointer max-w-30 truncate`}
          >
            CMPUT 204 Topic 5 Heaps PQ Handout Fall 2025
          </p>
        </div>
      </div>
    </motion.div>
  );
}
