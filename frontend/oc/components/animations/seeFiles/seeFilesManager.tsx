"use client";

import { motion, AnimatePresence } from "framer-motion";
import SeeFiles from "./seeFiles";
import Image from "next/image";
import { useEffect, useState } from "react";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { useRouter } from "next/navigation";

interface SeeFileManagerProps {
  id: string;
}

export default function SeeFilesManager({ id }: SeeFileManagerProps) {
  const [openSeeFiles, setOpenSeeFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<Record<string, any>[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function get() {
      try {
        const query = new URLSearchParams({ id: id });
        const jwt = await handleTokenAction();

        console.log("jwt token: ", jwt);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-files/?${query}`,
          {
            method: "GET",
            headers: {
              method: "application/json",
              Authorization: `Bearer ${jwt}`,
            },
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
          className=""
          onClick={() => setOpenSeeFiles(true)}
        >
          <button
            className="cursor-pointer h-9 w-9 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.15)] transition-colors"
            aria-label="Menu"
          >
            <Image
              src="/icons/folder_light.svg"
              alt=""
              height={20}
              width={20}
              className="block dark:hidden"
            />
            <Image
              src="/icons/folder.svg"
              alt=""
              height={20}
              width={20}
              className="hidden dark:block"
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
