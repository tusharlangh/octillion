"use client";

import { useEffect, useState, useContext } from "react";
import { SidebarContext } from "../ConditionalLayout";
import { useFileUpload } from "../../hooks/useFileUpload";
import FilePreviewList from "./filePreviewList";
import FileUpload from "./fileUpload";
import { Libre_Baskerville } from "next/font/google";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { useRouter } from "next/navigation";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";
import { motion, AnimatePresence } from "framer-motion";
import { DM_Sans } from "next/font/google";
import { Info } from "lucide-react";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function FileManager() {
  const {
    selectedFiles,
    fileInputRef,
    handleButtonClick,
    handleFileChange,
    removeFile,
    setSelectedFiles,
  } = useFileUpload();
  const context = useContext(SidebarContext);
  if (!context) throw new Error("SidebarContext is not working");
  const { setNotis } = context;
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function get() {
      setLoading(true);
      try {
        const jwt = await handleTokenAction();

        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-name`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          const errorMessage =
            data.error?.message ||
            data.error ||
            getErrorMessageByStatus(res.status);

          console.error("Getting name failed:", {
            status: res.status,
            error: errorMessage,
            details: data.error?.details,
          });

          setNotis({ message: errorMessage, type: "error" });

          if (res.status === 401 || res.status === 403) {
            setTimeout(() => router.replace("/login"), 2000);
          }

          return;
        }

        setText(data.data);
      } catch (error) {
        console.error("Getting name error: ", error);
      } finally {
        setLoading(false);
      }
    }

    get();
  }, []);

  return (
    <section className="flex flex-col justify-center items-center w-full">
      <div className="h-[50px] md:h-[60px] flex items-center justify-center px-4 pb-4">
        <AnimatePresence>
          {text && (
            <motion.p
              key="greeting"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.5,
              }}
              className={`${libreBaskerville.className} text-2xl md:text-3xl lg:text-4xl text-center`}
            >
              Hey {text.split(" ")[0]}! Start uploading files
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {selectedFiles.length === 0 ? (
        <FileUpload
          fileInputRef={fileInputRef}
          handleButtonClick={handleButtonClick}
          handleFileChange={handleFileChange}
        />
      ) : (
        <FilePreviewList
          selectedFiles={selectedFiles}
          removeFile={removeFile}
          setSelectedFiles={setSelectedFiles}
        />
      )}
      <div className={`pt-2 flex items-center gap-2 px-3`}>
        <Info
          className="text-black/60 dark:text-white/60"
          height={18}
          width={18}
        />
        <p
          className={`${dmSans.className} text-xs md:text-sm text-black/60 dark:text-white/60 pt-0.5`}
        >
          Only PDFs are allowed. Max 10 files, total size up to 100 MB
        </p>
      </div>
    </section>
  );
}
