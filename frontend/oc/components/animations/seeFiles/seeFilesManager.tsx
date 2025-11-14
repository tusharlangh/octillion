"use client";

import { motion, AnimatePresence } from "framer-motion";
import SeeFiles from "./seeFiles";
import Image from "next/image";
import { useEffect, useState } from "react";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { useRouter } from "next/navigation";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";

interface SeeFileManagerProps {
  id: string;
}

export default function SeeFilesManager({ id }: SeeFileManagerProps) {
  const [openSeeFiles, setOpenSeeFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<Record<string, any>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function get() {
      if (!id) {
        setError("Id not found");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const jwt = await handleTokenAction();
        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }

        const query = new URLSearchParams({ id: id });

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

        if (!res.ok) {
          const errorMessage =
            data.error?.message ||
            data.error ||
            getErrorMessageByStatus(res.status);

          console.error("Getting file failed:", {
            status: res.status,
            error: errorMessage,
            details: data.error?.details,
          });

          setError(errorMessage);

          if (res.status === 401 || res.status === 403) {
            setTimeout(() => router.replace("/login"), 2000);
          }

          return;
        }

        setFiles(data.data);
      } catch (error) {
        console.error("Getting a file error: ", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
          setError("Network error. Please check your connection.");
        } else if (error instanceof Error && error.message.includes("token")) {
          setError("Authentication failed. Please log in again.");
          setTimeout(() => router.replace("/login"), 2000);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
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
