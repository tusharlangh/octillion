"use client";

import React, { useContext, useState } from "react";
import FileItem from "./fileItem";
import FileOpener from "./fileOpener";
import { useRouter } from "next/navigation";
import FileUploadLoading from "./fileUploadLoading";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";
import { SidebarContext } from "../ConditionalLayout";

interface FilePreviewListProps {
  selectedFiles: File[];
  removeFile: (i: number) => void;
  setSelectedFiles: (v: File[]) => void;
}

export default function FilePreviewList({
  selectedFiles,
  removeFile,
  setSelectedFiles,
}: FilePreviewListProps) {
  if (selectedFiles.length === 0) {
    return <FileUploadLoading isOpen={true} />;
  }

  const context = useContext(SidebarContext);

  if (!context) throw new Error("queryContext is not working");

  const { setNotis, setSidebarKey } = context;

  const font: string = "font-(family-name:--font-dm-sans)";
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const openPDF = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    setIsOpen(true);
  };

  const sendPdfToS3 = async (uploadUrl: string, file: File) => {
    try {
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!res.ok) {
        const errorMessage = getErrorMessageByStatus(res.status);

        console.error("Upload failed:", {
          status: res.status,
          error: errorMessage,
          details: null,
        });

        setNotis({ message: errorMessage, type: "error" });

        if (res.status === 401 || res.status === 403) {
          setTimeout(() => router.replace("/login_signin/login"), 2000);
        }

        return {
          success: false,
          error: { status: res.status, message: errorMessage },
          fileName: file.name,
        };
      }
      return { success: true, error: null, filename: fileName };
    } catch (error) {
      return { success: false, error: error, filename: fileName };
    }
  };

  const sendPdf = async () => {
    if (selectedFiles.length === 0) {
      setNotis({
        message: "Please select at least one file to upload.",
        type: "error",
      });
      return;
    }

    if (selectedFiles.length > 10) {
      setNotis({ message: "Maximum 10 files allowed.", type: "error" });
      return;
    }

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

    if (totalSize > MAX_TOTAL_SIZE) {
      setNotis({ message: "Total file size exceeds 100MB.", type: "error" });
      return;
    }

    setNotis({
      message: "",
      type: "info",
    });
    setLoading(true);

    let keys: any;
    const jwt = await handleTokenAction();
    const id = crypto.randomUUID();

    try {
      if (!jwt) {
        throw new Error("Failed to get authentication token");
      }

      const files_metadata = selectedFiles.map((file, index) => ({
        name: file.name,
        type: file.type,
      }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-upload-urls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            id: id,
            files: files_metadata,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMessage =
          data.error?.message ||
          data.error ||
          getErrorMessageByStatus(res.status);

        console.error("Upload failed:", {
          status: res.status,
          error: errorMessage,
          details: data.error?.details,
        });

        setNotis({ message: errorMessage, type: "error" });

        if (res.status === 401 || res.status === 403) {
          setTimeout(() => router.replace("/login_signin/login"), 2000);
        }

        return;
      }

      const urls = data.data;
      keys = urls;

      const uploadRes = await Promise.allSettled(
        urls.map((url: { uploadUrl: string; key: string }, index: number) =>
          sendPdfToS3(url.uploadUrl, selectedFiles[index])
        )
      );

      const n = uploadRes.length;
      const failure = uploadRes.filter((item) => item.status === "rejected");

      const threshold = 0.5;

      const diff = failure.length / n;

      if (diff > threshold) {
        setNotis({
          message: "More than half of the files failed to upload. Try again",
          type: "error",
        });
        return;
      } else if (diff !== 0) {
        setNotis({
          message: `Following files have failed: ${failure}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setNotis({
          message: "Network error. Please check your connection.",
          type: "error",
        });
      } else if (error instanceof Error && error.message.includes("token")) {
        setNotis({
          message: "Authentication failed. Please log in again.",
          type: "error",
        });
        setTimeout(() => router.replace("/login_signin/login"), 2000);
      } else {
        setNotis({
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }

    try {
      const jwt = await handleTokenAction();
      if (!jwt) {
        throw new Error("Failed to get authentication token");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          id: id,
          keys: keys.map(
            (url: { uploadUrl: string; key: string }, index: number) => url.key
          ),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMessage =
          data.error?.message ||
          data.error ||
          getErrorMessageByStatus(res.status);

        console.error("Upload failed:", {
          status: res.status,
          error: errorMessage,
          details: data.error?.details,
        });

        setNotis({ message: errorMessage, type: "error" });

        if (res.status === 401 || res.status === 403) {
          setTimeout(() => router.replace("/login_signin/login"), 2000);
        }

        return;
      }

      setNotis({
        message:
          "The requested files are parsing. We will notify when the parsing finishes.",
        type: "info",
      });
      setSelectedFiles([]);

      setSidebarKey((prev: number) => prev + 1);
    } catch (error) {
      console.error("Upload error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setNotis({
          message: "Network error. Please check your connection.",
          type: "error",
        });
      } else if (error instanceof Error && error.message.includes("token")) {
        setNotis({
          message: "Authentication failed. Please log in again.",
          type: "error",
        });
        setTimeout(() => router.replace("/login_signin/login"), 2000);
      } else {
        setNotis({
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }

    pollProcessingStatus(id, jwt!);
  };

  const pollProcessingStatus = async (id: string, token: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        const query = new URLSearchParams({
          id: id,
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/parse-status/?${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to check status:", res.status);
          return;
        }

        const d = await res.json();
        const data = d.data;

        if (data.status === "PROCESSED") {
          setNotis({
            message: "Files have been successfully processed!",
            type: "success",
          });

          setSidebarKey((prev: number) => prev + 1);
          setTimeout(() => router.push(`/search/${id}`), 1000);

          return;
        } else if (data.status === "FAILED") {
          setNotis({
            message: "File processing failed. Please try again.",
            type: "error",
          });

          return;
        } else if (data.status === "PROCESSING") {
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000);
          } else {
            setNotis({
              message:
                "Processing is taking longer than expected. Check back later.",
              type: "info",
            });
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        }
      }
    };

    checkStatus();
  };

  return (
    <section className="relative mt-2 shrink-0 cursor-pointer">
      <div
        className="bg-white dark:bg-[rgb(18,18,18)] w-[90vw] md:w-[50vw] rounded-[20px] 
                   flex flex-col p-3 gap-2 
                   
                   border border-neutral-200/80 dark:border-neutral-800/80
                   transition-all duration-200"
      >
        <ul
          className="flex gap-4 md:gap-6 overflow-x-auto h-full pb-2
                      scrollbar-thin scrollbar-track-transparent
                      scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300
                      dark:scrollbar-thumb-neutral-800 dark:hover:scrollbar-thumb-neutral-700
                      transition-colors duration-200"
        >
          {selectedFiles.map((file, index) => (
            <li key={index} onClick={() => openPDF(file)}>
              <FileItem
                i={index}
                removeFile={removeFile}
                fileName={file.name}
                fileType={file.type.endsWith("pdf") ? "PDF" : "PDF"}
              />
            </li>
          ))}
        </ul>

        <FileOpener
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          url={previewUrl}
          fileName={fileName}
        />

        <div className="w-full justify-end flex mt-auto">
          <button
            className={`bg-neutral-900 dark:bg-white 
                       hover:bg-neutral-800 dark:hover:bg-neutral-100
                       active:bg-neutral-700 dark:active:bg-neutral-200
                       rounded-[20px] px-4 py-1.5
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => sendPdf()}
            disabled={loading}
          >
            <p
              className={`${font} text-[16px] text-white dark:text-neutral-900 
                         font-medium select-none tracking-wide`}
            >
              parse
            </p>
          </button>
        </div>
      </div>
      <FileUploadLoading isOpen={loading} />
    </section>
  );
}
